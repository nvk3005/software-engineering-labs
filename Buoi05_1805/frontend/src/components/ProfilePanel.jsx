import { Save } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/authSlice";

export default function ProfilePanel() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });

  const submit = (event) => {
    event.preventDefault();
    dispatch(updateProfile(form));
  };

  return (
    <form className="profile-panel" onSubmit={submit}>
      <h2>Thành viên</h2>
      <label>
        Họ tên
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </label>
      <label>
        Điện thoại
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
      </label>
      <label>
        Địa chỉ
        <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
      </label>
      <button className="icon-button">
        <Save size={18} />
        Lưu hồ sơ
      </button>
    </form>
  );
}
