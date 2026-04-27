import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectToDatabase } from "./db";
import { serverEnv } from "./config";
import {
  buildSecurityHeaders,
  clearSessionCookie,
  createSessionCookie,
  readAuthToken,
} from "./utils";
import {
  addCartItemSchema,
  createOrderSchema,
  otpSendSchema,
  otpVerifySchema,
  updateCartItemSchema,
  wishlistSchema,
} from "./validators";
import { CartModel } from "./models/Cart";
import { OrderModel } from "./models/Order";
import { UserModel } from "./models/User";
import {
  getSearchResults,
  getSessionSnapshot,
  resolveUserFromToken,
  sendOtp,
  verifyOtpAndLogin,
} from "./services";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: serverEnv.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalLimiter);

app.use(async (req, res, next) => {
  const token = readAuthToken(req.headers.cookie);
  const user = await resolveUserFromToken(token);
  res.locals.user = user;
  next();
});

function ok(
  res: express.Response,
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  const headers = buildSecurityHeaders(extraHeaders);
  headers.forEach((value: string, key: string) => res.setHeader(key, value));
  return res.status(status).json(data);
}

function requireUser(req: express.Request, res: express.Response) {
  const user = res.locals.user;
  if (!user) {
    ok(res, { error: "Unauthorized" }, 401);
    return null;
  }
  return user;
}

app.get("/api/health", async (_req, res) => {
  await connectToDatabase();
  ok(res, { ok: true });
});

app.post("/api/auth/send-otp", otpLimiter, async (req, res) => {
  try {
    const input = otpSendSchema.parse(req.body);
    const result = await sendOtp(input);
    ok(res, result);
  } catch (error) {
    ok(res, { error: error instanceof Error ? error.message : "Unable to send OTP." }, 400);
  }
});

app.post("/api/auth/verify-otp", otpLimiter, async (req, res) => {
  try {
    const input = otpVerifySchema.parse(req.body);
    const { token, snapshot } = await verifyOtpAndLogin(input);
    ok(res, { message: "Authentication successful.", ...snapshot }, 200, {
      "Set-Cookie": createSessionCookie(token),
    });
  } catch (error) {
    ok(res, { error: error instanceof Error ? error.message : "Unable to verify OTP." }, 400);
  }
});

app.get("/api/auth/session", async (_req, res) => {
  const user = res.locals.user;
  if (!user) {
    ok(res, { user: null, cart: [], wishlist: [], orders: [] });
    return;
  }
  const snapshot = await getSessionSnapshot(user);
  ok(res, snapshot);
});

app.post("/api/auth/logout", async (_req, res) => {
  ok(res, { message: "Logged out." }, 200, { "Set-Cookie": clearSessionCookie() });
});

app.get("/api/cart", async (_req, res) => {
  const user = requireUser(_req, res);
  if (!user) return;
  const cart = await CartModel.findOne({ userId: user._id }).lean();
  ok(res, { products: cart?.products ?? [] });
});

app.post("/api/cart", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const input = addCartItemSchema.parse(req.body);
    const cart = await CartModel.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, products: [] } },
      { upsert: true, new: true },
    );

    const existing = cart.products.find(
      (item: (typeof cart.products)[number]) =>
        item.productId === input.product.productId &&
        JSON.stringify(item.customization ?? null) ===
          JSON.stringify(input.product.customization ?? null),
    );

    if (existing) {
      existing.quantity += input.product.quantity;
    } else {
      cart.products.push(input.product);
    }

    await cart.save();
    ok(res, { products: cart.products, message: "Cart updated." });
  } catch (error) {
    ok(res, { error: error instanceof Error ? error.message : "Unable to update cart." }, 400);
  }
});

app.patch("/api/cart", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const input = updateCartItemSchema.parse(req.body);
    const cart = await CartModel.findOne({ userId: user._id });
    if (!cart) {
      ok(res, { error: "Cart not found." }, 404);
      return;
    }
    const item = cart.products.id(input.itemId);
    if (!item) {
      ok(res, { error: "Cart item not found." }, 404);
      return;
    }
    item.quantity = input.quantity;
    await cart.save();
    ok(res, { products: cart.products, message: "Quantity updated." });
  } catch (error) {
    ok(res, { error: error instanceof Error ? error.message : "Unable to update quantity." }, 400);
  }
});

app.delete("/api/cart/:itemId", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const cart = await CartModel.findOne({ userId: user._id });
  if (!cart) {
    ok(res, { products: [], message: "Cart cleared." });
    return;
  }
  cart.products = cart.products.filter(
    (item: (typeof cart.products)[number]) => item._id?.toString() !== req.params.itemId,
  ) as typeof cart.products;
  await cart.save();
  ok(res, { products: cart.products, message: "Item removed." });
});

app.get("/api/wishlist", async (_req, res) => {
  const user = requireUser(_req, res);
  if (!user) return;
  ok(res, { wishlist: user.wishlist ?? [] });
});

app.post("/api/wishlist", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const input = wishlistSchema.parse(req.body);
    await UserModel.updateOne({ _id: user._id }, { $addToSet: { wishlist: input.productId } });
    const updated = await UserModel.findById(user._id).lean();
    ok(res, { wishlist: updated?.wishlist ?? [], message: "Wishlist updated." });
  } catch (error) {
    ok(res, { error: error instanceof Error ? error.message : "Unable to update wishlist." }, 400);
  }
});

app.delete("/api/wishlist/:productId", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  await UserModel.updateOne({ _id: user._id }, { $pull: { wishlist: req.params.productId } });
  const updated = await UserModel.findById(user._id).lean();
  ok(res, { wishlist: updated?.wishlist ?? [], message: "Wishlist updated." });
});

app.get("/api/orders", async (_req, res) => {
  const user = requireUser(_req, res);
  if (!user) return;
  const orders = await OrderModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  ok(res, { orders });
});

app.post("/api/orders", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const input = createOrderSchema.parse(req.body);
    const order = await OrderModel.create({
      userId: user._id,
      ...input,
    });
    await CartModel.updateOne({ userId: user._id }, { $set: { products: [] } });
    ok(res, { order, message: "Order confirmed." }, 201);
  } catch (error) {
    ok(res, { error: error instanceof Error ? error.message : "Unable to place order." }, 400);
  }
});

app.get("/api/search", async (req, res) => {
  const results = await getSearchResults(new URLSearchParams(req.query as Record<string, string>));
  ok(res, { results });
});

app.get("/api/admin/users", async (_req, res) => {
  const user = requireUser(_req, res);
  if (!user) return;
  if (user.role !== "admin") {
    ok(res, { error: "Forbidden" }, 403);
    return;
  }
  const users = await UserModel.find().sort({ createdAt: -1 }).lean();
  ok(res, { users });
});

app.get("/api/admin/orders", async (_req, res) => {
  const user = requireUser(_req, res);
  if (!user) return;
  if (user.role !== "admin") {
    ok(res, { error: "Forbidden" }, 403);
    return;
  }
  const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
  ok(res, { orders });
});

app.use("/api/*path", (_req, res) => {
  ok(res, { error: "Not found" }, 404);
});

connectToDatabase()
  .then(() => {
    app.listen(serverEnv.API_PORT, () => {
      console.log(`MEYU API listening on http://localhost:${serverEnv.API_PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to start API server", error);
    process.exit(1);
  });
