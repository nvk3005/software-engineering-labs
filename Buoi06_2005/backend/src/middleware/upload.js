import multer from "multer";

const imageTypes = ["image/jpeg", "image/png", "image/webp"];

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!imageTypes.includes(file.mimetype)) {
      callback(new Error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP"));
      return;
    }
    callback(null, true);
  },
});
