import { LogOut, ShoppingCart, UserRound } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearCart } from "../store/cartSlice";
import { logout } from "../store/authSlice";

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
      <div className="cart-pill">
        <ShoppingCart size={18} />
        <span>{count}</span>
      </div>
      <button className="icon-only" onClick={signOut} title="Logout">
        <LogOut size={19} />
      </button>
    </header>
  );
}
