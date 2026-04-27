import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: { unique: true, sparse: true },
      validate: {
        validator: (value: string | null | undefined) =>
          !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Invalid email address",
      },
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true },
      validate: {
        validator: (value: string | null | undefined) => !value || /^\+?[1-9]\d{7,14}$/.test(value),
        message: "Invalid phone number",
      },
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    wishlist: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);
