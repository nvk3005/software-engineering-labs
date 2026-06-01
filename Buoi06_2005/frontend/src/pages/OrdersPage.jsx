import { ArrowLeft, Eye, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { addToCart } from "../store/cartSlice";
import { fetchOrders } from "../store/ordersSlice";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const completedStatuses = ["DELIVERED"];

export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error } = useSelector((state) => state.orders);
  const [reorderingId, setReorderingId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const reorder = async (order) => {
    const reorderItems = order.items.filter((item) => item.productId);
    if (!reorderItems.length) {
      setNotice("Đơn hàng này không còn sản phẩm khả dụng để đặt lại.");
      return;
    }

    setNotice("");
    setReorderingId(order.id);
    try {
      for (const item of reorderItems) {
        await dispatch(addToCart({ productId: item.productId, quantity: item.quantity })).unwrap();
      }
      navigate("/cart");
    } catch {
      setNotice("Không thể thêm lại toàn bộ sản phẩm vào giỏ. Vui lòng thử lại sau.");
    } finally {
      setReorderingId("");
    }
  };

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
          {error && <p className="notice error">{error}</p>}
          {notice && <p className="notice error">{notice}</p>}
          {items.length === 0 && status !== "loading" && <p className="muted">Bạn chưa có đơn hàng nào.</p>}
          <div className="order-list">
            {items.map((order) => {
              const canReorder = completedStatuses.includes(order.status);
              return (
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
                  <div className="order-card-actions">
                    <Link className="icon-button" to={`/orders/${order.id}`}>
                      <Eye size={16} />
                      Chi tiết
                    </Link>
                    {canReorder && (
                      <button className="reorder-button" onClick={() => reorder(order)} disabled={reorderingId === order.id}>
                        <RotateCcw size={16} />
                        {reorderingId === order.id ? "Đang thêm..." : "Đặt lại"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}