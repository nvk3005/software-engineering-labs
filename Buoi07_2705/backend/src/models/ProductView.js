import mongoose from "mongoose";

const productViewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    viewedAt: { type: Date, default: Date.now, index: true },
    viewCount: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true, versionKey: false, id: false },
);

productViewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const ProductView = mongoose.model("ProductView", productViewSchema);

