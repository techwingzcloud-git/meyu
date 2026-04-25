import { connectToDatabase } from "./db";
import { CartModel } from "./models/Cart";
import { OrderModel } from "./models/Order";
import { OtpCodeModel } from "./models/OtpCode";
import { UserModel } from "./models/User";
import {
  createOtpHash,
  generateOtpCode,
  hashOtp,
  normalizeIdentifier,
  signSessionToken,
  verifySessionToken,
} from "./utils";
import type { JwtPayload } from "./utils";
import type { UserDocument } from "./models/User";
import { serverProducts } from "./data/products";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_REQUEST_WINDOW_MS = 15 * 60 * 1000;
const OTP_MAX_REQUESTS = 5;
const OTP_MAX_ATTEMPTS = 5;

function getDisplayName(input?: { name?: string; email?: string | null; phone?: string | null }) {
  if (input?.name?.trim()) return input.name.trim();
  if (input?.email) return input.email.split("@")[0];
  if (input?.phone) return `User ${input.phone.slice(-4)}`;
  return "MEYU Customer";
}

export async function sendOtp(input: { identifier: string; name?: string; phone?: string }) {
  await connectToDatabase();
  const normalized = normalizeIdentifier(input.identifier);
  const now = new Date();
  const existing = await OtpCodeModel.findOne({ identifier: normalized.value });

  const requestCount =
    existing && now.getTime() - existing.requestWindowStartedAt.getTime() < OTP_REQUEST_WINDOW_MS
      ? existing.requestCount
      : 0;

  if (requestCount >= OTP_MAX_REQUESTS) {
    throw new Error("Too many OTP requests. Please wait before trying again.");
  }

  const otp = generateOtpCode();
  const { salt, codeHash } = createOtpHash(otp);

  const payload = {
    name: input.name?.trim() || null,
    email: normalized.type === "email" ? normalized.value : null,
    phone: normalized.type === "phone" ? normalized.value : input.phone?.trim() || null,
  };

  await OtpCodeModel.findOneAndUpdate(
    { identifier: normalized.value },
    {
      identifier: normalized.value,
      identifierType: normalized.type,
      codeHash,
      salt,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
      attempts: 0,
      requestCount: requestCount + 1,
      requestWindowStartedAt: requestCount > 0 && existing ? existing.requestWindowStartedAt : now,
      lastSentAt: now,
      payload,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return {
    message: "OTP sent successfully.",
    otpPreview: process.env.NODE_ENV === "production" ? undefined : otp,
  };
}

export async function verifyOtpAndLogin(input: {
  identifier: string;
  otp: string;
  name?: string;
  phone?: string;
}) {
  await connectToDatabase();
  const normalized = normalizeIdentifier(input.identifier);
  const record = await OtpCodeModel.findOne({ identifier: normalized.value });

  if (!record) throw new Error("OTP not found. Please request a new OTP.");
  if (record.expiresAt.getTime() < Date.now()) {
    await OtpCodeModel.deleteOne({ _id: record._id });
    throw new Error("OTP expired. Please request a new OTP.");
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("Too many invalid attempts. Please request a new OTP.");
  }

  const incomingHash = hashOtp(input.otp, record.salt);
  if (incomingHash !== record.codeHash) {
    record.attempts += 1;
    await record.save();
    throw new Error("Invalid OTP.");
  }

  const payload = record.payload ?? { name: null, email: null, phone: null };
  const email = payload.email ?? (normalized.type === "email" ? normalized.value : null);
  const phone =
    payload.phone ?? (normalized.type === "phone" ? normalized.value : input.phone?.trim() || null);

  let user = await UserModel.findOne({
    $or: [{ email: email ?? undefined }, { phone: phone ?? undefined }].filter(Boolean),
  });

  if (!user) {
    user = await UserModel.create({
      name: getDisplayName({ name: input.name ?? payload.name ?? undefined, email, phone }),
      email,
      phone,
      isVerified: true,
    });
    await CartModel.create({ userId: user._id, products: [] });
  } else {
    user.name = user.name || getDisplayName({ name: input.name ?? undefined, email, phone });
    user.email = user.email ?? email;
    user.phone = user.phone ?? phone;
    user.isVerified = true;
    await user.save();
    await CartModel.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, products: [] } },
      { upsert: true, new: true },
    );
  }

  await OtpCodeModel.deleteOne({ _id: record._id });

  const token = signSessionToken({ sub: user._id.toString(), role: user.role });
  const snapshot = await getSessionSnapshot(user);

  return { token, snapshot };
}

export async function resolveUserFromToken(token: string | null) {
  if (!token) return null;
  try {
    const payload = verifySessionToken(token) as JwtPayload;
    await connectToDatabase();
    return await UserModel.findById(payload.sub);
  } catch {
    return null;
  }
}

export async function getSessionSnapshot(user: UserDocument) {
  await connectToDatabase();
  const [cart, orders] = await Promise.all([
    CartModel.findOne({ userId: user._id }).lean(),
    OrderModel.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt,
    },
    cart: cart?.products ?? [],
    wishlist: user.wishlist ?? [],
    orders: orders.map((order: (typeof orders)[number]) => ({
      id: order._id.toString(),
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentStatus,
      items: order.products.map((item: (typeof order.products)[number]) => ({
        id: item._id?.toString?.() ?? item.productId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization ?? null,
      })),
      address: order.address,
    })),
  };
}

export async function getSearchResults(search: URLSearchParams) {
  await connectToDatabase();
  const q = search.get("q")?.trim().toLowerCase() ?? "";
  const category = search.get("category")?.trim().toLowerCase() ?? "";
  const minPrice = Number(search.get("minPrice") ?? 0);
  const maxPrice = Number(search.get("maxPrice") ?? Number.MAX_SAFE_INTEGER);
  const sort = search.get("sort") ?? "popularity";

  const popularityCounts = await OrderModel.aggregate<{ _id: string; total: number }>([
    { $unwind: "$products" },
    { $group: { _id: "$products.productId", total: { $sum: "$products.quantity" } } },
  ]);

  const popularityMap = new Map(
    popularityCounts.map((entry: { _id: string; total: number }) => [entry._id, entry.total]),
  );

  const filtered = serverProducts
    .filter((product) => {
      if (q) {
        const haystack =
          `${product.name} ${product.brand} ${product.category} ${product.gender}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (category && product.category.toLowerCase() !== category) return false;
      if (product.price < minPrice || product.price > maxPrice) return false;
      return true;
    })
    .map((product) => ({
      ...product,
      popularity: popularityMap.get(product.id) ?? 0,
    }));

  filtered.sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return b.popularity - a.popularity || a.price - b.price;
  });

  return filtered;
}
