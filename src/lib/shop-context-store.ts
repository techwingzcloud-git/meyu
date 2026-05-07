import { createContext } from "react";
import type { Product } from "@/lib/catalog";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  isVerified: boolean;
  role: "user" | "admin";
  created_at: string;
};

export type Profile = AuthUser;

export type CustomTextLayer = {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
};

export type CustomImageLayer = {
  id: string;
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CustomLayer = CustomTextLayer | CustomImageLayer;

export type ProductCustomization = {
  id: string;
  productId: string;
  name: string;
  baseColor: string;
  layers: CustomLayer[];
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  id: string;
  product: Product;
  qty: number;
  customization?: ProductCustomization | null;
};

export type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type PaymentMethod = "cod" | "upi" | "card";

export type CheckoutDraft = {
  step: "cart" | "address" | "payment" | "summary";
  mode: "cart" | "buy_now";
  items: CartItem[];
  address: AddressForm;
  paymentMethod: PaymentMethod;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  items: Array<{
    id: string;
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    customization?: ProductCustomization | null;
  }>;
  address: AddressForm;
};

type AuthResult = { ok: true } | { ok: false; error: string };

export type ShopState = {
  user: AuthUser | null;
  profile: Profile | null;
  authReady: boolean;
  authRedirectTo: string;
  setAuthRedirectTo: (value: string) => void;
  otpRequestMeta: { identifier: string; mode: "login" | "signup" } | null;
  sendOtp: (input: {
    identifier: string;
    name?: string;
    phone?: string;
    mode: "login" | "signup";
  }) => Promise<{ ok: boolean; error?: string; otpPreview?: string }>;
  verifyOtp: (input: {
    identifier: string;
    otp: string;
    name?: string;
    phone?: string;
  }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  customizations: ProductCustomization[];
  orders: OrderRecord[];
  checkoutDraft: CheckoutDraft;
  addToCart: (product: Product, qty?: number, customization?: ProductCustomization | null) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  beginCheckoutFromCart: () => void;
  beginBuyNow: (product: Product, customization?: ProductCustomization | null) => void;
  updateCheckoutDraft: (patch: Partial<CheckoutDraft>) => void;
  resetCheckoutDraft: () => void;
  placeOrder: () => Promise<{ ok: true; orderId: string } | { ok: false; error: string }>;
  saveCustomization: (
    productId: string,
    input: Omit<ProductCustomization, "id" | "productId" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ) => Promise<ProductCustomization>;
  getCustomization: (productId: string) => ProductCustomization | null;
  setActiveCustomizationForCheckout: (customization: ProductCustomization) => void;
  toggleWishlist: (p: Product) => void;
  isWishlisted: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  wishlistOpen: boolean;
  setWishlistOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
  refreshSession: () => Promise<void>;
  refreshOrders: () => Promise<void>;
};

export const ShopContext = createContext<ShopState | null>(null);
