import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { addToCart } from "../store/cartSlice";
import { fetchProductDetail } from "../store/productsSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: product, related } = useSelector((state) => state.products);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductDetail(id));
    setImageIndex(0);
    setQuantity(1);
  }, [dispatch, id]);

  if (!product) return <><Header /><main className="shell">Đang tải...</main></>;

  const starBuckets = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: product.reviews.filter((review) => Math.round(review.rating) === score).length
  }));

  return (
    <>
      <Header />
      <main className="shell detail">
        <Link className="back-link" to="/">Quay lại</Link>
        <section className="detail-grid">
          <div className="gallery">
            <img src={product.images[imageIndex]} alt={product.name} />
            <div className="thumbs">
              {product.images.map((image, index) => (
                <button key={image} className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)}>
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="detail-info">
            <p className="eyebrow">{product.brand} / {product.category}</p>
            <h1>{product.name}</h1>
            <div className="rating big"><Star size={18} fill="currentColor" /> {product.rating} / {product.sold} đã bán</div>
            <p>{product.description}</p>
            <div className="price-row detail-price"><strong>{money.format(product.price)}</strong>{product.oldPrice > 0 && <del>{money.format(product.oldPrice)}</del>}</div>
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
                <strong>{review.user}</strong>
                <span>{review.rating} sao</span>
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
          <div className="distribution">
            <h2>Phân phối sao</h2>
            {starBuckets.map((bucket) => (
              <div className="bar-row" key={bucket.score}>
                <span>{bucket.score}</span>
                <div><i style={{ width: `${Math.min(100, bucket.count * 50)}%` }} /></div>
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
