import { verifyAccessToken } from "../utils/auth.js";
import { User } from "../models/index.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Thiếu access token" });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findByPublicId(payload.id);
    if (!user) return res.status(401).json({ message: "Người dùng không hợp lệ" });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}
