import validator from "validator";
import cloudinary, { hasCloudinaryConfig } from "../config/cloudinary.js";
import { ORDER_STATUS, Order, Product, Review } from "../models/index.js";

const REVIEW_POINTS_BASE = 20;
const REVIEW_POINTS_IMAGE_BONUS = 10;
const MAX_REVIEW_IMAGES = 2;
const MAX_COMMENT_LENGTH = 1200;

function makeReviewId() {
  return `rv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRating(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const rounded = Math.round(numeric);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function parseSubmittedRating(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return null;
  if (numeric < 1 || numeric > 5) return null;
  return numeric;
}

function serializeReview(review) {
  const data = review.toObject ? review.toObject() : review;
  return {
    id: data.id,
    userId: data.userId,
    user: data.userName,
    orderId: data.orderId,
    productId: data.productId,
    rating: normalizeRating(data.rating) || 1,
    comment: data.comment,
    images: (data.images || []).map((item) => item.url),
    rewardPoints: data.rewardPoints || 0,
    createdAt: data.createdAt,
    verifiedPurchase: true,
  };
}

function uploadBufferToCloudinary(buffer, { userId, productId, index }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `luxewatch/reviews/${productId}`,
        public_id: `${userId}-${Date.now()}-${index}`,
        overwrite: false,
        resource_type: "image",
        transformation: [
          { width: 1400, crop: "limit" },
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

export function normalizeLegacyReview(review = {}, index = 0, createdAt = null) {
  return {
    id: `legacy-${index}`,
    userId: "",
    user: String(review.user || "Khách hàng ẩn danh").trim(),
    orderId: "",
    productId: "",
    rating: normalizeRating(review.rating) || 5,
    comment: String(review.comment || "").trim(),
    images: [],
    rewardPoints: 0,
    createdAt,
    verifiedPurchase: false,
  };
}

export async function listProductReviews(productId, legacyReviews = [], createdAt = null) {
  const reviewDocs = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
  const modernReviews = reviewDocs.map((item) => serializeReview(item));
  const legacy = (legacyReviews || []).map((item, index) =>
    normalizeLegacyReview(item, index, createdAt),
  );
  return [...modernReviews, ...legacy];
}

function calculateRewardPoints(imageCount) {
  return REVIEW_POINTS_BASE + (imageCount > 0 ? REVIEW_POINTS_IMAGE_BONUS : 0);
}

export async function getReviewableItems(userId, orderId) {
  const order = await Order.findOne({ id: orderId, userId }).lean();
  if (!order) {
    return { status: 404, body: { message: "Không tìm thấy đơn hàng" } };
  }

  const reviewDocs = await Review.find(
    { userId, orderId },
    { productId: 1, rating: 1, comment: 1, images: 1, createdAt: 1, id: 1 },
  ).lean();

  const reviewByProductId = new Map(reviewDocs.map((item) => [item.productId, item]));
  const canReviewOrder = order.status === ORDER_STATUS.DELIVERED;

  return {
    status: 200,
    body: {
      orderId: order.id,
      status: order.status,
      canReviewOrder,
      items: order.items.map((item) => {
        const reviewed = reviewByProductId.get(item.productId);
        return {
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          reviewed: Boolean(reviewed),
          canReview: canReviewOrder && !reviewed,
          review: reviewed
            ? {
                id: reviewed.id,
                rating: normalizeRating(reviewed.rating) || 1,
                comment: reviewed.comment,
                images: (reviewed.images || []).map((photo) => photo.url),
                createdAt: reviewed.createdAt,
              }
            : null,
        };
      }),
    },
  };
}

export async function submitOrderReview(user, orderId, payload = {}, files = []) {
  const order = await Order.findOne({ id: orderId, userId: user.id }).lean();
  if (!order) {
    return { status: 404, body: { message: "Không tìm thấy đơn hàng" } };
  }

  if (order.status !== ORDER_STATUS.DELIVERED) {
    return { status: 400, body: { message: "Chỉ có thể đánh giá khi đơn hàng đã giao thành công" } };
  }

  const productId = String(payload.productId || "").trim();
  if (!productId) {
    return { status: 400, body: { message: "Thiếu mã sản phẩm cần đánh giá" } };
  }

  const itemInOrder = order.items.find((item) => item.productId === productId);
  if (!itemInOrder) {
    return { status: 400, body: { message: "Sản phẩm không thuộc đơn hàng này" } };
  }

  const rating = parseSubmittedRating(payload.rating);
  if (!rating) {
    return { status: 400, body: { message: "Số sao đánh giá phải là số nguyên từ 1 đến 5" } };
  }

  const comment = validator.escape(String(payload.comment || "").trim());
  if (!comment) {
    return { status: 400, body: { message: "Vui lòng nhập nội dung bình luận" } };
  }
  if (comment.length > MAX_COMMENT_LENGTH) {
    return {
      status: 400,
      body: { message: `Bình luận tối đa ${MAX_COMMENT_LENGTH} ký tự` },
    };
  }

  if (files.length > MAX_REVIEW_IMAGES) {
    return { status: 400, body: { message: `Tối đa ${MAX_REVIEW_IMAGES} ảnh cho mỗi bình luận` } };
  }

  const existed = await Review.findOne({ userId: user.id, orderId, productId }).lean();
  if (existed) {
    return { status: 409, body: { message: "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi" } };
  }

  if (files.length && !hasCloudinaryConfig()) {
    return { status: 500, body: { message: "Backend chưa cấu hình Cloudinary để lưu ảnh bình luận" } };
  }

  const uploadedImages = [];
  for (let index = 0; index < files.length; index += 1) {
    const uploaded = await uploadBufferToCloudinary(files[index].buffer, {
      userId: user.id,
      productId,
      index,
    });
    uploadedImages.push({ url: uploaded.secure_url, publicId: uploaded.public_id });
  }

  const rewardPoints = calculateRewardPoints(uploadedImages.length);
  const review = await Review.create({
    id: makeReviewId(),
    userId: user.id,
    userName: user.name,
    orderId,
    productId,
    rating,
    comment,
    images: uploadedImages,
    rewardPoints,
  });

  user.loyaltyPoints = Number(user.loyaltyPoints || 0) + rewardPoints;
  await user.save();

  const product = await Product.findOne({ id: productId });
  if (product) {
    const legacyRatings = (product.reviews || [])
      .map((item) => normalizeRating(item.rating))
      .filter(Boolean);
    const modernReviewRatings = await Review.find({ productId }).select("rating").lean();
    const modernRatings = modernReviewRatings
      .map((item) => normalizeRating(item.rating))
      .filter(Boolean);
    const allRatings = [...legacyRatings, ...modernRatings];
    if (allRatings.length) {
      const averageRating = allRatings.reduce((sum, item) => sum + item, 0) / allRatings.length;
      product.rating = Number(averageRating.toFixed(1));
      await product.save();
    }
  }

  return {
    status: 201,
    body: {
      message: "Gửi đánh giá thành công",
      review: serializeReview(review),
      reward: {
        pointsEarned: rewardPoints,
        totalPoints: Number(user.loyaltyPoints || 0),
      },
    },
  };
}
