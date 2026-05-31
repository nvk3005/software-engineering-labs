import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, Search, ShieldCheck, ShoppingBag, UserRound, Watch } from "lucide-react";
import api from "../services/api";
import { login, register } from "../store/authSlice";

const empty = { name: "", email: "demo@luxewatch.test", password: "Password123!", phone: "", address: "" };

const vi = {
  heroText: "\u0110\u0103ng nh\u1eadp \u0111\u1ec3 xem s\u1ea3n ph\u1ea9m m\u1edbi, h\u00e0ng b\u00e1n ch\u1ea1y, m\u00e3 \u01b0u \u0111\u00e3i v\u00e0 qu\u1ea3n l\u00fd gi\u1ecf h\u00e0ng c\u1ee7a b\u1ea1n.",
  login: "\u0110\u0103ng nh\u1eadp",
  register: "\u0110\u0103ng k\u00fd",
  registerTitle: "T\u1ea1o t\u00e0i kho\u1ea3n m\u1edbi",
  registerVerifyTitle: "X\u00e1c minh OTP \u0111\u0103ng k\u00fd",
  forgotTitle: "Qu\u00ean m\u1eadt kh\u1ea9u",
  resetTitle: "\u0110\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u",
  fullName: "H\u1ecd t\u00ean",
  password: "M\u1eadt kh\u1ea9u",
  phone: "\u0110i\u1ec7n tho\u1ea1i",
  address: "\u0110\u1ecba ch\u1ec9",
  otp: "M\u00e3 OTP",
  sendOtpReset: "G\u1eedi OTP \u0111\u1eb7t l\u1ea1i",
  resetPassword: "\u0110\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u",
  createAccount: "T\u1ea1o t\u00e0i kho\u1ea3n",
  verify: "X\u00e1c minh OTP",
  hasOtp: "T\u00f4i \u0111\u00e3 c\u00f3 m\u00e3 OTP",
  toRegister: "Ch\u01b0a c\u00f3 t\u00e0i kho\u1ea3n? \u0110\u0103ng k\u00fd",
  toForgot: "Qu\u00ean m\u1eadt kh\u1ea9u?",
  toLogin: "Quay l\u1ea1i \u0111\u0103ng nh\u1eadp",
  back: "\u2190 Quay l\u1ea1i",
  showPassword: "Hi\u1ec7n m\u1eadt kh\u1ea9u",
  hidePassword: "\u1ea8n m\u1eadt kh\u1ea9u",
  otpSent: "\u0110\u00e3 g\u1eedi OTP. Vui l\u00f2ng ki\u1ec3m tra email, sau \u0111\u00f3 b\u1ea5m 'T\u00f4i \u0111\u00e3 c\u00f3 m\u00e3 OTP'.",
  verifySuccess: "X\u00e1c minh th\u00e0nh c\u00f4ng. B\u1ea1n c\u00f3 th\u1ec3 \u0111\u0103ng nh\u1eadp ngay.",
  forgotSuccess: "\u0110\u00e3 g\u1eedi OTP \u0111\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u.",
  resetSuccess: "\u0110\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u th\u00e0nh c\u00f4ng.",
  fillRequired: "Vui l\u00f2ng nh\u1eadp \u0111\u1ea7y \u0111\u1ee7 th\u00f4ng tin b\u1eaft bu\u1ed9c.",
  invalidOtp: "Vui l\u00f2ng nh\u1eadp m\u00e3 OTP.",
  checking: "\u0110ang x\u1eed l\u00fd...",
  sendingOtp: "\u0110ang g\u1eedi OTP...",
  verifying: "\u0110ang x\u00e1c minh...",
  resetting: "\u0110ang \u0111\u1eb7t l\u1ea1i...",
  creating: "\u0110ang t\u1ea1o t\u00e0i kho\u1ea3n...",
  loginFailed: "\u0110\u0103ng nh\u1eadp th\u1ea5t b\u1ea1i.",
  registerFailed: "\u0110\u0103ng k\u00fd th\u1ea5t b\u1ea1i. Vui l\u00f2ng th\u1eed l\u1ea1i.",
  genericError: "C\u00f3 l\u1ed7i x\u1ea3y ra. Vui l\u00f2ng th\u1eed l\u1ea1i.",
  demo: "T\u00e0i kho\u1ea3n demo: demo@luxewatch.test / Password123!",
  appleLead: "Kh\u00e1m ph\u00e1 nh\u1eefng thi\u1ebft k\u1ebf \u0111\u1ed3ng h\u1ed3 t\u1ed1i gi\u1ea3n, sang tr\u1ecdng v\u00e0 ch\u00ednh x\u00e1c trong t\u1eebng chi ti\u1ebft.",
  financeNote: "Thanh to\u00e1n linh ho\u1ea1t, giao h\u00e0ng nhanh v\u00e0 b\u1ea3o h\u00e0nh ch\u00ednh h\u00e3ng cho th\u00e0nh vi\u00ean LuxeWatch."
};

