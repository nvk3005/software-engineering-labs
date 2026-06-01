import { Router } from "express";
import {
  cancelOrder,
  checkout,
  getOrderDetail,
  getOrders,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/checkout", checkout);
router.get("/", getOrders);
router.get("/:orderId", getOrderDetail);
router.patch("/:orderId/cancel", cancelOrder);

export default router;
