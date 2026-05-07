import mongoose, { Schema, type InferSchemaType } from "mongoose";

const otpCodeSchema = new Schema(
  {
    identifier: { type: String, required: true, trim: true },
    identifierType: { type: String, enum: ["email", "phone"], required: true },
    codeHash: { type: String, required: true },
    salt: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    requestCount: { type: Number, default: 1, min: 1 },
    requestWindowStartedAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true },
    payload: {
      name: { type: String, trim: true, default: null },
      email: { type: String, trim: true, lowercase: true, default: null },
      phone: { type: String, trim: true, default: null },
    },
  },
  {
    timestamps: true,
  },
);

otpCodeSchema.index({ identifier: 1 }, { unique: true });
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpCodeDocument = InferSchemaType<typeof otpCodeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OtpCodeModel =
  (mongoose.models.OtpCode as mongoose.Model<OtpCodeDocument>) ||
  mongoose.model<OtpCodeDocument>("OtpCode", otpCodeSchema);
