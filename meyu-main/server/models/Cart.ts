import mongoose, { Schema, type InferSchemaType } from "mongoose";

const cartProductSchema = new Schema(
  {
    productId: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    customization: { type: Schema.Types.Mixed, default: null },
  },
  { _id: true },
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    products: { type: [cartProductSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

cartSchema.index({ userId: 1, "products.productId": 1 });

export type CartDocument = InferSchemaType<typeof cartSchema> & { _id: mongoose.Types.ObjectId };

export const CartModel =
  (mongoose.models.Cart as mongoose.Model<CartDocument>) ||
  mongoose.model<CartDocument>("Cart", cartSchema);
