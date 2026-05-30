import validator from "validator";
import cloudinary, { hasCloudinaryConfig } from "../config/cloudinary.js";
import { safeUser } from "../utils/auth.js";

function uploadBufferToCloudinary(buffer, userId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "luxewatch/avatars",
        public_id: userId,
        overwrite: true,
        resource_type: "image",
        transformation: [
          { width: 480, height: 480, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(buffer);
  });
}

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

export async function uploadAvatar(req, res) {
  try {
    if (!hasCloudinaryConfig()) {
      return res.status(500).json({ message: "Backend chưa cấu hình Cloudinary" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh đại diện" });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, req.user.id);
    req.user.avatarUrl = result.secure_url;
    req.user.avatarPublicId = result.public_id;
    await req.user.save();

    return res.json({
      message: "Cập nhật ảnh đại diện thành công",
      user: safeUser(req.user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Upload ảnh thất bại" });
  }
}
