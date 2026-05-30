import { Search } from "lucide-react";

export default function Filters({ filters, facets, onChange, onReset, hideSort = false }) {
  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  const toggle = (key) => onChange({ ...filters, [key]: filters[key] === "true" ? "" : "true", page: 1 });

  return (
    <aside className="filters">
      <div className="search-box">
        <Search size={18} />
        <input value={filters.search} onChange={(event) => set("search", event.target.value)} placeholder="Tìm Seiko, Tissot..." />
      </div>
      <label>
        Danh mục
        <select value={filters.category} onChange={(event) => set("category", event.target.value)}>
          <option value="">Tất cả</option>
          {facets.categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Thương hiệu
        <select value={filters.brand} onChange={(event) => set("brand", event.target.value)}>
          <option value="">Tất cả</option>
          {facets.brands.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <div className="split">
        <label>
          Giá từ
          <input type="number" value={filters.minPrice} onChange={(event) => set("minPrice", event.target.value)} />
        </label>
        <label>
          Đến
          <input type="number" value={filters.maxPrice} onChange={(event) => set("maxPrice", event.target.value)} />
        </label>
      </div>
      <label>
        Rating tối thiểu
        <input type="number" step="0.1" min="0" max="5" value={filters.minRating} onChange={(event) => set("minRating", event.target.value)} />
      </label>
      {!hideSort && (
        <label>
          Sắp xếp
          <select value={filters.sort} onChange={(event) => set("sort", event.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="rating">Rating cao</option>
            <option value="sold">Bán chạy</option>
          </select>
        </label>
      )}
      <div className="chips">
        <button className={filters.isNew === "true" ? "active" : ""} onClick={() => toggle("isNew")}>Hàng mới</button>
        <button className={filters.isHot === "true" ? "active" : ""} onClick={() => toggle("isHot")}>Bán chạy</button>
        <button className={filters.isSale === "true" ? "active" : ""} onClick={() => toggle("isSale")}>Đang sale</button>
      </div>
      <button className="ghost" onClick={onReset}>Xóa bộ lọc</button>
    </aside>
  );
}
