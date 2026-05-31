import {
  getProductDetail,
  getSimilarProducts,
  getTopProducts,
  listProducts,
} from "../services/productService.js";

export async function getProducts(req, res) {
  res.json(await listProducts(req.query));
}

export async function getProductById(req, res) {
  const detail = await getProductDetail(req.params.id, req.user?.id || "");
  if (!detail) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
  return res.json(detail);
}

export async function getSimilarProductList(req, res) {
  const similar = await getSimilarProducts(req.params.id, req.query);
  if (!similar) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
  return res.json(similar);
}

export async function getTopProductList(req, res) {
  res.json(await getTopProducts(req.query));
}
