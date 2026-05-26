import { Router } from "express";
import {
  getProductById,
  getProducts,
  getTopProductList,
} from "../controllers/productController.js";

const router = Router();

router.get("/", getProducts);
router.get("/top", getTopProductList);
router.get("/:id", getProductById);

export default router;
