import { Product } from "../models/index.js";
import { recordProductView } from "./preferenceService.js";
import { listProductReviews } from "./reviewService.js";

const HOT_SCORE_WEIGHTS = Object.freeze({
  sold: 0.5,
  views: 0.3,
  rating: 0.2,
});
const HOT_RATIO = 0.35;

function computeHotScore(product) {
  return Number(
    (
      (Number(product.sold) || 0) * HOT_SCORE_WEIGHTS.sold +
      (Number(product.views) || 0) * HOT_SCORE_WEIGHTS.views +
      (Number(product.rating) || 0) * HOT_SCORE_WEIGHTS.rating
    ).toFixed(2)
  );
}

function decorateHotProducts(items) {
  if (!items.length) return [];

  const enriched = items.map((item) => ({
    ...item,
    hotScore: computeHotScore(item),
  }));

  const ranked = [...enriched].sort((left, right) => right.hotScore - left.hotScore);
  const hotCount = Math.max(1, Math.ceil(ranked.length * HOT_RATIO));
  const threshold = ranked[hotCount - 1]?.hotScore ?? Infinity;

  return enriched.map((item) => ({
    ...item,
    isHot: item.hotScore > 0 && item.hotScore >= threshold,
  }));
}

function sortProducts(items, sort) {
  const sorters = {
    price_asc: (left, right) => left.price - right.price,
    price_desc: (left, right) => right.price - left.price,
    rating: (left, right) => right.rating - left.rating,
    sold: (left, right) => right.sold - left.sold,
    newest: (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  };

  const sorter = sorters[sort] || sorters.newest;
  return [...items].sort(sorter);
}

function paginateProducts(items, pageNumber, pageSize) {
  const startIndex = (pageNumber - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
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
  if (isSale === "true") filter.isSale = true;

  const [matchedProducts, categories, brands] = await Promise.all([
    Product.find(filter).lean(),
    Product.distinct("category"),
    Product.distinct("brand"),
  ]);

  const hotDecorated = decorateHotProducts(matchedProducts);
  const filteredItems = isHot === "true" ? hotDecorated.filter((item) => item.isHot) : hotDecorated;
  const sortedItems = sortProducts(filteredItems, sort);
  const pagedItems = paginateProducts(sortedItems, pageNumber, pageSize);
  const total = filteredItems.length;

  return {
    items: pagedItems,
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
    await recordProductView(userId, id);
  }

  const reviews = await listProductReviews(product.id, product.reviews, product.createdAt);
  const productWithReviews = {
    ...product,
    reviews,
  };

  const relatedProducts = await Product.findRelated(productWithReviews);
  const decorated = decorateHotProducts([productWithReviews, ...relatedProducts]);
  const [selected, ...related] = decorated;

  return {
    product: selected,
    related,
  };
}

export async function findProduct(id) {
  return Product.findByPublicId(id);
}

export async function getTopProducts(query) {
  const { type = "sold", page = 1, limit = 10 } = query;

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.max(Number(limit), 1);
  const allProducts = await Product.find({}).lean();
  const decorated = decorateHotProducts(allProducts);

  let sortedItems;
  let sortField;
  if (type === "views") {
    sortField = "views";
    sortedItems = [...decorated].sort((left, right) => right.views - left.views);
  } else if (type === "hot") {
    sortField = "hotScore";
    sortedItems = [...decorated].sort((left, right) => right.hotScore - left.hotScore);
  } else {
    sortField = "sold";
    sortedItems = [...decorated].sort((left, right) => right.sold - left.sold);
  }

  const total = sortedItems.length;
  const items = paginateProducts(sortedItems, pageNumber, pageSize);

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
