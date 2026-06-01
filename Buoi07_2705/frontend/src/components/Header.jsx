import {
  ClipboardList,
  Heart,
  LogOut,
  Search,
  ShoppingBag,
  UserRound,
  Watch,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const favoriteCount = useSelector((state) => state.engagement.favoriteIds.length);
  const count = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const isHome = location.pathname === "/";
  const isOrders = location.pathname.startsWith("/orders");
  const isProfile = location.pathname === "/profile";
  const isCart = location.pathname === "/cart" || location.pathname === "/checkout";
  const isFavorites = location.pathname === "/favorites";

  const signOut = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/auth");
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    setShowSearch(false);
    navigate(value ? `/?search=${encodeURIComponent(value)}` : "/");
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="LuxeWatch">
        <Watch size={18} />
        <span>LuxeWatch</span>
      </Link>
      <nav className="site-nav">
        <Link className={isHome ? "active" : ""} to="/">Đồng Hồ</Link>
        <Link to="/#catalog">Bộ Sưu Tập</Link>
        <Link to="/#catalog">Ưu Đãi</Link>
        <Link className={isOrders ? "active" : ""} to="/orders">Đơn Hàng</Link>
        <Link to="/">Hỗ Trợ</Link>
      </nav>
      <button className="icon-only" title="Tìm kiếm" aria-label="Tìm kiếm" onClick={() => setShowSearch(true)}>
        <Search size={18} />
      </button>
      <Link className={`member ${isProfile ? "active" : ""}`} to="/profile" title="Hồ sơ thành viên">
        <UserRound size={18} />
        <span>{user?.name || "Member"}</span>
      </Link>
      <Link className={`cart-pill ${isFavorites ? "active" : ""}`} to="/favorites" title="Sản phẩm yêu thích">
        <Heart size={18} />
        <span>{favoriteCount}</span>
      </Link>
      <Link className={`cart-pill ${isOrders ? "active" : ""}`} to="/orders" title="Lịch sử đơn hàng">
        <ClipboardList size={18} />
        <span>Đơn hàng</span>
      </Link>
      <Link className={`cart-pill ${isCart ? "active" : ""}`} to="/cart" title="Giỏ hàng">
        <ShoppingBag size={18} />
        <span>{count}</span>
      </Link>
      <button className="icon-only" onClick={signOut} title="Đăng xuất" aria-label="Đăng xuất">
        <LogOut size={19} />
      </button>

      {showSearch && (
        <div className="search-overlay">
          <button className="search-backdrop" onClick={() => setShowSearch(false)} aria-label="Đóng tìm kiếm" />
          <form className="search-panel" onSubmit={submitSearch}>
            <Search size={20} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm đồng hồ, thương hiệu, phong cách..."
            />
            <button type="button" onClick={() => setShowSearch(false)} aria-label="Đóng tìm kiếm">
              <X size={20} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

