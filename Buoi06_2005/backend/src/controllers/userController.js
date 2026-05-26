import validator from "validator";
import { safeUser } from "../utils/auth.js";

export function getMe(req, res) {
  res.json({ user: safeUser(req.user) });
}

export async function updateMe(req, res) {
  const { name, phone, address } = req.body;
  if (name) req.user.name = validator.escape(String(name).trim());
  req.user.phone = phone || "";
  req.user.address = address || "";
  await req.user.save();
  res.json({ message: "Cập nhật hồ sơ thành công", user: safeUser(req.user) });
}
