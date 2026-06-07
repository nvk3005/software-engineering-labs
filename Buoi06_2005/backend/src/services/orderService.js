import { Cart, Order, ORDER_STATUS, Product } from "../models/index.js";

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

function normalizeShippingInfo(payload = {}, user = {}) {
  return {
    name: String(payload.name || user.name || "").trim(),
    phone: String(payload.phone || user.phone || "").trim(),
    address: String(payload.address || user.address || "").trim(),
    note: String(payload.note || "").trim(),
  };
}

function normalizeSelectedProductIds(rawIds = []) {
  return [...new Set((rawIds || []).map((id) => String(id || "").trim()).filter(Boolean))];
}

function serializeOrder(order) {
  const data = order.toObject ? order.toObject() : order;
  return {
    ...data,
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

  const selectedProductIds = normalizeSelectedProductIds(payload.selectedProductIds);
  const effectiveCartItems = selectedProductIds.length
    ? cartItems.filter((item) => selectedProductIds.includes(item.product.id))
    : cartItems;

  if (!effectiveCartItems.length) {
    return {
      status: 400,
      body: { message: "Vui lòng chọn ít nhất một sản phẩm để thanh toán" },
    };
  }

  const { items, error } = await validateCartItems(effectiveCartItems);
  if (error) return error;

  const orderItems = items.map(({ product, quantity, subtotal }) => ({
    productId: product.id,
    name: product.name,
    brand: product.brand,
    image: product.images?.[0] || "",
    price: product.price,
    quantity,
    subtotal,
  }));
  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const order = await Order.create({
    id: makeOrderId(),
    userId: user.id,
    items: orderItems,
    shippingInfo,
    paymentMethod: "COD",
    total,
    status: ORDER_STATUS.NEW,
  });

  await Promise.all(
    items.map(({ product, quantity }) =>
      Product.updateOne(
        { id: product.id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity, sold: quantity } },
      ),
    ),
  );

  if (selectedProductIds.length) {
    await Cart.clearSelectedItems(user.id, selectedProductIds);
  } else {
    await Cart.clearByUserId(user.id);
  }

  return { status: 201, body: { order: serializeOrder(order) } };
}

export async function listUserOrders(userId) {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  const updatedOrders = [];
  for (const order of orders) {
    updatedOrders.push(await applyAutoConfirmation(order));
  }
  return {
    status: 200,
    body: { orders: updatedOrders.map((order) => serializeOrder(order)) },
  };
}

export async function getUserOrder(userId, orderId) {
  const order = await Order.findOne({ id: orderId, userId });
  if (!order) return { status: 404, body: { message: "Không tìm thấy đơn hàng" } };

  await applyAutoConfirmation(order);
  return { status: 200, body: { order: serializeOrder(order) } };
}

export async function cancelUserOrder(userId, orderId, reason = "") {
  const order = await Order.findOne({ id: orderId, userId });
  if (!order) return { status: 404, body: { message: "Không tìm thấy đơn hàng" } };

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

    return { status: 200, body: { order: serializeOrder(order) } };
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
