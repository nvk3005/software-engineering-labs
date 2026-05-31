import { Heart, MessageCircle, Minus, Plus, ShoppingBag, Star, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { addToCart } from "../store/cartSlice";
import {
  addFavorite,
  fetchFavorites,
  fetchViewedProducts,
  removeFavorite,
} from "../store/engagementSlice";
import { fetchProductDetail } from "../store/productsSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const magnifierZoom = 2.8;
const magnifierSize = 176;

function normalizeIntegerRating(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 5;
  return Math.min(5, Math.max(1, Math.round(numeric)));
}

function RatingStars({ rating, size = 15 }) {
  const rounded = normalizeIntegerRating(rating);

  return (
    <span className="star-row" aria-label={`${rounded} sao`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          fill={index < rounded ? "currentColor" : "none"}
          strokeWidth={index < rounded ? 0 : 2}
        />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: product, related, recentlyViewed } = useSelector((state) => state.products);
  const { favoriteIds, viewedItems } = useSelector((state) => state.engagement);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [magnifier, setMagnifier] = useState({
    active: false,
    x: 50,
    y: 50,
    bgX: 0,
    bgY: 0,
    bgWidth: 0,
    bgHeight: 0,
  });

  useEffect(() => {
    dispatch(fetchProductDetail(id));
    dispatch(fetchFavorites());
    dispatch(fetchViewedProducts(10));
    setImageIndex(0);
    setQuantity(1);
    setMagnifier({
      active: false,
      x: 50,
      y: 50,
      bgX: 0,
      bgY: 0,
      bgWidth: 0,
      bgHeight: 0,
    });
  }, [dispatch, id]);

  const toggleFavorite = (productId) => {
    if (favoriteSet.has(productId)) {
      dispatch(removeFavorite(productId));
      return;
    }
    dispatch(addFavorite(productId));
  };

  if (!product) {
    return (
      <>
        <Header />
        <main className="shell">Đang tải...</main>
      </>
    );
  }

  const currentImage = product.images[imageIndex];
  const starBuckets = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: product.reviews.filter((review) => normalizeIntegerRating(review.rating) === score).length,
  }));
  const maxBucket = Math.max(...starBuckets.map((bucket) => bucket.count), 1);
  const isFavorite = favoriteSet.has(product.id);

  const recentProducts = (recentlyViewed.length ? recentlyViewed : viewedItems)
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const moveMagnifier = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const x = Math.min(100, Math.max(0, (cursorX / rect.width) * 100));
    const y = Math.min(100, Math.max(0, (cursorY / rect.height) * 100));

    setMagnifier({
      active: true,
      x,
      y,
      bgX: -(cursorX * magnifierZoom - magnifierSize / 2),
      bgY: -(cursorY * magnifierZoom - magnifierSize / 2),
      bgWidth: rect.width * magnifierZoom,
      bgHeight: rect.height * magnifierZoom,
    });
  };

  return (
    <>
      <Header />
      <main className="shell detail">
        <Link className="back-link" to="/">Quay lại</Link>
        <section className="detail-grid">
          <div className="gallery">
            <div
              className={`magnifier-frame ${magnifier.active ? "active" : ""}`}
              onMouseMove={moveMagnifier}
              onMouseEnter={moveMagnifier}
              onMouseLeave={() => setMagnifier((current) => ({ ...current, active: false }))}
            >
              <img src={currentImage} alt={product.name} />
              <span
                className="magnifier-lens"
                style={{
                  left: `${magnifier.x}%`,
                  top: `${magnifier.y}%`,
                  backgroundImage: `url(${currentImage})`,
                  backgroundPosition: `${magnifier.bgX}px ${magnifier.bgY}px`,
                  backgroundSize: `${magnifier.bgWidth}px ${magnifier.bgHeight}px`,
                }}
              />
            </div>
            <p className="magnifier-hint">Di chuột để phóng to chi tiết mặt đồng hồ.</p>
            <div className="thumbs">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  className={index === imageIndex ? "active" : ""}
                  onClick={() => setImageIndex(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="detail-info">
            <p className="eyebrow detail-crumbs">
              <Link to={`/?brand=${encodeURIComponent(product.brand)}`}>{product.brand}</Link>
              <span>/</span>
              <Link to={`/?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            </p>
            <h1>{product.name}</h1>
            <div className="rating big">
              <RatingStars rating={product.rating} size={18} />
              <span>{product.rating} / {product.sold} đã bán</span>
            </div>
            <div className="engagement-stats">
              <span><Users size={15} /> {Number(product.buyersCount || 0)} khách đã mua</span>
              <span><MessageCircle size={15} /> {Number(product.commentersCount || 0)} khách đã bình luận</span>
            </div>
            <p>{product.description}</p>
            <div className="price-row detail-price">
              <strong>{money.format(product.price)}</strong>
              {product.oldPrice > 0 && <del>{money.format(product.oldPrice)}</del>}
            </div>
            <div className="stock">Tồn kho: <b>{product.stock}</b></div>
            <div className="detail-actions">
              <div className="qty large">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                <b>{quantity}</b>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={16} /></button>
              </div>
              <button
                className={`favorite-action ${isFavorite ? "active" : ""}`}
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
                {isFavorite ? "Đã yêu thích" : "Yêu thích"}
              </button>
            </div>
            <button className="icon-button" onClick={() => dispatch(addToCart({ productId: product.id, quantity }))}>
              <ShoppingBag size={18} />
              Thêm vào giỏ
            </button>
            <div className="specs">
              {product.specs.map((spec) => <span key={spec}>{spec}</span>)}
            </div>
          </div>
        </section>

        <section className="reviews">
          <div>
            <h2>Đánh giá khách hàng</h2>
            {product.reviews.map((review, index) => (
              <article key={review.id || `${review.user}-${review.comment}-${review.createdAt || index}`} className="review">
                <div className="review-head">
                  <strong>{review.user}</strong>
                  <RatingStars rating={review.rating} />
                  <span>{normalizeIntegerRating(review.rating)} sao</span>
                  {review.verifiedPurchase && <em className="verified-purchase">Đã mua hàng</em>}
                </div>
                <p>{review.comment}</p>
                {Array.isArray(review.images) && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.slice(0, 2).map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="Ảnh đánh giá sản phẩm" />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="distribution">
            <h2>Phân bố sao</h2>
            {starBuckets.map((bucket) => (
              <div className="bar-row star-distribution" key={bucket.score}>
                <span className="star-score"><Star size={15} fill="currentColor" strokeWidth={0} /> {bucket.score}</span>
                <div><i style={{ width: `${(bucket.count / maxBucket) * 100}%` }} /></div>
                <b>{bucket.count}</b>
              </div>
            ))}
          </div>
        </section>

        {recentProducts.length > 0 && (
          <section className="related recently-viewed-detail">
            <h2>Bạn đã xem gần đây</h2>
            <div className="grid">
              {recentProducts.map((item) => (
                <ProductCard
                  key={`recent-${item.id}`}
                  product={item}
                  onAdd={(productId) => dispatch(addToCart({ productId, quantity: 1 }))}
                  isFavorite={favoriteSet.has(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        <section className="related">
          <h2>Sản phẩm tương tự</h2>
          <div className="grid">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAdd={(productId) => dispatch(addToCart({ productId, quantity: 1 }))}
                isFavorite={favoriteSet.has(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

