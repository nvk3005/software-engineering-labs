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
  initialState: { items: [] },
  reducers: {
    clearCart(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
