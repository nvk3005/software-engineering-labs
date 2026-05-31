import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

export const checkoutOrder = createAsyncThunk(
  "orders/checkout",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/checkout", payload);
      return data.order;
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
      return data.order;
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
    error: "",
  },
  reducers: {
    clearSelectedOrder(state) {
      state.selected = null;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutOrder.pending, (state) => {
        state.checkoutStatus = "loading";
        state.error = "";
      })
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        state.selected = action.payload;
        state.error = "";
        state.items = [action.payload, ...state.items.filter((order) => order.id !== action.payload.id)];
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
        state.selected = action.payload;
        state.items = state.items.map((order) =>
          order.id === action.payload.id ? action.payload : order,
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;