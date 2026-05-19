import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, text: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    oldPrice: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5, index: true },
    sold: { type: Number, default: 0, min: 0, index: true },
    views: { type: Number, default: 0, min: 0, index: true },
    stock: { type: Number, default: 0, min: 0 },
    isNew: { type: Boolean, default: false, index: true },
    isHot: { type: Boolean, default: false, index: true },
    isSale: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    specs: { type: [String], default: [] },
    reviews: { type: [reviewSchema], default: [] },
  },
  { versionKey: false, id: false, suppressReservedKeysWarning: true },
);

productSchema.index({ name: "text", brand: "text" });

productSchema.statics.findByPublicId = function findByPublicId(id) {
  return this.findOne({ id }).lean();
};

productSchema.statics.findRelated = function findRelated(product, limit = 4) {
  return this.find({ category: product.category, id: { $ne: product.id } })
    .limit(limit)
    .lean();
};

export const Product = mongoose.model("Product", productSchema);
