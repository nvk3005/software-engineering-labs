import {
  cancelUserOrder,
  checkoutOrder,
  getUserOrder,
  listUserOrders,
  previewCheckoutOrder,
} from "../services/orderService.js";

const send = (res, result) => res.status(result.status).json(result.body);

export async function checkout(req, res) {
  send(res, await checkoutOrder(req.user, req.body));
}

export async function previewCheckout(req, res) {
  send(res, await previewCheckoutOrder(req.user, req.body));
}

export async function getOrders(req, res) {
  send(res, await listUserOrders(req.user.id));
}

export async function getOrderDetail(req, res) {
  send(res, await getUserOrder(req.user.id, req.params.orderId));
}

export async function cancelOrder(req, res) {
  send(res, await cancelUserOrder(req.user.id, req.params.orderId, req.body.reason));
}
