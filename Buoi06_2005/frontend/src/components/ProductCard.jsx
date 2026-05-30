import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function ProductCard({ product, onAdd }) {
  const salePercent = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="image-link">
        <img src={product.images[0]} alt={product.name} />
        <div className="badges">
          {product.isNew && <span>Mới</span>}
          {product.isHot && <span>Bán chạy</span>}
          {product.isSale && <span>-{salePercent}%</span>}
        </div>
      </Link>
      <div className="product-body">
        <p className="eyebrow">{product.brand} / {product.category}</p>
        <Link to={`/products/${product.id}`} className="product-title">{product.name}</Link>
        <div className="rating">
          <Star size={16} fill="currentColor" />
          <span>{product.rating}</span>
          <span>{product.sold} đã bán</span>
        </div>
        <div className="price-row">
          <strong>{money.format(product.price)}</strong>
          {product.oldPrice > 0 && <del>{money.format(product.oldPrice)}</del>}
        </div>
        <button className="icon-button full" onClick={() => onAdd(product.id)}>
          <ShoppingBag size={18} />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}