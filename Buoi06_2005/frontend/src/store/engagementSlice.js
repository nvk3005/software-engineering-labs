import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchFavorites = createAsyncThunk(
  "engagement/fetchFavorites",
  async () => {
    const { data } = await api.get("/users/me/favorites");
    return data;
  },
);

export const addFavorite = createAsyncThunk(
  "engagement/addFavorite",
  async (productId) => {
    const { data } = await api.post(`/users/me/favorites/${productId}`);
    return data;
  },
);

export const removeFavorite = createAsyncThunk(
  "engagement/removeFavorite",
  async (productId) => {
    const { data } = await api.delete(`/users/me/favorites/${productId}`);
    return { ...data, productId };
  },
);

export const fetchViewedProducts = createAsyncThunk(
  "engagement/fetchViewed",
  async (limit = 12) => {
    const { data } = await api.get("/users/me/viewed", { params: { limit } });
    return data;
  },
);

const engagementSlice = createSlice({
  name: "engagement",
  initialState: {
    favoriteIds: [],
    favoriteItems: [],
    viewedItems: [],
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.favoriteIds = action.payload.ids || [];
        state.favoriteItems = action.payload.items || [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Không tải được danh sách yêu thích";
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favoriteIds = action.payload.ids || state.favoriteIds;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favoriteIds = action.payload.ids || state.favoriteIds.filter((id) => id !== action.payload.productId);
        state.favoriteItems = state.favoriteItems.filter((item) => item.id !== action.payload.productId);
      })
      .addCase(fetchViewedProducts.fulfilled, (state, action) => {
        state.viewedItems = action.payload.items || [];
      });
  },
});

export default engagementSlice.reducer;
