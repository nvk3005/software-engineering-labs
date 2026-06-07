import { Heart, ShoppingBag } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { addToCart, fetchCart } from "../store/cartSlice";
import { addFavorite, fetchFavorites, removeFavorite } from "../store/engagementSlice";

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const { favoriteItems, favoriteIds, status } = useSelector((state) => state.engagement);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchFavorites());
  }, [dispatch]);

  const onAdd = (productId) => dispatch(addToCart({ productId, quantity: 1 }));
  const onToggleFavorite = (productId) => {
    if (favoriteSet.has(productId)) {
      dispatch(removeFavorite(productId));
      return;
    }
    dispatch(addFavorite(productId));
  };

  return (
    <>
      <Header />
      <main className="shell favorites-shell">
        <section className="favorites-hero">
          <div>
            <p className="eyebrow">Danh sách yêu thích</p>
            <h1>Sản phẩm bạn quan tâm</h1>
            <p>Lưu lại đồng hồ yêu thích để so sánh, theo dõi giá và mua nhanh bất kỳ lúc nào.</p>
          </div>
          <span><Heart size={20} /> {favoriteItems.length} sản phẩm</span>
        </section>

        {status === "loading" && <p className="muted">Đang tải danh sách yêu thích...</p>}

        {!favoriteItems.length && status !== "loading" ? (
          <section className="empty-favorites">
            <div><Heart size={24} /></div>
            <h2>Chưa có sản phẩm yêu thích</h2>
            <p>Bạn hãy tìm và lưu lại những mẫu đồng hồ muốn mua sau.</p>
            <Link className="primary" to="/">
              <ShoppingBag size={18} />
              Khám phá cửa hàng
            </Link>
          </section>
        ) : (
          <section className="grid">
            {favoriteItems.map((product) => (
              <ProductCard
                key={`fav-${product.id}`}
                product={product}
                onAdd={onAdd}
                isFavorite={favoriteSet.has(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </section>
        )}
      </main>
    </>
  );
}

