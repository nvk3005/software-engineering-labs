import { CheckCircle2, ShoppingBag, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clearCartToast } from "../store/cartSlice";

export default function CartToast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.cart.toast);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => dispatch(clearCartToast()), 3200);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast]);

  if (!toast) return null;

  const Icon = toast.type === "error" ? XCircle : CheckCircle2;

  return (
    <aside className={`cart-toast ${toast.type}`} role="status" aria-live="polite">
      <div className="cart-toast-icon">
        <Icon size={21} />
      </div>
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      {toast.type !== "error" && (
        <Link to="/cart" onClick={() => dispatch(clearCartToast())}>
          <ShoppingBag size={15} />
          Xem giỏ
        </Link>
      )}
      <button type="button" onClick={() => dispatch(clearCartToast())} aria-label="Đóng thông báo">×</button>
    </aside>
  );
}