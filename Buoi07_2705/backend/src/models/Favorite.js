import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
  },
  { timestamps: true, versionKey: false, id: false },
);

favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);

