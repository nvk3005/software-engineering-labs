import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/cartService.js";

const send = (res, result) => res.status(result.status).json(result.body);

export async function getCurrentCart(req, res) {
  res.json({ items: await getCart(req.user.id) });
}

export async function addToCart(req, res) {
  send(
    res,
    await addCartItem(req.user.id, req.body.productId, req.body.quantity),
  );
}

export async function updateCartItem(req, res) {
  send(
    res,
    await updateCartItemQuantity(
      req.user.id,
      req.params.productId,
      req.body.quantity,
    ),
  );
}

export async function deleteCartItem(req, res) {
  send(res, await removeCartItem(req.user.id, req.params.productId));
}
