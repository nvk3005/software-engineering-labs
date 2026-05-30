import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import ProfilePanel from "../components/ProfilePanel";

export default function ProfilePage() {
  return (
    <>
      <Header />
      <main className="shell account-shell">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Quay lại cửa hàng</Link>
        <section className="account-hero">
          <p className="eyebrow">Tài khoản</p>
          <h1>Hồ sơ thành viên</h1>
          <p>Cập nhật thông tin nhận hàng để thanh toán nhanh và chính xác hơn.</p>
        </section>
        <div className="account-panel">
          <ProfilePanel />
        </div>
      </main>
    </>
  );
}
