import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CartPanel from "../components/CartPanel";
import Filters from "../components/Filters";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProfilePanel from "../components/ProfilePanel";
import { addToCart, fetchCart } from "../store/cartSlice";
import { fetchProducts } from "../store/productsSlice";

const initialFilters = {
  search: "",
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  sort: "newest",
  isNew: "",
  isHot: "",
  isSale: "",
  page: 1,
  limit: 12
};

export default function App() {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(initialFilters);
  const { items, facets, meta, status } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const groups = useMemo(() => ({
    newProducts: items.filter((item) => item.isNew),
    hotProducts: items.filter((item) => item.isHot),
    saleProducts: items.filter((item) => item.isSale)
  }), [items]);

  const onAdd = (productId) => dispatch(addToCart({ productId, quantity: 1 }));

  return (
    <>
      <Header />
      <main className="shell">
        <section className="hero">
          <div>
            <p className="eyebrow">Bộ sưu tập xa xỉ</p>
            <h1>Đồng hồ cao cấp cho từng khoảnh khắc đáng giá</h1>
            <p>Sản phẩm mới, bestseller và khuyến mãi được cập nhật trên từng card. Mã giảm giá hôm nay: <b>LUXE2026</b>.</p>
          </div>
        </section>
        <div className="layout">
          <Filters filters={filters} facets={facets} onChange={setFilters} onReset={() => setFilters(initialFilters)} />
          <section className="catalog">
            <div className="section-head">
              <div>
                <p className="eyebrow">Danh mục</p>
                <h2>{meta.total} sản phẩm phù hợp</h2>
              </div>
              <span>{status === "loading" ? "Đang tải..." : `Trang ${meta.page}/${meta.pages || 1}`}</span>
            </div>
            <div className="grid">
              {items.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
            </div>
            <section className="showcase">
              <h2>Bộ sưu tập nhanh</h2>
              <p>Mới: {groups.newProducts.length} / Bán chạy: {groups.hotProducts.length} / Đang sale: {groups.saleProducts.length}</p>
            </section>
          </section>
          <div className="side-stack">
            <ProfilePanel />
            <CartPanel />
          </div>
        </div>
      </main>
    </>
  );
}
