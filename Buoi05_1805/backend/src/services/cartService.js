import { Cart } from "../models/index.js";
import { findProduct } from "./productService.js";

export async function getCart(userId) {
  return Cart.findByUserId(userId);
}

export async function addCartItem(userId, productId, quantity = 1) {
  const product = await findProduct(productId);
  if (!product) return { status: 404, body: { message: "Không tìm thấy sản phẩm" } };

  const cart = await Cart.addItem(userId, product, quantity);
  return { status: 201, body: { items: cart } };
}

export async function updateCartItemQuantity(userId, productId, quantity) {
  const cart = await Cart.updateQuantity(userId, productId, quantity);
  if (!cart) return { status: 404, body: { message: "Không tìm thấy sản phẩm trong giỏ hàng" } };
  return { status: 200, body: { items: cart } };
}

export async function removeCartItem(userId, productId) {
  const cart = await Cart.removeItem(userId, productId);
  return { status: 200, body: { items: cart } };
}
