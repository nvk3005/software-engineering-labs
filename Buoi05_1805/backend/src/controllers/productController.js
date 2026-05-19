import {
  getProductDetail,
  getTopProducts,
  listProducts,
} from "../services/productService.js";

export async function getProducts(req, res) {
  res.json(await listProducts(req.query));
}

export async function getProductById(req, res) {
  const detail = await getProductDetail(req.params.id);
  if (!detail)
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  return res.json(detail);
}


export async function getTopProductList(req, res) {
  res.json(await getTopProducts(req.query));
}