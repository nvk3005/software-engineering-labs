import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { addToCart } from "../store/cartSlice";
import { fetchProductDetail } from "../store/productsSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const magnifierZoom = 2.8;
const magnifierSize = 176;

function RatingStars({ rating, size = 15 }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <span className="star-row" aria-label={`${rating} sao`}>
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
  const { selected: product, related } = useSelector((state) => state.products);
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
    setImageIndex(0);
    setQuantity(1);
    setMagnifier({ active: false, x: 50, y: 50, bgX: 0, bgY: 0, bgWidth: 0, bgHeight: 0 });
  }, [dispatch, id]);

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
    count: product.reviews.filter((review) => Math.round(review.rating) === score).length
  }));
  const maxBucket = Math.max(...starBuckets.map((bucket) => bucket.count), 1);

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
            <div className="thumbs">
              {product.images.map((image, index) => (
                <button key={image} className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)}>
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
            <p>{product.description}</p>
            <div className="price-row detail-price">
              <strong>{money.format(product.price)}</strong>
              {product.oldPrice > 0 && <del>{money.format(product.oldPrice)}</del>}
            </div>
            <div className="stock">Tồn kho: <b>{product.stock}</b></div>
            <div className="qty large">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
              <b>{quantity}</b>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={16} /></button>
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
            {product.reviews.map((review) => (
              <article key={`${review.user}-${review.comment}`} className="review">
                <div className="review-head">
                  <strong>{review.user}</strong>
                  <RatingStars rating={review.rating} />
                  <span>{review.rating} sao</span>
                </div>
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
          <div className="distribution">
            <h2>Phân phối sao</h2>
            {starBuckets.map((bucket) => (
              <div className="bar-row star-distribution" key={bucket.score}>
                <span className="star-score"><Star size={15} fill="currentColor" strokeWidth={0} /> {bucket.score}</span>
                <div><i style={{ width: `${(bucket.count / maxBucket) * 100}%` }} /></div>
                <b>{bucket.count}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="related">
          <h2>Sản phẩm tương tự</h2>
          <div className="grid">
            {related.map((item) => <ProductCard key={item.id} product={item} onAdd={(productId) => dispatch(addToCart({ productId, quantity: 1 }))} />)}
          </div>
        </section>
      </main>
    </>
  );
}
