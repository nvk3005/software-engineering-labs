import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { store } from "./store";
import App from "./pages/App";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetail from "./pages/ProductDetail";
import "./styles.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
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
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/auth" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Protected><App /></Protected>} />
            <Route path="/checkout" element={<Protected><CheckoutPage /></Protected>} />
            <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
            <Route path="/orders/:orderId" element={<Protected><OrderDetailPage /></Protected>} />
            <Route path="/products/:id" element={<Protected><ProductDetail /></Protected>} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </AppErrorBoundary>
  </React.StrictMode>
);
