import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getProduct, type Product } from "@/lib/catalog";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  ShopContext,
  type AddressForm,
  type AuthUser,
  type CartItem,
  type CheckoutDraft,
  type OrderRecord,
  type ProductCustomization,
  type Profile,
  type ShopState,
} from "@/lib/shop-context-store";

const CHECKOUT_KEY = "meyu.checkout.v2";
const CUSTOMIZATION_KEY = "meyu.customizations.v2";

type AuthResult = { ok: true } | { ok: false; error: string };

type ApiCartProduct = {
  _id?: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  quantity: number;
  price: number;
  customization?: ProductCustomization | null;
};

type ApiOrder = {
  _id?: string;
  id?: string;
  createdAt: string;
  totalAmount: number;
  orderStatus?: string;
  status?: string;
  paymentStatus?: string;
  products?: Array<{
    _id?: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    customization?: ProductCustomization | null;
  }>;
  items?: OrderRecord["items"];
  address: AddressForm;
};

type SessionPayload = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    isVerified: boolean;
    role: "user" | "admin";
    createdAt: string;
  } | null;
  cart: ApiCartProduct[];
  wishlist: string[];
  orders: ApiOrder[];
  message?: string;
  otpPreview?: string;
};

const emptyAddress = (): AddressForm => ({
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
});

const emptyDraft = (): CheckoutDraft => ({
  step: "cart",
  mode: "cart",
  items: [],
  address: emptyAddress(),
  paymentMethod: "cod",
});

function loadCheckoutDraft(): CheckoutDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY);
    if (!raw) return emptyDraft();
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return emptyDraft();
  }
}

function loadCustomizations(): ProductCustomization[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOMIZATION_KEY);
    return raw ? (JSON.parse(raw) as ProductCustomization[]) : [];
  } catch {
    return [];
  }
}

function toProduct(snapshot: ApiCartProduct): Product {
  const existing = getProduct(snapshot.productId);
  if (existing) return existing;
  return {
    id: snapshot.productId,
    name: snapshot.name,
    brand: snapshot.brand,
    price: snapshot.price,
    image: snapshot.image,
    category: snapshot.category,
    gender: snapshot.productId.startsWith("m-") ? "men" : "women",
  };
}

function mapCart(products: ApiCartProduct[]): CartItem[] {
  return products.map((item) => ({
    id: item._id ?? `${item.productId}-${item.quantity}`,
    product: toProduct(item),
    qty: item.quantity,
    customization: item.customization ?? null,
  }));
}

function mapProfile(user: SessionPayload["user"]): Profile | null {
  if (!user) return null;
  const mapped: AuthUser = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    full_name: user.name,
    isVerified: user.isVerified,
    role: user.role,
    created_at: user.createdAt,
  };
  return mapped;
}

function mapOrders(orders: ApiOrder[]): OrderRecord[] {
  return orders.map((order) => ({
    id: order.id ?? order._id ?? crypto.randomUUID(),
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    status: order.status ?? order.orderStatus ?? "pending",
    paymentMethod: order.paymentStatus ?? "pending",
    items:
      order.items ??
      (order.products ?? []).map((item) => ({
        id: item._id ?? item.productId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization ?? null,
      })),
    address: { ...emptyAddress(), ...order.address },
  }));
}

