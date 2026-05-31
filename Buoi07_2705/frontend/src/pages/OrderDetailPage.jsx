import {
  ArrowLeft,
  Check,
  CircleX,
  ClipboardX,
  Clock,
  Copy,
  ImagePlus,
  Package,
  RotateCcw,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";
import { setLoyaltyPoints } from "../store/authSlice";
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

function normalizeRating(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 5;
  return Math.min(5, Math.max(1, Math.round(numeric)));
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: order, error } = useSelector((state) => state.orders);
  const [reason, setReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [reorderError, setReorderError] = useState("");

  const [reviewableByProduct, setReviewableByProduct] = useState({});
  const [reviewProductId, setReviewProductId] = useState("");
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "", images: [] });
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewNotice, setReviewNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    dispatch(clearSelectedOrder());
    dispatch(fetchOrderDetail(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!order?.id) return undefined;

    let active = true;
    const loadReviewableItems = async () => {
      try {
        const { data } = await api.get(`/orders/${order.id}/reviewable-items`);
        if (!active) return;
        const reviewMap = Object.fromEntries(
          (data.items || []).map((item) => [
            item.productId,
            {
              reviewed: Boolean(item.reviewed),
              canReview: Boolean(item.canReview),
              review: item.review || null,
            },
          ]),
        );
        setReviewableByProduct(reviewMap);
      } catch {
        if (active) setReviewableByProduct({});
      }
    };

    loadReviewableItems();
    return () => {
      active = false;
    };
  }, [order?.id, order?.status]);

  useEffect(
    () => () => {
      reviewImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    },
    [reviewImagePreviews],
  );

  const activeIndex = useMemo(() => {
    if (!order || terminalStatuses.includes(order.status)) return -1;
    return steps.findIndex((step) => step.status === order.status);
  }, [order]);

  const progressPercent = activeIndex < 0 ? 0 : (activeIndex / (steps.length - 1)) * 100;
  const canReorder = order && completedStatuses.includes(order.status);

  const resetReviewDraft = ({ keepNotice = false } = {}) => {
    setReviewDraft({ rating: 5, comment: "", images: [] });
    reviewImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setReviewImagePreviews([]);
    if (!keepNotice) {
      setReviewNotice({ type: "", text: "" });
    }
  };

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

  const chooseReviewImages = (event) => {
    const pickedFiles = Array.from(event.target.files || []).slice(0, 2);
    reviewImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setReviewImagePreviews(pickedFiles.map((file) => URL.createObjectURL(file)));
    setReviewDraft((current) => ({ ...current, images: pickedFiles }));
  };

  const openReviewForm = (productId) => {
    setReviewProductId(productId);
    resetReviewDraft();
  };

  const submitReview = async (productId) => {
    if (!order || !productId) return;
    const comment = reviewDraft.comment.trim();
    if (comment.length < 3) {
      setReviewNotice({ type: "error", text: "Bình luận tối thiểu 3 ký tự." });
      return;
    }

    setReviewSubmitting(true);
    setReviewNotice({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", String(normalizeRating(reviewDraft.rating)));
      formData.append("comment", comment);
      reviewDraft.images.forEach((file) => formData.append("images", file));

      const { data } = await api.post(`/orders/${order.id}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const earned = Number(data.reward?.pointsEarned || 0);
      const total = Number(data.reward?.totalPoints || 0);
      dispatch(setLoyaltyPoints(total));

      setReviewableByProduct((current) => ({
        ...current,
        [productId]: {
          reviewed: true,
          canReview: false,
          review: data.review,
        },
      }));
      setReviewNotice({
        type: "success",
        text: `Đánh giá thành công. Bạn nhận +${earned} điểm (tổng ${total} điểm).`,
      });
      setReviewProductId("");
      resetReviewDraft({ keepNotice: true });
      dispatch(fetchOrderDetail(order.id));
    } catch (apiError) {
      setReviewNotice({
        type: "error",
        text: apiError?.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.",
      });
    } finally {
      setReviewSubmitting(false);
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
                  const reviewState = reviewableByProduct[item.productId] || {
                    reviewed: Boolean(item.reviewed),
                    canReview: Boolean(item.canReview),
                    review: null,
                  };

                  const mainItem = item.productId ? (
                    <Link className="summary-item refined-item linked-order-item" to={`/products/${item.productId}`}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.quantity} x {money.format(item.price)}</span>
                      </div>
                      <b>{money.format(item.subtotal)}</b>
                    </Link>
                  ) : (
                    <div className="summary-item refined-item">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.quantity} x {money.format(item.price)}</span>
                      </div>
                      <b>{money.format(item.subtotal)}</b>
                    </div>
                  );

                  return (
                    <div className="order-product-block" key={`${order.id}-${item.productId}-${item.name}`}>
                      {mainItem}

                      {reviewState.reviewed && reviewState.review && (
                        <div className="reviewed-badge">
                          <Star size={14} fill="currentColor" />
                          Đã đánh giá {normalizeRating(reviewState.review.rating)} sao
                        </div>
                      )}

                      {!reviewState.reviewed && reviewState.canReview && (
                        <button className="reorder-button review-trigger" onClick={() => openReviewForm(item.productId)}>
                          <Star size={16} />
                          Đánh giá + nhận điểm
                        </button>
                      )}

                      {reviewProductId === item.productId && (
                        <form
                          className="review-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            submitReview(item.productId);
                          }}
                        >
                          <div className="review-stars">
                            {Array.from({ length: 5 }, (_, index) => {
                              const score = index + 1;
                              const active = score <= normalizeRating(reviewDraft.rating);
                              return (
                                <button
                                  type="button"
                                  key={`${item.productId}-${score}`}
                                  className={active ? "active" : ""}
                                  onClick={() => setReviewDraft((current) => ({ ...current, rating: score }))}
                                >
                                  <Star size={18} fill={active ? "currentColor" : "none"} strokeWidth={active ? 0 : 2} />
                                  {score}
                                </button>
                              );
                            })}
                          </div>

                          <textarea
                            placeholder="Chia sẻ trải nghiệm thật của bạn về sản phẩm..."
                            value={reviewDraft.comment}
                            onChange={(event) => setReviewDraft((current) => ({ ...current, comment: event.target.value }))}
                            maxLength={1200}
                          />

                          <label className="review-image-picker">
                            <ImagePlus size={16} />
                            Thêm tối đa 2 ảnh
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              multiple
                              onChange={chooseReviewImages}
                            />
                          </label>

                          {reviewImagePreviews.length > 0 && (
                            <div className="review-preview-grid">
                              {reviewImagePreviews.map((src) => <img key={src} src={src} alt="Ảnh bình luận" />)}
                            </div>
                          )}

                          <div className="review-form-actions">
                            <button type="button" className="ghost" onClick={() => { setReviewProductId(""); resetReviewDraft(); }}>
                              Hủy
                            </button>
                            <button type="submit" className="primary" disabled={reviewSubmitting}>
                              {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                          </div>
                        </form>
                      )}
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

              {reviewNotice.text && <p className={`notice ${reviewNotice.type === "error" ? "error" : "success"}`}>{reviewNotice.text}</p>}
              {reorderError && <p className="notice error">{reorderError}</p>}
              {error && <p className="notice error">{error}</p>}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
