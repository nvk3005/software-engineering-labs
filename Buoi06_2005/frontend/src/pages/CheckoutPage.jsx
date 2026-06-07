import { ArrowLeft, Banknote, PackageCheck, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { fetchCart } from "../store/cartSlice";
import { checkoutOrder } from "../store/ordersSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const { checkoutStatus, error } = useSelector((state) => state.orders);
  const [paymentMethod, setPaymentMethod] = useState(searchParams.get("payment") === "MOMO" ? "MOMO" : "COD");
  const [uiNotice, setUiNotice] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
  });

  const selectedProductIds = useMemo(
    () => searchParams.get("selected")?.split(",").map((id) => id.trim()).filter(Boolean) || [],
    [searchParams],
  );

  const checkoutItems = useMemo(
    () => (selectedProductIds.length ? items.filter((item) => selectedProductIds.includes(item.product.id)) : items),
    [items, selectedProductIds],
  );

  const total = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [checkoutItems],
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setUiNotice("");

    if (!checkoutItems.length) {
      setUiNotice("Vui lòng quay lại giỏ hàng và chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    if (paymentMethod === "MOMO") {
      setUiNotice("MoMo đã có giao diện chọn thanh toán. Phần tạo giao dịch sẽ được tích hợp sau, nên hiện tại bạn có thể đổi sang COD để đặt đơn.");
      return;
    }

    const result = await dispatch(
      checkoutOrder({
        paymentMethod: "COD",
        selectedProductIds,
        shippingInfo: form,
      }),
    );

    if (checkoutOrder.fulfilled.match(result)) {
      dispatch(fetchCart());
      navigate(`/orders/${result.payload.id}`);
    }
  };

  return (
    <>
      <Header />
      <main className="shell order-shell">
        <Link to="/cart" className="back-link"><ArrowLeft size={16} /> Quay lại giỏ hàng</Link>
        <div className="checkout-layout refined-checkout">
          <form className="checkout-form" onSubmit={submit}>
            <p className="eyebrow">Thanh toán</p>
            <h1>Hoàn tất đơn hàng</h1>
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

            <div className="checkout-payment-options">
              <button type="button" className={`payment-method ${paymentMethod === "COD" ? "active" : ""}`} onClick={() => { setPaymentMethod("COD"); setUiNotice(""); }}>
                <Banknote size={20} />
                <div>
                  <strong>Thanh toán khi nhận hàng (COD)</strong>
                  <span>Kiểm tra sản phẩm trước khi thanh toán.</span>
                </div>
              </button>
              <button type="button" className={`payment-method momo-method ${paymentMethod === "MOMO" ? "active" : ""}`} onClick={() => setPaymentMethod("MOMO")}>
                <Smartphone size={20} />
                <div>
                  <strong>Ví MoMo</strong>
                  <span>Giao diện đã chuẩn bị, chờ tích hợp cổng thanh toán.</span>
                </div>
              </button>
            </div>

            {selectedProductIds.length > 0 && (
              <p className="notice success">Bạn đang thanh toán {checkoutItems.length} sản phẩm đã chọn từ giỏ hàng.</p>
            )}
            {uiNotice && <p className="notice">{uiNotice}</p>}
            {error && <p className="notice error">{error}</p>}
            <button className="primary full" disabled={!checkoutItems.length || checkoutStatus === "loading"}>
              <PackageCheck size={18} />
              {checkoutStatus === "loading" ? "Đang đặt hàng..." : paymentMethod === "MOMO" ? "Tiếp tục với MoMo" : "Xác nhận đặt hàng"}
            </button>
          </form>

          <section className="order-summary checkout-summary-card">
            <h2>Giỏ hàng</h2>
            {!checkoutItems.length && <p className="muted">Chưa có sản phẩm nào được chọn để thanh toán.</p>}
            {checkoutItems.map((item) => (
              <Link className="summary-item linked-order-item" to={`/products/${item.product.id}`} key={item.product.id}>
                <img src={item.product.images[0]} alt={item.product.name} />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>{item.quantity} x {money.format(item.product.price)}</span>
                </div>
                <b>{money.format(item.product.price * item.quantity)}</b>
              </Link>
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
