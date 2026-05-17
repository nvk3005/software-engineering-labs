import { Product } from "../models/index.js";

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

export async function getProductDetail(id) {
  const product = await Product.findByPublicId(id);
  if (!product) return null;

  return {
    product,
    related: await Product.findRelated(product),
  };
}

export async function findProduct(id) {
  return Product.findByPublicId(id);
}
