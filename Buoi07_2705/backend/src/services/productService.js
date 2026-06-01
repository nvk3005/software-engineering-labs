import { Order, ORDER_STATUS, Product, Review } from "../models/index.js";
import { listUserViewedProducts, recordProductView } from "./preferenceService.js";
import { listProductReviews } from "./reviewService.js";

function normalizeIntegerRating(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 5;
  return Math.min(5, Math.max(1, Math.round(numeric)));
}

function toPositiveInt(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.floor(numeric));
}

function scoreSimilarProduct(base, candidate) {
  let score = 0;
  if (candidate.category === base.category) score += 40;
  if (candidate.brand === base.brand) score += 32;
  if (candidate.category === base.category && candidate.brand === base.brand) score += 8;

  const priceBase = Math.max(Number(base.price) || 1, 1);
  const priceGap = Math.abs((Number(candidate.price) || 0) - priceBase);
  const priceScore = Math.max(0, 20 - (priceGap / priceBase) * 20);
  score += priceScore;

  score += (Number(candidate.rating) || 0) * 3;
  score += Math.min(10, (Number(candidate.sold) || 0) / 30);
  return score;
}

async function buildProductEngagementStats(productId, legacyReviews = []) {
  const [buyers, modernCommenters, modernReviewsCount] = await Promise.all([
    Order.distinct("userId", {
      status: ORDER_STATUS.DELIVERED,
      "items.productId": productId,
    }),
    Review.distinct("userId", { productId }),
    Review.countDocuments({ productId }),
  ]);

  const legacyCommenters = new Set(
    (legacyReviews || [])
      .map((item) => String(item?.user || "").trim())
      .filter(Boolean),
  );

  return {
    buyersCount: buyers.length,
    commentersCount: modernCommenters.length + legacyCommenters.size,
    reviewsCount: Number(modernReviewsCount || 0) + (legacyReviews || []).length,
  };
}

async function findSimilarProducts(baseProduct, limit = 8) {
  const similarLimit = toPositiveInt(limit, 8);

  const seededCandidates = await Product.find({
    id: { $ne: baseProduct.id },
    $or: [{ category: baseProduct.category }, { brand: baseProduct.brand }],
  })
    .limit(80)
    .lean();

  let candidates = seededCandidates;
  if (candidates.length < similarLimit) {
    const fallbackCandidates = await Product.find({ id: { $ne: baseProduct.id } })
      .sort({ sold: -1, rating: -1 })
      .limit(80)
      .lean();

    const seen = new Set(candidates.map((item) => item.id));
    for (const item of fallbackCandidates) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        candidates.push(item);
      }
    }
  }

  return candidates
    .map((item) => ({ ...item, __score: scoreSimilarProduct(baseProduct, item) }))
    .sort(
      (a, b) =>
        b.__score - a.__score ||
        Number(b.sold || 0) - Number(a.sold || 0) ||
        Number(b.rating || 0) - Number(a.rating || 0),
    )
    .slice(0, similarLimit)
    .map(({ __score, ...item }) => item);
}

export async function listProducts(query) {
  const {
    search = "",
    category,
    brand,
    minPrice,
    maxPrice,
    sort = "newest",
    isNew,
    isHot,
    isSale,
    minRating,
    page = 1,
    limit = 12,
  } = query;

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.max(Number(limit), 1);
  const filter = {};
  const q = String(search).trim();

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (isNew === "true") filter.isNew = true;
  if (isHot === "true") filter.isHot = true;
  if (isSale === "true") filter.isSale = true;

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    sold: { sold: -1 },
    newest: { createdAt: -1 },
  };

  const [items, total, categories, brands] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(filter),
    Product.distinct("category"),
    Product.distinct("brand"),
  ]);

  return {
    items,
    meta: {
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
    },
    facets: {
      categories,
      brands,
    },
  };
}

export async function getProductDetail(id, userId = "") {
  const product = await Product.findOneAndUpdate(
    { id },
    { $inc: { views: 1 } },
    { new: true },
  ).lean();

  if (!product) return null;

  if (userId) {
    await recordProductView(userId, product.id);
  }

  const reviews = await listProductReviews(
    product.id,
    product.reviews || [],
    product.createdAt,
  );
  const stats = await buildProductEngagementStats(product.id, product.reviews || []);
  const similar = await findSimilarProducts(product, 8);
  const recentlyViewed = userId
    ? await listUserViewedProducts(userId, { limit: 8, excludeProductId: product.id })
    : [];

  return {
    product: {
      ...product,
      ...stats,
      reviews: reviews.map((item) => ({
        ...item,
        rating: normalizeIntegerRating(item.rating),
      })),
    },
    related: similar,
    recentlyViewed,
  };
}

export async function getSimilarProducts(id, options = {}) {
  const product = await Product.findOne({ id }).lean();
  if (!product) return null;
  const limit = toPositiveInt(options.limit || 8, 8);
  const items = await findSimilarProducts(product, limit);
  return { items };
}

export async function findProduct(id) {
  return Product.findByPublicId(id);
}

export async function getTopProducts(query) {
  const { type = "sold", page = 1, limit = 10 } = query;

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.max(Number(limit), 1);
  const sortField = type === "views" ? "views" : "sold";

  const [items, total] = await Promise.all([
    Product.find({})
      .sort({ [sortField]: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(),
  ]);

  return {
    items,
    meta: {
      type: sortField,
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
    },
  };
}
