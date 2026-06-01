import { ArrowLeft, Banknote, Coins, PackageCheck, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { setLoyaltyPoints } from "../store/authSlice";
import { clearCart, fetchCart } from "../store/cartSlice";
import { checkoutOrder, clearCheckoutPreview, previewCheckout } from "../store/ordersSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const integer = new Intl.NumberFormat("vi-VN");

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const {
    checkoutStatus,
    error,
    preview,
    previewStatus,
    previewError,
  } = useSelector((state) => state.orders);

  const [paymentMethod, setPaymentMethod] = useState(
    searchParams.get("payment") === "MOMO" ? "MOMO" : "COD",
  );
  const [uiNotice, setUiNotice] = useState("");
  const [pointsInput, setPointsInput] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
  });

  const availablePoints = Number(user?.loyaltyPoints || 0);

  const normalizedPoints = useMemo(() => {
    const parsed = Number(pointsInput);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
  }, [pointsInput]);

  const rawSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const pricing = preview?.pricing || {
    subtotal: rawSubtotal,
    pointsDiscount: 0,
    shippingFee: 0,
    finalTotal: rawSubtotal,
  };

  const loyalty = preview?.loyalty || {
    availablePoints,
    maxRedeemPoints: 0,
    minRedeemPoints: 0,
    maxRedeemRatio: 0.5,
    vndPerPoint: 100,
  };

  const maxRedeemPoints = Number(loyalty.maxRedeemPoints || 0);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (!items.length) {
      dispatch(clearCheckoutPreview());
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch(
        previewCheckout({
          paymentMethod: "COD",
          pointsToRedeem: normalizedPoints,
        }),
      );
    }, 220);

    return () => window.clearTimeout(timer);
  }, [dispatch, items.length, normalizedPoints]);

  useEffect(
    () => () => {
      dispatch(clearCheckoutPreview());
    },
    [dispatch],
  );

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const applyMaxPoints = () => {
    if (!maxRedeemPoints) {
      setPointsInput("0");
      return;
    }
    setPointsInput(String(maxRedeemPoints));
  };

  const clearPoints = () => {
    setPointsInput("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setUiNotice("");

    if (paymentMethod === "MOMO") {
      setUiNotice("MoMo đã có giao diện chọn thanh toán. Phần tạo giao dịch sẽ được tích hợp sau, nên hiện tại bạn có thể đổi sang COD để đặt đơn.");
      return;
    }

    const result = await dispatch(
      checkoutOrder({
        paymentMethod: "COD",
        pointsToRedeem: normalizedPoints,
        shippingInfo: form,
      }),
    );

    if (checkoutOrder.fulfilled.match(result)) {
      const { order, loyalty: loyaltyData } = result.payload;
      if (typeof loyaltyData?.currentPoints === "number") {
        dispatch(setLoyaltyPoints(loyaltyData.currentPoints));
      }
      dispatch(clearCart());
      navigate(`/orders/${order.id}`);
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

            <section className="checkout-loyalty-card">
              <div className="checkout-loyalty-head">
                <strong><Coins size={18} /> Dùng điểm tích lũy</strong>
                <span>Bạn có {integer.format(availablePoints)} điểm</span>
              </div>
              <label>
                Điểm muốn dùng
                <input
                  inputMode="numeric"
                  value={pointsInput}
                  onChange={(event) => setPointsInput(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Nhập số điểm"
                />
              </label>
              <div className="checkout-loyalty-actions">
                <button type="button" className="ghost" onClick={applyMaxPoints}>Dùng tối đa {integer.format(maxRedeemPoints)} điểm</button>
                <button type="button" className="ghost" onClick={clearPoints}>Bỏ dùng điểm</button>
              </div>
              <p className="muted">
                1 điểm = {money.format(loyalty.vndPerPoint || 100)}. Dùng tối đa {Math.round((loyalty.maxRedeemRatio || 0.5) * 100)}% giá trị đơn. Tối thiểu {integer.format(loyalty.minRedeemPoints || 0)} điểm/lần.
              </p>
              {previewStatus === "loading" && <p className="muted small">Đang cập nhật ưu đãi điểm...</p>}
              {previewError && <p className="notice error">{previewError}</p>}
            </section>

            {uiNotice && <p className="notice">{uiNotice}</p>}
            {error && <p className="notice error">{error}</p>}
            <button className="primary full" disabled={!items.length || checkoutStatus === "loading" || previewStatus === "loading"}>
              <PackageCheck size={18} />
              {checkoutStatus === "loading" ? "Đang đặt hàng..." : paymentMethod === "MOMO" ? "Tiếp tục với MoMo" : "Xác nhận đặt hàng"}
            </button>
          </form>

          <section className="order-summary checkout-summary-card">
            <h2>Giỏ hàng</h2>
            {items.length === 0 && <p className="muted">Giỏ hàng đang trống.</p>}
            {items.map((item) => (
              <Link className="summary-item linked-order-item" to={`/products/${item.product.id}`} key={item.product.id}>
                <img src={item.product.images[0]} alt={item.product.name} />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>{item.quantity} x {money.format(item.product.price)}</span>
                </div>
                <b>{money.format(item.product.price * item.quantity)}</b>
              </Link>
            ))}

            <div className="checkout-pricing-grid">
              <div className="checkout-pricing-row">
                <span>Tạm tính</span>
                <strong>{money.format(pricing.subtotal || rawSubtotal)}</strong>
              </div>
              <div className="checkout-pricing-row">
                <span>Giảm từ điểm</span>
                <strong className={pricing.pointsDiscount ? "discount" : ""}>-{money.format(pricing.pointsDiscount || 0)}</strong>
              </div>
              <div className="checkout-pricing-row">
                <span>Phí giao hàng</span>
                <strong>{pricing.shippingFee ? money.format(pricing.shippingFee) : "Miễn phí"}</strong>
              </div>
            </div>

            <div className="total">
              <span>Tổng thanh toán</span>
              <strong>{money.format(pricing.finalTotal || rawSubtotal)}</strong>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
