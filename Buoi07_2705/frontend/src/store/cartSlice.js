import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  const { data } = await api.get("/cart");
  return data.items;
});

export const addToCart = createAsyncThunk("cart/add", async ({ productId, quantity }) => {
  const { data } = await api.post("/cart", { productId, quantity });
  return data.items;
});

export const updateCartItem = createAsyncThunk("cart/update", async ({ productId, quantity }) => {
  const { data } = await api.patch(`/cart/${productId}`, { quantity });
  return data.items;
});

export const removeCartItem = createAsyncThunk("cart/remove", async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data.items;
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    toast: null,
  },
  reducers: {
    clearCart(state) {
      state.items = [];
    },
    clearCartToast(state) {
      state.toast = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.status = "adding";
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
        state.toast = {
          id: Date.now(),
          type: "success",
          title: "Đã thêm vào giỏ hàng",
          message: "Bạn có thể tiếp tục mua sắm hoặc kiểm tra giỏ hàng.",
        };
      })
      .addCase(addToCart.rejected, (state) => {
        state.status = "idle";
        state.toast = {
          id: Date.now(),
          type: "error",
          title: "Chưa thêm được sản phẩm",
          message: "Vui lòng thử lại sau.",
        };
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  }
});

export const { clearCart, clearCartToast } = cartSlice.actions;
export default cartSlice.reducer;