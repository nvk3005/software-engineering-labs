import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import engagementReducer from "./engagementSlice";
import ordersReducer from "./ordersSlice";
import productsReducer from "./productsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    engagement: engagementReducer,
  }
});
