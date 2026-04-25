import { z } from "zod";

export const otpSendSchema = z.object({
  identifier: z.string().min(3).max(120),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(20).optional(),
});

export const otpVerifySchema = z.object({
  identifier: z.string().min(3).max(120),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(20).optional(),
});

export const cartProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  image: z.string().min(1),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).default(1),
  customization: z.unknown().nullable().optional(),
});

export const addCartItemSchema = z.object({
  product: cartProductSchema,
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const wishlistSchema = z.object({
  productId: z.string().min(1),
});

export const orderAddressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional().default(""),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().min(1),
});

export const createOrderSchema = z.object({
  products: z.array(cartProductSchema).min(1),
  totalAmount: z.number().nonnegative(),
  address: orderAddressSchema,
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  orderStatus: z.enum(["pending", "shipped", "delivered"]).default("pending"),
});
