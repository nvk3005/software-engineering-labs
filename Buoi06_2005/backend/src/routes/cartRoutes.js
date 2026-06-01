import { Router } from "express";
import {
  addToCart,
  deleteCartItem,
  getCurrentCart,
  updateCartItem,
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getCurrentCart);
router.post("/", addToCart);
router.patch("/:productId", updateCartItem);
router.delete("/:productId", deleteCartItem);

export default router;
