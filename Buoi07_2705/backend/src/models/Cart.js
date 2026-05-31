import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

cartSchema.statics.findByUserId = async function findByUserId(userId) {
  const cart = await this.findOne({ userId }).lean();
  return cart?.items || [];
};

cartSchema.statics.addItem = async function addItem(
  userId,
  product,
  quantity = 1,
) {
  const cart = await this.findOne({ userId });
  const items = cart?.items || [];
  const existing = items.find((item) => item.product.id === product.id);

  if (existing)
    existing.quantity = Math.min(
      product.stock,
      existing.quantity + Number(quantity),
    );
  else
    items.push({
      product,
      quantity: Math.min(product.stock, Number(quantity)),
    });

  const saved = await this.findOneAndUpdate(
    { userId },
    { userId, items },
    { upsert: true, new: true },
  );
  return saved.items;
};

cartSchema.statics.updateQuantity = async function updateQuantity(
  userId,
  productId,
  quantity,
) {
  const cart = await this.findOne({ userId });
  if (!cart) return null;

  const item = cart.items.find((entry) => entry.product.id === productId);
  if (!item) return null;

  item.quantity = Math.max(
    1,
    Math.min(item.product.stock, Number(quantity || 1)),
  );
  await cart.save();
  return cart.items;
};

cartSchema.statics.removeItem = async function removeItem(userId, productId) {
  const cart = await this.findOne({ userId });
  if (!cart) return [];

  cart.items = cart.items.filter((item) => item.product.id !== productId);
  await cart.save();
  return cart.items;
};

cartSchema.statics.clearByUserId = async function clearByUserId(userId) {
  await this.findOneAndUpdate(
    { userId },
    { userId, items: [] },
    { upsert: true, new: true },
  );
  return [];
};

export const Cart = mongoose.model("Cart", cartSchema);
