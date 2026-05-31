import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Filters from "../components/Filters";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { addToCart, fetchCart } from "../store/cartSlice";
import {
  addFavorite,
  fetchFavorites,
  fetchViewedProducts,
  removeFavorite,
} from "../store/engagementSlice";
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
  limit: 12,
};

export default function App() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceSort, setShowPriceSort] = useState(false);
  const { items, facets, meta, status } = useSelector((state) => state.products);
  const { favoriteIds, viewedItems } = useSelector((state) => state.engagement);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchFavorites());
    dispatch(fetchViewedProducts(8));
  }, [dispatch]);

  useEffect(() => {
    const keyword = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const category = searchParams.get("category") || "";

    setFilters((current) => {
      const nextFilters = { ...current, search: keyword, brand, category, page: 1 };
      const unchanged =
        current.search === nextFilters.search &&
        current.brand === nextFilters.brand &&
        current.category === nextFilters.category;

      return unchanged ? current : nextFilters;
    });
  }, [searchParams]);

  const onAdd = (productId) => dispatch(addToCart({ productId, quantity: 1 }));
  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));

  const toggleFavorite = (productId) => {
    if (favoriteSet.has(productId)) {
      dispatch(removeFavorite(productId));
      return;
    }
    dispatch(addFavorite(productId));
  };

  const categoryTabs = [
    { label: "Tất cả", value: "" },
    ...facets.categories.map((category) => ({ label: category, value: category })),
  ];

  return (
    <>
      <Header />
      <main className="shell">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">LuxeWatch</p>
            <h1>Đồng hồ tinh tế cho phong cách hiện đại.</h1>
            <div className="hero-actions">
              <a className="primary" href="#catalog">Mua sắm ngay</a>
              <a className="ghost" href="#catalog">Xem bộ sưu tập</a>
            </div>
          </div>
          <div className="hero-product">
            <img
              src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1300&q=88"
              alt="Đồng hồ LuxeWatch tối giản"
            />
          </div>
        </section>

        <section className="catalog-section" id="catalog">
          <div className="filter-strip">
            <button className="filter-trigger" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal size={18} />
              Lọc
            </button>
            {categoryTabs.map((tab) => (
              <button
                key={tab.label}
                className={filters.category === tab.value ? "active" : ""}
                onClick={() => setFilter("category", tab.value)}
              >
                {tab.label}
              </button>
            ))}
            {facets.brands.slice(0, 5).map((brand) => (
              <button
                key={brand}
                className={filters.brand === brand ? "active" : ""}
                onClick={() => setFilter("brand", filters.brand === brand ? "" : brand)}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className="sort-strip">
            <span>Sắp xếp theo:</span>
            <button
              className={filters.sort === "newest" ? "active" : ""}
              onClick={() => setFilter("sort", "newest")}
            >
              Nổi bật
            </button>
            <i />
            <button
              className={filters.sort === "sold" ? "active" : ""}
              onClick={() => setFilter("sort", "sold")}
            >
              Bán chạy
            </button>
            <i />
            <button
              className={filters.isSale === "true" ? "active" : ""}
              onClick={() => setFilter("isSale", filters.isSale === "true" ? "" : "true")}
            >
              Giảm giá
            </button>
            <i />
            <button
              className={filters.isNew === "true" ? "active" : ""}
              onClick={() => setFilter("isNew", filters.isNew === "true" ? "" : "true")}
            >
              Mới
            </button>
            <i />
            <div className="sort-menu">
              <button
                className={filters.sort === "price_asc" || filters.sort === "price_desc" ? "active" : ""}
                onClick={() => setShowPriceSort((value) => !value)}
              >
                Giá <ChevronDown size={15} />
              </button>
              {showPriceSort && (
                <div className="sort-dropdown">
                  <button
                    onClick={() => {
                      setFilter("sort", "price_asc");
                      setShowPriceSort(false);
                    }}
                  >
                    Giá thấp - cao
                  </button>
                  <button
                    onClick={() => {
                      setFilter("sort", "price_desc");
                      setShowPriceSort(false);
                    }}
                  >
                    Giá cao - thấp
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="section-head catalog-head">
            <div>
              <p className="eyebrow">Danh mục</p>
              <h2>{meta.total} sản phẩm phù hợp</h2>
            </div>
            <span>{status === "loading" ? "Đang tải..." : `Trang ${meta.page}/${meta.pages || 1}`}</span>
          </div>

          <div className="grid">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
                isFavorite={favoriteSet.has(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>

        {viewedItems.length > 0 && (
          <section className="recently-viewed-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Bạn vừa xem</p>
                <h2>Sản phẩm đã xem gần đây</h2>
              </div>
              <span>{viewedItems.length} sản phẩm</span>
            </div>
            <div className="grid">
              {viewedItems.slice(0, 6).map((product) => (
                <ProductCard
                  key={`viewed-${product.id}`}
                  product={product}
                  onAdd={onAdd}
                  isFavorite={favoriteSet.has(product.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {showFilters && (
          <div className="filter-modal" role="dialog" aria-modal="true" aria-label="Tất cả bộ lọc">
            <button className="filter-backdrop" onClick={() => setShowFilters(false)} aria-label="Đóng bộ lọc" />
            <div className="filter-sheet">
              <div className="filter-sheet-head">
                <h2>Tất cả bộ lọc</h2>
                <button onClick={() => setShowFilters(false)} aria-label="Đóng bộ lọc">
                  <X size={24} />
                </button>
              </div>
              <Filters
                filters={filters}
                facets={facets}
                onChange={setFilters}
                onReset={() => setFilters(initialFilters)}
                hideSort
              />
              <div className="filter-sheet-actions">
                <button className="ghost" onClick={() => setFilters(initialFilters)}>Bỏ chọn</button>
                <button className="primary" onClick={() => setShowFilters(false)}>Xem {meta.total} kết quả</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

