import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function ProductCard({ product, onAdd, isFavorite = false, onToggleFavorite }) {
  const salePercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

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
      {onToggleFavorite && (
        <button
          type="button"
          className={`favorite-chip ${isFavorite ? "active" : ""}`}
          onClick={() => onToggleFavorite(product.id)}
          aria-label={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
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
