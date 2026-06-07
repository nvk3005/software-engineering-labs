import mongoose from "mongoose";

const reviewImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true, trim: true },
    orderId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating phải là số nguyên từ 1 đến 5",
      },
    },
    comment: { type: String, required: true, trim: true, maxlength: 1200 },
    images: { type: [reviewImageSchema], default: [] },
    rewardPoints: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false, id: false },
);

reviewSchema.index({ userId: 1, orderId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
