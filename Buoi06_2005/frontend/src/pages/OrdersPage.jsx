import { ArrowLeft, Eye, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { fetchOrders } from "../store/ordersSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <>
      <Header />
      <main className="shell order-shell">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Quay lại trang chủ</Link>
        <section className="orders-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Theo dõi đơn hàng</p>
              <h1>Lịch sử mua hàng</h1>
            </div>
            <button className="ghost" onClick={() => dispatch(fetchOrders())}>
              <RefreshCw size={16} />
              Tải lại
            </button>
          </div>
          {status === "loading" && <p className="muted">Đang tải đơn hàng...</p>}
          {error && <p className="notice">{error}</p>}
          {items.length === 0 && status !== "loading" && <p className="muted">Bạn chưa có đơn hàng nào.</p>}
          <div className="order-list">
            {items.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <strong>{order.id}</strong>
                  <span>{dateTime.format(new Date(order.createdAt))}</span>
                </div>
                <div>
                  <span>Trạng thái</span>
                  <b className={`status-badge ${order.status.toLowerCase()}`}>{order.statusLabel}</b>
                </div>
                <div>
                  <span>Thanh toán</span>
                  <b>{order.paymentMethod}</b>
                </div>
                <div>
                  <span>Tổng tiền</span>
                  <b>{money.format(order.total)}</b>
                </div>
                <Link className="icon-button" to={`/orders/${order.id}`}>
                  <Eye size={16} />
                  Chi tiết
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
