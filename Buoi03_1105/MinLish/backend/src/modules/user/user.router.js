import { Router } from "express";
import * as controller from "./user.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { putProfileSchema } from "./user.schema.js";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/profile/:id", protect, controller.getOtherProfile);
router.get("/profile", protect, controller.getSelfProfile);
router.post(
  "/profile",
  protect,
  upload.single("avatar"),
  validate(putProfileSchema),
  controller.postProfile,
);

export default router;