async function getSessionPayload() {
  return apiRequest<SessionPayload>("/auth/session");
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState("/account");
  const [otpRequestMeta, setOtpRequestMeta] = useState<{
    identifier: string;
    mode: "login" | "signup";
  } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customizations, setCustomizations] = useState<ProductCustomization[]>([]);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>(emptyDraft());
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const applySession = (payload: SessionPayload) => {
    const mappedProfile = mapProfile(payload.user);
    setUser(mappedProfile);
    setProfile(mappedProfile);
    setCart(mapCart(payload.cart ?? []));
    setWishlist(payload.wishlist ?? []);
    setOrders(mapOrders(payload.orders ?? []));
  };

  const refreshSession = useCallback(async () => {
    try {
      const payload = await getSessionPayload();
      applySession(payload);
    } catch (error) {
      console.error(error);
      setUser(null);
      setProfile(null);
      setCart([]);
      setWishlist([]);
      setOrders([]);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const refreshOrders = async () => {
    if (!user) return;
    try {
      const payload = await apiRequest<{ orders: ApiOrder[] }>("/orders");
      setOrders(mapOrders(payload.orders));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setCheckoutDraft(loadCheckoutDraft());
    setCustomizations(loadCustomizations());
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkoutDraft));
  }, [checkoutDraft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(customizations));
  }, [customizations]);

  const sendOtp: ShopState["sendOtp"] = async ({ identifier, name, phone, mode }) => {
    try {
      const response = await apiRequest<{ message: string; otpPreview?: string }>(
        "/auth/send-otp",
        {
          method: "POST",
          body: { identifier, name, phone },
        },
      );
      setOtpRequestMeta({ identifier, mode });
      toast.success("OTP sent", {
        description: response.otpPreview
          ? `Use ${response.otpPreview} for local testing.`
          : "Check your email or phone for the OTP.",
      });
      return { ok: true, otpPreview: response.otpPreview };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Unable to send OTP." };
    }
  };

  const verifyOtp: ShopState["verifyOtp"] = async ({ identifier, otp, name, phone }) => {
    try {
      const payload = await apiRequest<SessionPayload>("/auth/verify-otp", {
        method: "POST",
        body: { identifier, otp, name, phone },
      });
      applySession(payload);
      setLoginOpen(false);
      setOtpRequestMeta(null);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Unable to verify OTP." };
    }
  };

  const signOut = async () => {
    await apiRequest<{ message: string }>("/auth/logout", { method: "POST" }).catch(
      () => undefined,
    );
    setUser(null);
    setProfile(null);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setOtpRequestMeta(null);
    setCheckoutDraft(emptyDraft());
  };

  const requireAuthForAction = (redirectTo?: string) => {
    if (user) return true;
    setAuthRedirectTo(redirectTo ?? authRedirectTo);
    setLoginOpen(true);
    return false;
  };

  const addToCart = async (
    product: Product,
    qty = 1,
    customization?: ProductCustomization | null,
  ) => {
    if (!requireAuthForAction("/cart")) return;
    try {
      const response = await apiRequest<{ products: ApiCartProduct[]; message: string }>("/cart", {
        method: "POST",
        body: {
          product: {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            image: product.image,
            category: product.category,
            quantity: qty,
            price: product.price,
            customization: customization ?? null,
          },
        },
      });
      setCart(mapCart(response.products));
      toast.success("Added to cart", {
        description: customization ? `${product.name} with customization` : product.name,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add item to cart.");
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    try {
      const response = await apiRequest<{ products: ApiCartProduct[] }>(`/cart/${id}`, {
        method: "DELETE",
      });
      setCart(mapCart(response.products));
    } catch (error) {
      console.error(error);
    }
  };

  const updateQty = async (id: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(id);
      return;
    }
    try {
      const response = await apiRequest<{ products: ApiCartProduct[] }>("/cart", {
        method: "PATCH",
        body: { itemId: id, quantity: qty },
      });
      setCart(mapCart(response.products));
    } catch (error) {
      console.error(error);
    }
  };

  const clearCart = async () => {
    await Promise.all(cart.map((item) => removeFromCart(item.id)));
  };

  const beginCheckoutFromCart = () => {
    setCheckoutDraft((prev) => ({
      ...prev,
      step: "cart",
      mode: "cart",
      items: cart,
    }));
  };

  const beginBuyNow = (product: Product, customization?: ProductCustomization | null) => {
    setCheckoutDraft((prev) => ({
      ...prev,
      step: "address",
      mode: "buy_now",
      items: [
        {
          id: crypto.randomUUID(),
          product,
          qty: 1,
          customization: customization ?? null,
        },
      ],
    }));
  };

  const updateCheckoutDraft = (patch: Partial<CheckoutDraft>) => {
    setCheckoutDraft((prev) => ({ ...prev, ...patch }));
  };

  const resetCheckoutDraft = () => setCheckoutDraft(emptyDraft());

  const placeOrder = async () => {
    if (!user) return { ok: false as const, error: "Please log in to place your order." };
    if (checkoutDraft.items.length === 0) {
      return { ok: false as const, error: "Your checkout is empty." };
    }

    try {
      const response = await apiRequest<{ order: ApiOrder; message: string }>("/orders", {
        method: "POST",
        body: {
          products: checkoutDraft.items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            image: item.product.image,
            category: item.product.category,
            quantity: item.qty,
            price: item.product.price,
            customization: item.customization ?? null,
          })),
          totalAmount: checkoutDraft.items.reduce(
            (sum, item) => sum + item.product.price * item.qty,
            0,
          ),
          address: checkoutDraft.address,
          paymentStatus: "pending",
          orderStatus: "pending",
        },
      });

      setOrders((prev) => [...mapOrders([response.order]), ...prev]);
      setCart([]);
      setCheckoutDraft((prev) => ({ ...prev, step: "summary" }));
      toast.success("Order confirmed", { description: response.message });
      return { ok: true as const, orderId: response.order.id ?? response.order._id ?? "" };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Unable to place order.",
      };
    }
  };

  const saveCustomization: ShopState["saveCustomization"] = async (productId, input) => {
    const now = new Date().toISOString();
    const customization: ProductCustomization = {
      id: input.id ?? crypto.randomUUID(),
      productId,
      name: input.name,
      baseColor: input.baseColor,
      layers: input.layers,
      createdAt: now,
      updatedAt: now,
    };

    setCustomizations((prev) => {
      const filtered = prev.filter((item) => item.id !== customization.id);
      return [customization, ...filtered];
    });

    return customization;
  };

  const getCustomization = (productId: string) =>
    customizations.find((item) => item.productId === productId) ?? null;

  const setActiveCustomizationForCheckout = (customization: ProductCustomization) => {
    setCheckoutDraft((prev) =>
      prev.items.length === 0
        ? prev
        : {
            ...prev,
            items: [{ ...prev.items[0], customization }, ...prev.items.slice(1)],
          },
    );
  };

  const toggleWishlist = async (product: Product) => {
    if (!requireAuthForAction("/account")) return;
    try {
      const exists = wishlist.includes(product.id);
      const response = exists
        ? await apiRequest<{ wishlist: string[] }>(`/wishlist/${product.id}`, { method: "DELETE" })
        : await apiRequest<{ wishlist: string[] }>("/wishlist", {
            method: "POST",
            body: { productId: product.id },
          });
      setWishlist(response.wishlist);
      toast.success(exists ? "Removed from wishlist" : "Saved to wishlist", {
        description: product.name,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update wishlist.");
    }
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  const removeFromWishlist = async (id: string) => {
    if (!user) return;
    try {
      const response = await apiRequest<{ wishlist: string[] }>(`/wishlist/${id}`, {
        method: "DELETE",
      });
      setWishlist(response.wishlist);
    } catch (error) {
      console.error(error);
    }
  };

  const value: ShopState = {
    user,
    profile,
    authReady,
    authRedirectTo,
    setAuthRedirectTo,
    otpRequestMeta,
    sendOtp,
    verifyOtp,
    signOut,
    cart,
    wishlist,
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
    cartTotal: cart.reduce((sum, item) => sum + item.qty * item.product.price, 0),
    customizations,
    orders,
    checkoutDraft,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    beginCheckoutFromCart,
    beginBuyNow,
    updateCheckoutDraft,
    resetCheckoutDraft,
    placeOrder,
    saveCustomization,
    getCustomization,
    setActiveCustomizationForCheckout,
    toggleWishlist,
    isWishlisted,
    removeFromWishlist,
    cartOpen,
    setCartOpen,
    wishlistOpen,
    setWishlistOpen,
    searchOpen,
    setSearchOpen,
    loginOpen,
    setLoginOpen,
    refreshSession,
    refreshOrders,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
