import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { store } from "./store";
import App from "./pages/App";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetail from "./pages/ProductDetail";
import ProfilePage from "./pages/ProfilePage";
import CartToast from "./components/CartToast";
import "./styles.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="error-page">
          <h1>Không tải được giao diện</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => {
            localStorage.clear();
            window.location.href = "/auth";
          }}>
            Làm mới dữ liệu đăng nhập
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

function Protected({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  if (!token) {
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const resetKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <AppErrorBoundary resetKey={resetKey}>
      <CartToast />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Protected><App /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/cart" element={<Protected><CartPage /></Protected>} />
        <Route path="/checkout" element={<Protected><CheckoutPage /></Protected>} />
        <Route path="/favorites" element={<Protected><FavoritesPage /></Protected>} />
        <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
        <Route path="/orders/:orderId" element={<Protected><OrderDetailPage /></Protected>} />
        <Route path="/products/:id" element={<Protected><ProductDetail /></Protected>} />
      </Routes>
    </AppErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
