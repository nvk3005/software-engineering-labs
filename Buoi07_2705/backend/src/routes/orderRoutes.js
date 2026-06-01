import { Router } from "express";
import {
  cancelOrder,
  checkout,
  getOrderDetail,
  getOrders,
  previewCheckout,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import {
  createOrderReview,
  getReviewableOrderItems,
} from "../controllers/reviewController.js";

const router = Router();

router.use(requireAuth);
router.post("/preview", previewCheckout);
router.post("/checkout", checkout);
router.get("/", getOrders);
router.get("/:orderId/reviewable-items", getReviewableOrderItems);
router.post("/:orderId/reviews", uploadImage.array("images", 2), createOrderReview);
router.get("/:orderId", getOrderDetail);
router.patch("/:orderId/cancel", cancelOrder);

export default router;
