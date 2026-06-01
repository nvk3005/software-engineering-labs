import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["activate", "reset"],
      required: true,
      index: true,
    },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true, versionKey: false },
);

otpSchema.index({ email: 1, otp: 1, purpose: 1 });

export const Otp = mongoose.model("Otp", otpSchema);
