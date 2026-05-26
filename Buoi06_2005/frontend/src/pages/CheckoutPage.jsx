import { ArrowLeft, Banknote, PackageCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { clearCart, fetchCart } from "../store/cartSlice";
import { checkoutOrder } from "../store/ordersSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const { checkoutStatus, error } = useSelector((state) => state.orders);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
  });

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = await dispatch(
      checkoutOrder({
        paymentMethod: "COD",
        shippingInfo: form,
      }),
    );

    if (checkoutOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      navigate(`/orders/${result.payload.id}`);
    }
  };

  return (
    <>
      <Header />
      <main className="shell order-shell">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Quay lại mua hàng</Link>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <p className="eyebrow">Thanh toán</p>
            <h1>Đặt hàng COD</h1>
            <label>
              Họ tên người nhận
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>
            <label>
              Số điện thoại
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
            </label>
            <label>
              Địa chỉ giao hàng
              <input value={form.address} onChange={(event) => updateField("address", event.target.value)} required />
            </label>
            <label>
              Ghi chú
              <input value={form.note} onChange={(event) => updateField("note", event.target.value)} placeholder="Thời gian nhận hàng, lời nhắn..." />
            </label>
            <div className="payment-method active">
              <Banknote size={20} />
              <div>
                <strong>Thanh toán khi nhận hàng (COD)</strong>
                <span>Phương thức bắt buộc cho bài tập này</span>
              </div>
            </div>
            {error && <p className="notice">{error}</p>}
            <button className="primary full" disabled={!items.length || checkoutStatus === "loading"}>
              <PackageCheck size={18} />
              {checkoutStatus === "loading" ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
            </button>
          </form>

          <section className="order-summary">
            <h2>Giỏ hàng</h2>
            {items.length === 0 && <p className="muted">Giỏ hàng đang trống.</p>}
            {items.map((item) => (
              <div className="summary-item" key={item.product.id}>
                <img src={item.product.images[0]} alt={item.product.name} />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>{item.quantity} x {money.format(item.product.price)}</span>
                </div>
                <b>{money.format(item.product.price * item.quantity)}</b>
              </div>
            ))}
            <div className="total">
              <span>Tổng thanh toán</span>
              <strong>{money.format(total)}</strong>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
