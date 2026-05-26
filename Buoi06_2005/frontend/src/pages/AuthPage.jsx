import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { login, register } from "../store/authSlice";

const empty = { name: "", email: "demo@luxewatch.test", password: "Password123!", phone: "", address: "" };

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");

  if (user) return <Navigate to="/" replace />;

  const set = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (mode === "login") {
      const result = await dispatch(login({ email: form.email, password: form.password }));
      if (result.meta.requestStatus === "fulfilled") navigate("/");
    }
    if (mode === "register") {
      const result = await dispatch(register(form));
      setMessage(result.meta.requestStatus === "fulfilled" ? "Đã gửi OTP kích hoạt. Vui lòng kiểm tra email hoặc console backend." : result.payload);
    }
    if (mode === "forgot") {
      const { data } = await api.post("/auth/v1/forgot-password", { email: form.email });
      setMessage(data.message);
    }
    if (mode === "reset") {
      const { data } = await api.post("/auth/v1/reset-password", { email: form.email, otp, password: form.password });
      setMessage(data.message);
    }
  };

  const verify = async () => {
    const { data } = await api.post("/auth/v1/verify-otp", { email: form.email, otp });
    setMessage(data.message);
    setMode("login");
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Luxury watch e-commerce</p>
        <h1>LuxeWatch</h1>
        <p>Đăng nhập để xem sản phẩm mới, hàng bán chạy, mã ưu đãi và quản lý giỏ hàng của bạn.</p>
        <div className="promo-code">PROMO: LUXE2026</div>
      </section>
      <section className="auth-card">
        <div className="tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Đăng nhập</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Đăng ký</button>
          <button className={mode === "forgot" || mode === "reset" ? "active" : ""} onClick={() => setMode("forgot")}>Quên mật khẩu</button>
        </div>
        <form onSubmit={submit}>
          {mode === "register" && <input placeholder="Họ tên" value={form.name} onChange={(event) => set("name", event.target.value)} />}
          <input placeholder="Email" value={form.email} onChange={(event) => set("email", event.target.value)} />
          {mode !== "forgot" && <input type="password" placeholder="Mật khẩu" value={form.password} onChange={(event) => set("password", event.target.value)} />}
          {mode === "register" && <input placeholder="Điện thoại" value={form.phone} onChange={(event) => set("phone", event.target.value)} />}
          {mode === "register" && <input placeholder="Địa chỉ" value={form.address} onChange={(event) => set("address", event.target.value)} />}
          {mode === "reset" && <input placeholder="OTP" value={otp} onChange={(event) => setOtp(event.target.value)} />}
          <button className="primary" disabled={status === "loading"}>{mode === "forgot" ? "Gửi OTP đặt lại" : mode === "reset" ? "Đặt lại mật khẩu" : mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}</button>
        </form>
        {mode === "register" && (
          <div className="otp-row">
            <input placeholder="OTP kích hoạt" value={otp} onChange={(event) => setOtp(event.target.value)} />
            <button onClick={verify}>Xác minh</button>
          </div>
        )}
        {mode === "forgot" && <button className="ghost" onClick={() => setMode("reset")}>Tôi đã có OTP</button>}
        {(message || error) && <p className="notice">{message || error}</p>}
        <p className="muted">Tài khoản demo: demo@luxewatch.test / Password123!</p>
      </section>
    </main>
  );
}
