import { Router } from "express";
import {
  createFavorite,
  deleteFavorite,
  listFavorites,
  listViewed,
} from "../controllers/preferenceController.js";
import { getMe, updateMe, uploadAvatar } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.put("/me/avatar", requireAuth, uploadImage.single("avatar"), uploadAvatar);
router.get("/me/favorites", requireAuth, listFavorites);
router.post("/me/favorites/:productId", requireAuth, createFavorite);
router.delete("/me/favorites/:productId", requireAuth, deleteFavorite);
router.get("/me/viewed", requireAuth, listViewed);

export default router;
