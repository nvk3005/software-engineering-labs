import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

export const previewCheckout = createAsyncThunk(
  "orders/previewCheckout",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/preview", payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể tính trước thanh toán");
    }
  },
);

export const checkoutOrder = createAsyncThunk(
  "orders/checkout",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/checkout", payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đặt hàng thất bại");
    }
  },
);

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders");
      return data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không tải được đơn hàng");
    }
  },
);

export const fetchOrderDetail = createAsyncThunk(
  "orders/fetchOne",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không tải được chi tiết đơn hàng");
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "orders/cancel",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/cancel`, { reason });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    selected: null,
    status: "idle",
    checkoutStatus: "idle",
    previewStatus: "idle",
    preview: null,
    previewError: "",
    error: "",
  },
  reducers: {
    clearSelectedOrder(state) {
      state.selected = null;
      state.error = "";
    },
    clearCheckoutPreview(state) {
      state.preview = null;
      state.previewError = "";
      state.previewStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(previewCheckout.pending, (state) => {
        state.previewStatus = "loading";
        state.previewError = "";
      })
      .addCase(previewCheckout.fulfilled, (state, action) => {
        state.previewStatus = "succeeded";
        state.previewError = "";
        state.preview = action.payload;
      })
      .addCase(previewCheckout.rejected, (state, action) => {
        state.previewStatus = "failed";
        state.preview = null;
        state.previewError = action.payload;
      })
      .addCase(checkoutOrder.pending, (state) => {
        state.checkoutStatus = "loading";
        state.error = "";
      })
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        const order = action.payload.order;
        state.checkoutStatus = "succeeded";
        state.selected = order;
        state.error = "";
        state.preview = null;
        state.previewError = "";
        state.items = [order, ...state.items.filter((item) => item.id !== order.id)];
      })
      .addCase(checkoutOrder.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.status = "loading";
        state.selected = null;
        state.error = "";
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.selected = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.status = "failed";
        state.selected = null;
        state.error = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const order = action.payload.order;
        state.selected = order;
        state.items = state.items.map((item) =>
          item.id === order.id ? order : item,
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedOrder, clearCheckoutPreview } = ordersSlice.actions;
export default ordersSlice.reducer;
