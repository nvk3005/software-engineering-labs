import { ArrowLeft, CreditCard, Minus, Plus, ShieldCheck, ShoppingBag, Smartphone, Trash2, Watch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { fetchCart, removeCartItem, updateCartItem } from "../store/cartSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );
  const shippingFee = items.length ? 0 : 0;
  const total = subtotal + shippingFee;

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      dispatch(removeCartItem(productId));
      return;
    }
    dispatch(updateCartItem({ productId, quantity }));
  };

  return (
    <>
      <Header />
      <main className="shell cart-page-shell">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Tiếp tục mua sắm</Link>

        <section className="cart-hero-panel">
          <div className="cart-hero-copy">
            <span className="cart-kicker"><ShoppingBag size={15} /> Giỏ hàng của bạn</span>
            <h1>Sẵn sàng cho chiếc đồng hồ tiếp theo.</h1>
            <p>Kiểm tra lại lựa chọn, số lượng và phương thức thanh toán trước khi LuxeWatch chuẩn bị đơn hàng cho bạn.</p>
          </div>
          <div className="cart-hero-visual" aria-hidden="true">
            <div className="cart-watch-orbit">
              <Watch size={54} strokeWidth={1.35} />
            </div>
            <div className="cart-hero-stat">
              <span>{items.length}</span>
              <small>sản phẩm</small>
            </div>
            <div className="cart-hero-total">
              <small>Tạm tính</small>
              <strong>{money.format(subtotal)}</strong>
            </div>
          </div>
        </section>

        <section className="cart-page-grid">
          <div className="cart-list-card">
            <div className="cart-card-head">
              <div>
                <p className="eyebrow">Danh sách sản phẩm</p>
                <h2>{items.length} sản phẩm</h2>
              </div>
              <span>Miễn phí giao hàng</span>
            </div>

            {items.length === 0 && (
              <div className="empty-cart-state">
                <div><CreditCard size={28} /></div>
                <h3>Giỏ hàng đang trống</h3>
                <p>Hãy chọn một chiếc đồng hồ phù hợp trước khi thanh toán.</p>
                <Link className="primary" to="/">Khám phá sản phẩm</Link>
              </div>
            )}

            {items.map((item) => (
              <article className="cart-line-item" key={item.product.id}>
                <Link className="cart-product-image" to={`/products/${item.product.id}`}>
                  <img src={item.product.images[0]} alt={item.product.name} />
                </Link>
                <div className="cart-product-info">
                  <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                  <span>{item.product.brand} · {item.product.category}</span>
                  <strong>{money.format(item.product.price)}</strong>
                </div>
                <div className="cart-line-actions">
                  <div className="qty cart-qty">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Giảm số lượng"><Minus size={14} /></button>
                    <b>{item.quantity}</b>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Tăng số lượng"><Plus size={14} /></button>
                  </div>
                  <button className="remove-cart-button" onClick={() => dispatch(removeCartItem(item.product.id))}>
                    <Trash2 size={15} /> Xóa
                  </button>
                </div>
                <b className="cart-line-total">{money.format(item.product.price * item.quantity)}</b>
              </article>
            ))}
          </div>

          <aside className="cart-summary-card">
            <p className="eyebrow">Tóm tắt đơn hàng</p>
            <h2>Thanh toán</h2>

            <div className="cart-money-row">
              <span>Tạm tính</span>
              <strong>{money.format(subtotal)}</strong>
            </div>
            <div className="cart-money-row">
              <span>Giao hàng</span>
              <strong>{items.length ? "Miễn phí" : money.format(0)}</strong>
            </div>
            <div className="cart-money-row total-row">
              <span>Tổng cộng</span>
              <strong>{money.format(total)}</strong>
            </div>

            <div className="payment-choice-group" aria-label="Phương thức thanh toán">
              <button className={paymentMethod === "COD" ? "active" : ""} onClick={() => setPaymentMethod("COD")}>
                <CreditCard size={19} />
                <span>
                  <strong>COD</strong>
                  <small>Thanh toán khi nhận hàng</small>
                </span>
              </button>
              <button className={paymentMethod === "MOMO" ? "active momo" : "momo"} onClick={() => setPaymentMethod("MOMO")}>
                <Smartphone size={19} />
                <span>
                  <strong>MoMo</strong>
                  <small>Giao diện đã sẵn sàng, tích hợp sau</small>
                </span>
              </button>
            </div>

            <div className="checkout-trust-note">
              <ShieldCheck size={17} />
              <span>Đơn hàng được giữ thông tin an toàn và có thể kiểm tra trước khi nhận.</span>
            </div>

            <Link className={`primary full ${items.length ? "" : "disabled"}`} to={items.length ? `/checkout?payment=${paymentMethod}` : "#"}>
              <CreditCard size={18} />
              Tiếp tục thanh toán
            </Link>
          </aside>
        </section>
      </main>
    </>
  );
}
