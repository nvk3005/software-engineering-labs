import { Favorite, Product, ProductView } from "../models/index.js";

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function mapProductsById(items = []) {
  return new Map(items.map((item) => [item.id, item]));
}

export async function listUserFavoriteIds(userId) {
  const favorites = await Favorite.find({ userId }).select("productId").lean();
  return favorites.map((item) => item.productId);
}

export async function listUserFavoriteProducts(userId) {
  const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 }).lean();
  const productIds = favorites.map((item) => item.productId);

  if (!productIds.length) {
    return { ids: [], items: [] };
  }

  const products = await Product.find({ id: { $in: productIds } }).lean();
  const productMap = mapProductsById(products);

  const items = favorites
    .map((favorite) => productMap.get(favorite.productId))
    .filter(Boolean);

  return { ids: productIds, items };
}

export async function addFavoriteProduct(userId, productId) {
  const normalizedProductId = String(productId || "").trim();
  if (!normalizedProductId) {
    return { status: 400, body: { message: "Thiếu mã sản phẩm yêu thích" } };
  }

  const product = await Product.findOne({ id: normalizedProductId }).lean();
  if (!product) {
    return { status: 404, body: { message: "Không tìm thấy sản phẩm" } };
  }

  await Favorite.findOneAndUpdate(
    { userId, productId: normalizedProductId },
    {
      $setOnInsert: {
        id: makeId("fav"),
        userId,
        productId: normalizedProductId,
      },
    },
    { upsert: true, new: true },
  );

  const ids = await listUserFavoriteIds(userId);
  return { status: 200, body: { message: "Đã thêm vào yêu thích", ids } };
}

export async function removeFavoriteProduct(userId, productId) {
  const normalizedProductId = String(productId || "").trim();
  if (!normalizedProductId) {
    return { status: 400, body: { message: "Thiếu mã sản phẩm yêu thích" } };
  }

  await Favorite.deleteOne({ userId, productId: normalizedProductId });
  const ids = await listUserFavoriteIds(userId);
  return { status: 200, body: { message: "Đã bỏ yêu thích", ids } };
}

export async function getUserFavorites(userId) {
  const favorites = await listUserFavoriteProducts(userId);
  return { status: 200, body: favorites };
}

export async function recordProductView(userId, productId) {
  if (!userId || !productId) return;

  await ProductView.findOneAndUpdate(
    { userId, productId },
    {
      $setOnInsert: {
        id: makeId("vw"),
        userId,
        productId,
      },
      $set: { viewedAt: new Date() },
      $inc: { viewCount: 1 },
    },
    { upsert: true, new: true },
  );
}

export async function listUserViewedProducts(userId, options = {}) {
  const limit = toPositiveInt(options.limit || 12, 12);
  const excludeProductId = String(options.excludeProductId || "").trim();
  const query = { userId };

  if (excludeProductId) {
    query.productId = { $ne: excludeProductId };
  }

  const views = await ProductView.find(query).sort({ viewedAt: -1 }).limit(limit).lean();
  const ids = views.map((item) => item.productId);

  if (!ids.length) {
    return [];
  }

  const products = await Product.find({ id: { $in: ids } }).lean();
  const productMap = mapProductsById(products);

  return views
    .map((view) => {
      const product = productMap.get(view.productId);
      if (!product) return null;
      return {
        ...product,
        viewedAt: view.viewedAt,
        viewedCount: Number(view.viewCount || 1),
      };
    })
    .filter(Boolean);
}

export async function getUserViewedProducts(userId, options = {}) {
  const items = await listUserViewedProducts(userId, options);
  return { status: 200, body: { items } };
}
