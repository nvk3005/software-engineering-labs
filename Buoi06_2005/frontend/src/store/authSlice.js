import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

function readSavedUser() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      return null;
    }

    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
}

const initialState = {
  user: readSavedUser(),
  status: "idle",
  error: ""
};

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/v1/login", payload);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return saveUser(data.user);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Đăng nhập thất bại");
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/v1/register", payload);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Đăng ký thất bại");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.put("/users/me", payload);
    return saveUser(data.user);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Cập nhật thất bại");
  }
});

export const uploadAvatar = createAsyncThunk("auth/uploadAvatar", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.put("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return saveUser(data.user);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Upload ảnh thất bại");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      state.user = null;
      state.error = "";
      state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
