import { getReviewableItems, submitOrderReview } from "../services/reviewService.js";

const send = (res, result) => res.status(result.status).json(result.body);

export async function getReviewableOrderItems(req, res) {
  send(res, await getReviewableItems(req.user.id, req.params.orderId));
}

export async function createOrderReview(req, res) {
  const files = Array.isArray(req.files) ? req.files : [];
  send(
    res,
    await submitOrderReview(req.user, req.params.orderId, req.body, files),
  );
}
