import { CreditCard, Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeCartItem, updateCartItem } from "../store/cartSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CartPanel() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <section className="cart-panel">
      <h2>Giỏ hàng</h2>
      {items.length === 0 && <p className="muted">Chưa có sản phẩm nào.</p>}
      {items.map((item) => (
        <div className="cart-item" key={item.product.id}>
          <img src={item.product.images[0]} alt={item.product.name} />
          <div>
            <strong>{item.product.name}</strong>
            <span>{money.format(item.product.price)}</span>
            <div className="qty">
              <button onClick={() => dispatch(updateCartItem({ productId: item.product.id, quantity: item.quantity - 1 }))}><Minus size={14} /></button>
              <b>{item.quantity}</b>
              <button onClick={() => dispatch(updateCartItem({ productId: item.product.id, quantity: item.quantity + 1 }))}><Plus size={14} /></button>
              <button onClick={() => dispatch(removeCartItem(item.product.id))}><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      ))}
      <div className="total">
        <span>Tạm tính</span>
        <strong>{money.format(total)}</strong>
      </div>
      <Link className={`primary full ${items.length ? "" : "disabled"}`} to={items.length ? "/checkout" : "#"}>
        <CreditCard size={18} />
        Thanh toán COD
      </Link>
    </section>
  );
}
