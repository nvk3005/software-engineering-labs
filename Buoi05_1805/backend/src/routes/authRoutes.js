import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetUserPassword,
  verifyAccountOtp,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/verify-otp", authLimiter, verifyAccountOtp);
router.post("/login", authLimiter, login);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetUserPassword);
router.post("/logout", requireAuth, logout);

export default router;
