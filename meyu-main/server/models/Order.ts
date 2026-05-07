import mongoose, { Schema, type InferSchemaType } from "mongoose";

const orderedProductSchema = new Schema(
  {
    productId: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    customization: { type: Schema.Types.Mixed, default: null },
  },
  { _id: true },
);

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    products: {
      type: [orderedProductSchema],
      required: true,
      validate: [(value: unknown[]) => value.length > 0, "Order requires at least one product"],
    },
    totalAmount: { type: Number, required: true, min: 0, index: true },
    address: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true, default: "" },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };

export const OrderModel =
  (mongoose.models.Order as mongoose.Model<OrderDocument>) ||
  mongoose.model<OrderDocument>("Order", orderSchema);