const AuthField = ({ icon: Icon, children }) => (
  <div className="auth-field">
    <Icon size={18} strokeWidth={2} />
    {children}
  </div>
);

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, status } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(empty);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [otp, setOtp] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const requestedRedirect = searchParams.get("redirect") || "/";
  const redirectTo = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/";

  if (user && localStorage.getItem("accessToken")) return <Navigate to={redirectTo} replace />;

  const setField = (key, value) => {
    setNotice({ type: "", text: "" });
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  useEffect(() => {
    setNotice({ type: "", text: "" });
    setOtp("");
    setShowPassword(false);
  }, [mode]);

  const actionLabel = {
    login: vi.checking,
    register: vi.creating,
    forgot: vi.sendingOtp,
    reset: vi.resetting,
    verify: vi.verifying
  };

  const isBusy = Boolean(pendingAction) || status === "loading";
  const primaryBusy = pendingAction === mode;
  const verifyBusy = pendingAction === "verify";
  const isPasswordMode = ["login", "register", "reset"].includes(mode);

  const require = (fields) => {
    const ok = fields.every((field) => field?.trim());
    if (!ok) setNotice({ type: "error", text: vi.fillRequired });
    return ok;
  };

  const submit = async (event) => {
    event.preventDefault();
    setNotice({ type: "", text: "" });

    if (mode === "login" && !require([form.email, form.password])) return;
    if (mode === "register" && !require([form.name, form.email, form.password])) return;
    if (mode === "forgot" && !require([form.email])) return;
    if (mode === "reset" && !require([form.email, form.password, otp])) return;

    setPendingAction(mode);
    try {
      if (mode === "login") {
        const result = await dispatch(login({ email: form.email, password: form.password }));
        if (result.meta.requestStatus === "fulfilled") {
          navigate(redirectTo, { replace: true });
          return;
        }
        setNotice({ type: "error", text: result.payload || vi.loginFailed });
      }

      if (mode === "register") {
        const result = await dispatch(register(form));
        if (result.meta.requestStatus === "fulfilled") {
          setNotice({ type: "success", text: vi.otpSent });
          setMode("register_verify");
          return;
        }
        setNotice({ type: "error", text: result.payload || vi.registerFailed });
      }

      if (mode === "forgot") {
        const { data } = await api.post("/auth/v1/forgot-password", { email: form.email });
        setNotice({ type: "success", text: data.message || vi.forgotSuccess });
      }

      if (mode === "reset") {
        const { data } = await api.post("/auth/v1/reset-password", { email: form.email, otp, password: form.password });
        setNotice({ type: "success", text: data.message || vi.resetSuccess });
      }
    } catch (apiError) {
      setNotice({ type: "error", text: apiError?.response?.data?.message || vi.genericError });
    } finally {
      setPendingAction("");
    }
  };

  const verify = async () => {
    if (!otp.trim()) {
      setNotice({ type: "error", text: vi.invalidOtp });
      return;
    }

    setNotice({ type: "", text: "" });
    setPendingAction("verify");
    try {
      const { data } = await api.post("/auth/v1/verify-otp", { email: form.email, otp });
      setNotice({ type: "success", text: data.message || vi.verifySuccess });
      setMode("login");
    } catch (apiError) {
      setNotice({ type: "error", text: apiError?.response?.data?.message || vi.invalidOtp });
    } finally {
      setPendingAction("");
    }
  };

  const titleByMode = {
    login: vi.login,
    register: vi.registerTitle,
    register_verify: vi.registerVerifyTitle,
    forgot: vi.forgotTitle,
    reset: vi.resetTitle
  };

  return (
    <main className="auth-page">
      <header className="auth-nav">
        <a className="auth-logo" href="/">
          <Watch size={18} strokeWidth={2.2} />
          <b>LuxeWatch</b>
        </a>
        <nav>
          <a href="/">Cửa Hàng</a>
          <a href="/">Đồng Hồ</a>
          <a href="/">Bộ Sưu Tập</a>
          <a href="/">Ưu Đãi</a>
          <a href="/orders">Đơn Hàng</a>
          <a href="/">Hỗ Trợ</a>
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} disabled={isBusy}>Đăng nhập</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} disabled={isBusy}>Đăng ký</button>
          <button type="button" className={mode === "forgot" || mode === "reset" ? "active" : ""} onClick={() => setMode("forgot")} disabled={isBusy}>Quên mật khẩu</button>
        </nav>
        <div className="auth-nav-icons">
          <Search size={18} />
          <ShoppingBag size={18} />
        </div>
      </header>

      <div className="auth-ribbon">
        {vi.financeNote}
      </div>

      <section className="auth-hero-copy">
        <h1>LuxeWatch</h1>
        <p>{vi.appleLead}</p>
        <div>
          <button type="button" onClick={() => setMode("login")}>Đăng nhập</button>
          <button type="button" onClick={() => setMode("register")}>Tạo tài khoản</button>
        </div>
      </section>

      <section className="auth-stage">
        <section className="auth-welcome">
          <img
            src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1100&q=85"
            alt="Đồng hồ LuxeWatch tối giản"
          />
        </section>

        <section className="auth-card">
          <div className="avatar-ring">
            <UserRound size={58} strokeWidth={1.25} />
          </div>
          <h2 className="auth-title">{titleByMode[mode]}</h2>

          <form onSubmit={submit}>
            {mode === "register" && (
              <AuthField icon={UserRound}>
                <input placeholder={vi.fullName} value={form.name} onChange={(event) => setField("name", event.target.value)} />
              </AuthField>
            )}

            {(mode === "login" || mode === "register" || mode === "forgot" || mode === "reset" || mode === "register_verify") && (
              <AuthField icon={Mail}>
                <input placeholder="Email" value={form.email} onChange={(event) => setField("email", event.target.value)} />
              </AuthField>
            )}

            {isPasswordMode && (
              <AuthField icon={LockKeyhole}>
                <div className="input-with-action">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={vi.password}
                    value={form.password}
                    onChange={(event) => setField("password", event.target.value)}
                  />
                  <button
                    type="button"
                    className="inline-action"
                    aria-label={showPassword ? vi.hidePassword : vi.showPassword}
                    title={showPassword ? vi.hidePassword : vi.showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isBusy}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </AuthField>
            )}

            {mode === "register" && (
              <AuthField icon={Phone}>
                <input placeholder={vi.phone} value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
              </AuthField>
            )}
            {mode === "register" && (
              <AuthField icon={MapPin}>
                <input placeholder={vi.address} value={form.address} onChange={(event) => setField("address", event.target.value)} />
              </AuthField>
            )}

            {mode === "reset" && (
              <AuthField icon={ShieldCheck}>
                <input placeholder={vi.otp} value={otp} onChange={(event) => { setNotice({ type: "", text: "" }); setOtp(event.target.value); }} />
              </AuthField>
            )}

            {["login", "register", "forgot", "reset"].includes(mode) && (
              <button className={`primary ${primaryBusy ? "loading" : ""}`} disabled={isBusy}>
                {primaryBusy
                  ? actionLabel[mode]
                  : mode === "forgot"
                    ? vi.sendOtpReset
                    : mode === "reset"
                      ? vi.resetPassword
                      : mode === "register"
                        ? vi.createAccount
                        : vi.login}
              </button>
            )}
          </form>

          {mode === "register_verify" && (
            <div className="otp-row">
              <AuthField icon={ShieldCheck}>
                <input placeholder={vi.otp} value={otp} onChange={(event) => { setNotice({ type: "", text: "" }); setOtp(event.target.value); }} />
              </AuthField>
              <button type="button" className={verifyBusy ? "loading" : ""} onClick={verify} disabled={isBusy}>
                {verifyBusy ? vi.verifying : vi.verify}
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <button type="button" className="ghost" onClick={() => setMode("reset")} disabled={isBusy}>
              {vi.hasOtp}
            </button>
          )}

          {notice.text && <p className={`notice ${notice.type === "error" ? "error" : notice.type === "success" ? "success" : ""}`}>{notice.text}</p>}

          <div className="auth-links">
            {mode === "login" && (
              <>
                <button type="button" className="text-link" onClick={() => setMode("register")} disabled={isBusy}>{vi.toRegister}</button>
                <button type="button" className="text-link" onClick={() => setMode("forgot")} disabled={isBusy}>{vi.toForgot}</button>
              </>
            )}

            {mode === "register" && (
              <button type="button" className="text-link" onClick={() => setMode("login")} disabled={isBusy}>{vi.toLogin}</button>
            )}

            {mode === "register_verify" && (
              <>
                <button type="button" className="text-link" onClick={() => setMode("register")} disabled={isBusy}>{vi.back}</button>
                <button type="button" className="text-link" onClick={() => setMode("login")} disabled={isBusy}>{vi.toLogin}</button>
              </>
            )}

            {mode === "forgot" && (
              <button type="button" className="text-link" onClick={() => setMode("login")} disabled={isBusy}>{vi.toLogin}</button>
            )}

            {mode === "reset" && (
              <>
                <button type="button" className="text-link" onClick={() => setMode("forgot")} disabled={isBusy}>{vi.back}</button>
                <button type="button" className="text-link" onClick={() => setMode("login")} disabled={isBusy}>{vi.toLogin}</button>
              </>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
