import { ClipboardList, LogOut, ShoppingCart, UserRound } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const count = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  const signOut = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/auth");
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand">LuxeWatch</Link>
      <div className="member">
        <UserRound size={18} />
        <span>{user?.name || "Member"}</span>
      </div>
      <Link className="cart-pill" to="/orders" title="Lịch sử đơn hàng">
        <ClipboardList size={18} />
        <span>Đơn hàng</span>
      </Link>
      <Link className="cart-pill" to="/checkout" title="Giỏ hàng">
        <ShoppingCart size={18} />
        <span>{count}</span>
      </Link>
      <button className="icon-only" onClick={signOut} title="Logout">
        <LogOut size={19} />
      </button>
    </header>
  );
}
