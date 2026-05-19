import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchProducts = createAsyncThunk("products/fetch", async (params) => {
  const { data } = await api.get("/products", { params });
  return data;
});

export const fetchProductDetail = createAsyncThunk("products/detail", async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
});

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    selected: null,
    related: [],
    facets: { categories: [], brands: [] },
    meta: { total: 0, page: 1, pages: 1 },
    status: "idle"
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.facets = action.payload.facets;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.selected = action.payload.product;
        state.related = action.payload.related;
      });
  }
});

export default productsSlice.reducer;
