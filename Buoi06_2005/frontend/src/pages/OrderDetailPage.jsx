import { ArrowLeft, CircleX, ClipboardX, Clock, Package, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { cancelOrder, clearSelectedOrder, fetchOrderDetail } from "../store/ordersSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

const steps = [
  { status: "NEW", label: "Đơn hàng mới", icon: Clock },
  { status: "CONFIRMED", label: "Đã xác nhận", icon: Package },
  { status: "PREPARING", label: "Shop đang chuẩn bị hàng", icon: Package },
  { status: "SHIPPING", label: "Đang giao hàng", icon: Truck },
  { status: "DELIVERED", label: "Đã giao thành công", icon: Package },
];

const terminalStatuses = ["CANCELLED", "CANCEL_REQUESTED"];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { selected: order, error } = useSelector((state) => state.orders);
  const [reason, setReason] = useState("");

  useEffect(() => {
    dispatch(clearSelectedOrder());
    dispatch(fetchOrderDetail(orderId));
  }, [dispatch, orderId]);

  const activeIndex = useMemo(() => {
    if (!order || terminalStatuses.includes(order.status)) return -1;
    return steps.findIndex((step) => step.status === order.status);
  }, [order]);

  const submitCancel = () => {
    if (order) dispatch(cancelOrder({ orderId: order.id, reason }));
  };

  return (
    <>
      <Header />
      <main className="shell order-shell">
        <Link to="/orders" className="back-link"><ArrowLeft size={16} /> Lịch sử đơn hàng</Link>
        {!order && <p className="muted">Đang tải chi tiết đơn hàng...</p>}
        {order && (
          <div className="order-detail-layout">
            <section className="orders-panel">
              <p className="eyebrow">Chi tiết đơn hàng</p>
              <div className="order-title-row">
                <div>
                  <h1>{order.id}</h1>
                  <p className="muted">Đặt lúc {dateTime.format(new Date(order.createdAt))}</p>
                </div>
                <b className={`status-badge ${order.status.toLowerCase()}`}>{order.statusLabel}</b>
              </div>

              <div className="tracking">
                {terminalStatuses.includes(order.status) ? (
                  <div className="cancel-state">
                    <ClipboardX size={22} />
                    <strong>{order.statusLabel}</strong>
                    {order.cancelReason && <span>Lý do: {order.cancelReason}</span>}
                  </div>
                ) : (
                  steps.map((step, index) => {
                    const Icon = step.icon;
                    const active = index <= activeIndex;
                    return (
                      <div className={`track-step ${active ? "active" : ""}`} key={step.status}>
                        <span><Icon size={17} /></span>
                        <strong>{step.label}</strong>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="order-products">
                {order.items.map((item) => (
                  <div className="summary-item" key={item.productId}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.quantity} x {money.format(item.price)}</span>
                    </div>
                    <b>{money.format(item.subtotal)}</b>
                  </div>
                ))}
              </div>
              <div className="total">
                <span>Tổng thanh toán</span>
                <strong>{money.format(order.total)}</strong>
              </div>
            </section>

            <aside className="order-summary">
              <h2>Giao hàng</h2>
              <p><strong>{order.shippingInfo.name}</strong></p>
              <p>{order.shippingInfo.phone}</p>
              <p>{order.shippingInfo.address}</p>
              {order.shippingInfo.note && <p className="muted">{order.shippingInfo.note}</p>}
              <div className="payment-method active">
                <strong>COD</strong>
                <span>Thanh toán khi nhận hàng</span>
              </div>
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
              {error && <p className="notice">{error}</p>}
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
