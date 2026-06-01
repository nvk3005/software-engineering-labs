import { ArrowLeft, Check, CircleX, ClipboardX, Clock, Copy, Package, RotateCcw, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { addToCart } from "../store/cartSlice";
import { cancelOrder, clearSelectedOrder, fetchOrderDetail } from "../store/ordersSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

const steps = [
  { status: "NEW", label: "Đơn hàng mới", icon: Clock },
  { status: "CONFIRMED", label: "Đã xác nhận", icon: Package },
  { status: "PREPARING", label: "Chuẩn bị hàng", icon: Package },
  { status: "SHIPPING", label: "Đang giao", icon: Truck },
  { status: "DELIVERED", label: "Đã giao", icon: Package },
];

const terminalStatuses = ["CANCELLED", "CANCEL_REQUESTED"];
const completedStatuses = ["DELIVERED"];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: order, error } = useSelector((state) => state.orders);
  const [reason, setReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [reorderError, setReorderError] = useState("");

  useEffect(() => {
    dispatch(clearSelectedOrder());
    dispatch(fetchOrderDetail(orderId));
  }, [dispatch, orderId]);

  const activeIndex = useMemo(() => {
    if (!order || terminalStatuses.includes(order.status)) return -1;
    return steps.findIndex((step) => step.status === order.status);
  }, [order]);

  const progressPercent = activeIndex < 0 ? 0 : (activeIndex / (steps.length - 1)) * 100;
  const canReorder = order && completedStatuses.includes(order.status);

  const submitCancel = () => {
    if (order) dispatch(cancelOrder({ orderId: order.id, reason }));
  };

  const copyOrderCode = async () => {
    if (!order) return;

    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = order.id;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const reorder = async () => {
    if (!order) return;
    const reorderItems = order.items.filter((item) => item.productId);
    if (!reorderItems.length) {
      setReorderError("Đơn hàng này không còn sản phẩm khả dụng để đặt lại.");
      return;
    }

    setReorderError("");
    setReordering(true);
    try {
      for (const item of reorderItems) {
        await dispatch(addToCart({ productId: item.productId, quantity: item.quantity })).unwrap();
      }
      navigate("/cart");
    } catch {
      setReorderError("Không thể thêm lại toàn bộ sản phẩm vào giỏ. Vui lòng thử lại sau.");
    } finally {
      setReordering(false);
    }
  };

  return (
    <>
      <Header />
      <main className="shell order-shell">
        <Link to="/orders" className="back-link"><ArrowLeft size={16} /> Lịch sử đơn hàng</Link>
        {!order && !error && <p className="muted">Đang tải chi tiết đơn hàng...</p>}
        {!order && error && (
          <section className="orders-panel order-main-card empty-order-state">
            <p className="notice error">{error}</p>
            <Link className="primary" to="/orders">Quay lại lịch sử đơn hàng</Link>
          </section>
        )}
        {order && (
          <div className="order-detail-layout refined-order single-order-page">
            <section className="orders-panel order-main-card">
              <div className="order-detail-head">
                <div>
                  <p className="eyebrow">Chi tiết đơn hàng</p>
                  <div className="order-code-row">
                    <h1 className="order-code">{order.id}</h1>
                    <button className={`copy-code-button ${copied ? "copied" : ""}`} type="button" onClick={copyOrderCode}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Đã sao chép" : "Sao chép"}
                    </button>
                  </div>
                  <p className="muted">Đặt lúc {dateTime.format(new Date(order.createdAt))}</p>
                </div>
                <div className="order-head-actions">
                  <b className={`status-badge ${order.status.toLowerCase()}`}>{order.statusLabel}</b>
                  {canReorder && (
                    <button className="reorder-button prominent" onClick={reorder} disabled={reordering}>
                      <RotateCcw size={16} />
                      {reordering ? "Đang thêm vào giỏ..." : "Đặt lại đơn hàng"}
                    </button>
                  )}
                </div>
              </div>

              {terminalStatuses.includes(order.status) ? (
                <div className="cancel-state progress-cancelled">
                  <ClipboardX size={22} />
                  <strong>{order.statusLabel}</strong>
                  {order.cancelReason && <span>Lý do: {order.cancelReason}</span>}
                </div>
              ) : (
                <section className="progress-card">
                  <div className="progress-meta">
                    <span>Quy trình đơn hàng</span>
                    <strong>{steps[activeIndex]?.label || order.statusLabel}</strong>
                  </div>
                  <div className="progress-track" style={{ "--progress": `${progressPercent}%` }}>
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const active = index <= activeIndex;
                      return (
                        <div className={`progress-step ${active ? "active" : ""}`} key={step.status}>
                          <span><Icon size={16} /></span>
                          <b>{step.label}</b>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="inline-shipping-card">
                <div>
                  <p className="eyebrow">Thông tin khách hàng</p>
                  <h2>{order.shippingInfo.name}</h2>
                  <p>{order.shippingInfo.phone}</p>
                  <p>{order.shippingInfo.address}</p>
                  {order.shippingInfo.note && <p className="muted">{order.shippingInfo.note}</p>}
                </div>
                <div className="payment-method active">
                  <strong>{order.paymentMethod}</strong>
                  <span>Thanh toán khi nhận hàng</span>
                </div>
              </section>

              <section className="order-products refined-products">
                {order.items.map((item) => {
                  const content = (
                    <>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.quantity} x {money.format(item.price)}</span>
                      </div>
                      <b>{money.format(item.subtotal)}</b>
                    </>
                  );

                  return item.productId ? (
                    <Link className="summary-item refined-item linked-order-item" to={`/products/${item.productId}`} key={item.productId}>
                      {content}
                    </Link>
                  ) : (
                    <div className="summary-item refined-item" key={item.name}>
                      {content}
                    </div>
                  );
                })}
              </section>
              <div className="total refined-total">
                <span>Tổng thanh toán</span>
                <strong>{money.format(order.total)}</strong>
              </div>

              {canReorder && (
                <section className="reorder-cta-card">
                  <div>
                    <strong>Mua lại đơn hàng này?</strong>
                    <p>Thêm nhanh toàn bộ sản phẩm vào giỏ để kiểm tra số lượng và thanh toán lại.</p>
                  </div>
                  <button className="reorder-button prominent" onClick={reorder} disabled={reordering}>
                    <RotateCcw size={16} />
                    {reordering ? "Đang thêm..." : "Đặt lại đơn hàng"}
                  </button>
                </section>
              )}

              {order.canCancel && (
                <div className="cancel-box">
                  <label>
                    Lý do hủy
                    <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Không bắt buộc" />
                  </label>
                  <button className="ghost danger cancel-action" onClick={submitCancel}>
                    <CircleX size={18} />
                    {order.cancelMode === "REQUEST" ? "Gửi yêu cầu hủy" : "Hủy đơn hàng"}
                  </button>
                </div>
              )}
              {reorderError && <p className="notice error">{reorderError}</p>}
              {error && <p className="notice error">{error}</p>}
            </section>
          </div>
        )}
      </main>
    </>
  );
}