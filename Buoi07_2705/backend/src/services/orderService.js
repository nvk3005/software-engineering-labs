import { Cart, Order, ORDER_STATUS, Product, Review, User } from "../models/index.js";

const CONFIRM_AFTER_MS = 30 * 60 * 1000;

const statusLabels = {
  [ORDER_STATUS.NEW]: "Đơn hàng mới",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận đơn hàng",
  [ORDER_STATUS.PREPARING]: "Shop đang chuẩn bị hàng",
  [ORDER_STATUS.SHIPPING]: "Đang giao hàng",
  [ORDER_STATUS.DELIVERED]: "Đã giao thành công",
  [ORDER_STATUS.CANCELLED]: "Hủy đơn hàng",
  [ORDER_STATUS.CANCEL_REQUESTED]: "Gửi yêu cầu hủy đơn cho shop",
};

function makeOrderId() {
  return `od-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toPositiveInt(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.floor(numeric));
}

function toNonNegativeInt(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.floor(numeric));
}

function parseRatio(rawValue, fallback = 0.5) {
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) return fallback;
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return Math.min(1, Math.max(0, normalized));
}

export function getLoyaltySettings() {
  return {
    vndPerPoint: toPositiveInt(process.env.LOYALTY_VND_PER_POINT, 100),
    minRedeemPoints: toNonNegativeInt(process.env.LOYALTY_MIN_REDEEM_POINTS, 100),
    maxRedeemRatio: parseRatio(process.env.LOYALTY_MAX_REDEEM_RATIO, 0.5),
  };
}

function normalizeShippingInfo(payload = {}, user = {}) {
  return {
    name: String(payload.name || user.name || "").trim(),
    phone: String(payload.phone || user.phone || "").trim(),
    address: String(payload.address || user.address || "").trim(),
    note: String(payload.note || "").trim(),
  };
}

function serializeOrder(order, reviewMap = new Map()) {
  const data = order.toObject ? order.toObject() : order;
  const settings = getLoyaltySettings();

  const subtotal = Number(data.pricing?.subtotal ?? data.total ?? 0);
  const promotionDiscount = Number(data.pricing?.promotionDiscount ?? 0);
  const couponDiscount = Number(data.pricing?.couponDiscount ?? 0);
  const pointsDiscount = Number(data.pricing?.pointsDiscount ?? 0);
  const shippingFee = Number(data.pricing?.shippingFee ?? 0);
  const finalTotal = Number(data.pricing?.finalTotal ?? data.total ?? 0);

  return {
    ...data,
    items: (data.items || []).map((item) => {
      const reviewed = reviewMap.get(item.productId);
      return {
        ...item,
        reviewed: Boolean(reviewed),
        canReview: data.status === ORDER_STATUS.DELIVERED && !reviewed,
      };
    }),
    pricing: {
      subtotal,
      promotionDiscount,
      couponDiscount,
      pointsDiscount,
      shippingFee,
      finalTotal,
    },
    loyalty: {
      pointsUsed: Number(data.loyalty?.pointsUsed ?? 0),
      vndPerPoint: Number(data.loyalty?.vndPerPoint ?? settings.vndPerPoint),
      maxRedeemRatio: Number(data.loyalty?.maxRedeemRatio ?? settings.maxRedeemRatio),
    },
    statusLabel: statusLabels[data.status] || data.status,
    canCancel:
      data.status === ORDER_STATUS.NEW ||
      data.status === ORDER_STATUS.PREPARING,
    cancelMode:
      data.status === ORDER_STATUS.PREPARING ? "REQUEST" : "DIRECT",
  };
}

async function applyAutoConfirmation(order) {
  if (
    order &&
    order.status === ORDER_STATUS.NEW &&
    Date.now() - new Date(order.createdAt).getTime() >= CONFIRM_AFTER_MS
  ) {
    order.status = ORDER_STATUS.CONFIRMED;
    order.confirmedAt = order.confirmedAt || new Date();
    await order.save();
  }
  return order;
}

async function validateCartItems(cartItems) {
  const productIds = cartItems.map((item) => item.product.id);
  const products = await Product.find({ id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const items = [];
  for (const cartItem of cartItems) {
    const product = productMap.get(cartItem.product.id);
    if (!product) {
      return {
        error: {
          status: 404,
          body: { message: `Sản phẩm ${cartItem.product.name} không còn tồn tại` },
        },
      };
    }

    if (product.stock < cartItem.quantity) {
      return {
        error: {
          status: 400,
          body: {
            message: `${product.name} chỉ còn ${product.stock} sản phẩm trong kho`,
          },
        },
      };
    }

    items.push({
      product,
      quantity: cartItem.quantity,
      subtotal: product.price * cartItem.quantity,
    });
  }

  return { items };
}

function buildLoyaltyPricing(items, requestedPoints, availablePoints) {
  const { vndPerPoint, minRedeemPoints, maxRedeemRatio } = getLoyaltySettings();

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const promotionDiscount = 0;
  const couponDiscount = 0;
  const shippingFee = 0;
  const discountedSubtotal = Math.max(0, subtotal - promotionDiscount - couponDiscount);

  const maxByRatio = Math.floor((discountedSubtotal * maxRedeemRatio) / vndPerPoint);
  const maxByBalance = toNonNegativeInt(availablePoints);
  const maxRedeemPoints = Math.max(0, Math.min(maxByBalance, maxByRatio));
  const normalizedRequestedPoints = toNonNegativeInt(requestedPoints);

  if (normalizedRequestedPoints > 0 && maxRedeemPoints <= 0) {
    return {
      error: {
        status: 400,
        body: { message: "Đơn hàng hiện tại chưa đủ điều kiện để dùng điểm tích lũy" },
      },
    };
  }

  if (normalizedRequestedPoints > maxByBalance) {
    return {
      error: {
        status: 400,
        body: { message: `Bạn chỉ còn ${maxByBalance} điểm tích lũy` },
      },
    };
  }

  if (normalizedRequestedPoints > maxByRatio) {
    return {
      error: {
        status: 400,
        body: {
          message: `Đơn này chỉ được dùng tối đa ${maxByRatio} điểm (${Math.round(maxRedeemRatio * 100)}% giá trị đơn)`,
        },
      },
    };
  }

  if (
    minRedeemPoints > 0 &&
    normalizedRequestedPoints > 0 &&
    normalizedRequestedPoints < minRedeemPoints
  ) {
    return {
      error: {
        status: 400,
        body: { message: `Mỗi lần dùng điểm tối thiểu ${minRedeemPoints} điểm` },
      },
    };
  }

  const pointsToRedeem = normalizedRequestedPoints;
  const pointsDiscount = pointsToRedeem * vndPerPoint;
  const finalTotal = Math.max(0, discountedSubtotal + shippingFee - pointsDiscount);

  return {
    pricing: {
      subtotal,
      promotionDiscount,
      couponDiscount,
      pointsDiscount,
      shippingFee,
      finalTotal,
    },
    loyalty: {
      availablePoints: maxByBalance,
      pointsToRedeem,
      maxRedeemPoints,
      minRedeemPoints,
      maxRedeemRatio,
      vndPerPoint,
    },
  };
}

function buildOrderItems(items) {
  return items.map(({ product, quantity, subtotal }) => ({
    productId: product.id,
    name: product.name,
    brand: product.brand,
    image: product.images?.[0] || "",
    price: product.price,
    quantity,
    subtotal,
  }));
}

async function buildReviewMap(userId, orders) {
  const orderIds = orders.map((item) => item.id);
  if (!orderIds.length) return new Map();

  const reviews = await Review.find(
    { userId, orderId: { $in: orderIds } },
    { orderId: 1, productId: 1 },
  ).lean();

  return new Map(reviews.map((item) => [`${item.orderId}:${item.productId}`, true]));
}

function orderReviewMap(order, globalReviewMap) {
  const map = new Map();
  for (const item of order.items || []) {
    map.set(item.productId, Boolean(globalReviewMap.get(`${order.id}:${item.productId}`)));
  }
  return map;
}

export async function previewCheckoutOrder(user, payload = {}) {
  if (payload.paymentMethod && payload.paymentMethod !== "COD") {
    return {
      status: 400,
      body: { message: "Phương thức thanh toán hiện tại bắt buộc là COD" },
    };
  }

  const cartItems = await Cart.findByUserId(user.id);
  if (!cartItems.length) {
    return { status: 400, body: { message: "Giỏ hàng đang trống" } };
  }

  const { items, error } = await validateCartItems(cartItems);
  if (error) return error;

  const redeemPlan = buildLoyaltyPricing(items, payload.pointsToRedeem, user.loyaltyPoints);
  if (redeemPlan.error) return redeemPlan.error;

  return {
    status: 200,
    body: {
      pricing: redeemPlan.pricing,
      loyalty: redeemPlan.loyalty,
      items: buildOrderItems(items),
    },
  };
}

export async function checkoutOrder(user, payload = {}) {
  const shippingInfo = normalizeShippingInfo(payload.shippingInfo, user);
  if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
    return {
      status: 400,
      body: { message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ" },
    };
  }

  if (payload.paymentMethod && payload.paymentMethod !== "COD") {
    return {
      status: 400,
      body: { message: "Phương thức thanh toán hiện tại bắt buộc là COD" },
    };
  }

  const cartItems = await Cart.findByUserId(user.id);
  if (!cartItems.length) {
    return { status: 400, body: { message: "Giỏ hàng đang trống" } };
  }

  const { items, error } = await validateCartItems(cartItems);
  if (error) return error;

  const redeemPlan = buildLoyaltyPricing(items, payload.pointsToRedeem, user.loyaltyPoints);
  if (redeemPlan.error) return redeemPlan.error;

  const orderItems = buildOrderItems(items);

  const order = await Order.create({
    id: makeOrderId(),
    userId: user.id,
    items: orderItems,
    shippingInfo,
    paymentMethod: "COD",
    total: redeemPlan.pricing.finalTotal,
    status: ORDER_STATUS.NEW,
    pricing: redeemPlan.pricing,
    loyalty: {
      pointsUsed: redeemPlan.loyalty.pointsToRedeem,
      vndPerPoint: redeemPlan.loyalty.vndPerPoint,
      maxRedeemRatio: redeemPlan.loyalty.maxRedeemRatio,
    },
  });

  await Promise.all(
    items.map(({ product, quantity }) =>
      Product.updateOne(
        { id: product.id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity, sold: quantity } },
      ),
    ),
  );

  if (redeemPlan.loyalty.pointsToRedeem > 0) {
    user.loyaltyPoints = Math.max(
      0,
      Number(user.loyaltyPoints || 0) - redeemPlan.loyalty.pointsToRedeem,
    );
    await user.save();
  }

  await Cart.clearByUserId(user.id);

  return {
    status: 201,
    body: {
      order: serializeOrder(order),
      loyalty: {
        currentPoints: Number(user.loyaltyPoints || 0),
        pointsUsed: redeemPlan.loyalty.pointsToRedeem,
      },
    },
  };
}

export async function listUserOrders(userId) {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  const updatedOrders = [];
  for (const order of orders) {
    updatedOrders.push(await applyAutoConfirmation(order));
  }

  const reviewMap = await buildReviewMap(userId, updatedOrders);

  return {
    status: 200,
    body: {
      orders: updatedOrders.map((order) =>
        serializeOrder(order, orderReviewMap(order, reviewMap)),
      ),
    },
  };
}

export async function getUserOrder(userId, orderId) {
  const order = await Order.findOne({ id: orderId, userId });
  if (!order) {
    return { status: 404, body: { message: "Không tìm thấy đơn hàng" } };
  }

  await applyAutoConfirmation(order);

  const reviewMap = await buildReviewMap(userId, [order]);
  return {
    status: 200,
    body: { order: serializeOrder(order, orderReviewMap(order, reviewMap)) },
  };
}

export async function cancelUserOrder(userId, orderId, reason = "") {
  const order = await Order.findOne({ id: orderId, userId });
  if (!order) {
    return { status: 404, body: { message: "Không tìm thấy đơn hàng" } };
  }

  await applyAutoConfirmation(order);

  if (order.status === ORDER_STATUS.NEW) {
    const createdAt = new Date(order.createdAt).getTime();
    if (Date.now() - createdAt > CONFIRM_AFTER_MS) {
      return {
        status: 400,
        body: { message: "Chỉ được hủy trực tiếp trong 30 phút sau khi đặt hàng" },
      };
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = String(reason || "").trim();
    await order.save();

    await Promise.all(
      order.items.map((item) =>
        Product.updateOne(
          { id: item.productId },
          { $inc: { stock: item.quantity, sold: -item.quantity } },
        ),
      ),
    );

    const pointsUsed = Number(order.loyalty?.pointsUsed || 0);
    let loyaltyInfo = null;

    if (pointsUsed > 0) {
      const owner = await User.findOne({ id: userId });
      if (owner) {
        owner.loyaltyPoints = Number(owner.loyaltyPoints || 0) + pointsUsed;
        await owner.save();
        loyaltyInfo = {
          refundedPoints: pointsUsed,
          currentPoints: Number(owner.loyaltyPoints || 0),
        };
      }
    }

    return {
      status: 200,
      body: {
        order: serializeOrder(order),
        ...(loyaltyInfo ? { loyalty: loyaltyInfo } : {}),
      },
    };
  }

  if (order.status === ORDER_STATUS.PREPARING) {
    order.status = ORDER_STATUS.CANCEL_REQUESTED;
    order.cancelRequestedAt = new Date();
    order.cancelReason = String(reason || "").trim();
    await order.save();
    return { status: 200, body: { order: serializeOrder(order) } };
  }

  return {
    status: 400,
    body: { message: "Đơn hàng hiện tại không thể hủy" },
  };
}
