import { Router } from "express";
import { getMe, updateMe, uploadAvatar } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.put("/me/avatar", requireAuth, uploadImage.single("avatar"), uploadAvatar);

export default router;
