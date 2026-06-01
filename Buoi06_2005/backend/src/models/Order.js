import mongoose from "mongoose";

export const ORDER_STATUS = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  CANCEL_REQUESTED: "CANCEL_REQUESTED",
};

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: "" },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const shippingInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingInfo: { type: shippingInfoSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
      required: true,
    },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.NEW,
      index: true,
    },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelRequestedAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false, id: false },
);

orderSchema.statics.findByPublicId = function findByPublicId(id) {
  return this.findOne({ id });
};

export const Order = mongoose.model("Order", orderSchema);
