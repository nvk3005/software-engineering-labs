import { Router } from "express";
import {
  getProductById,
  getProducts,
  getSimilarProductList,
  getTopProductList,
} from "../controllers/productController.js";
import { attachUserIfAny } from "../middleware/auth.js";

const router = Router();

router.get("/", getProducts);
router.get("/top", getTopProductList);
router.get("/:id/similar", getSimilarProductList);
router.get("/:id", attachUserIfAny, getProductById);

export default router;
