import { Camera, Save, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, uploadAvatar } from "../store/authSlice";

export default function ProfilePanel() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const initials = useMemo(() => {
    const name = user?.name || form.name || "LW";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [form.name, user?.name]);

  const submit = (event) => {
    event.preventDefault();
    dispatch(updateProfile(form));
  };

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const submitAvatar = () => {
    if (avatarFile) dispatch(uploadAvatar(avatarFile));
  };

  const avatarSrc = avatarPreview || user?.avatarUrl || "";

  return (
    <form className="profile-panel" onSubmit={submit}>
      <h2>Thành viên</h2>
      <div className="avatar-uploader">
        <div className="profile-avatar">
          {avatarSrc ? <img src={avatarSrc} alt={user?.name || "Avatar"} /> : <span>{initials}</span>}
        </div>
        <div>
          <strong>Ảnh đại diện</strong>
          <p className="muted">JPG, PNG hoặc WEBP. Tối đa 2MB.</p>
          <label className="avatar-picker">
            <Camera size={16} />
            Chọn ảnh
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseAvatar} />
          </label>
          {avatarFile && (
            <button type="button" className="ghost avatar-upload-button" onClick={submitAvatar} disabled={status === "loading"}>
              <Upload size={16} />
              {status === "loading" ? "Đang upload..." : "Upload Cloudinary"}
            </button>
          )}
        </div>
      </div>
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
      {error && <p className="notice error">{error}</p>}
      <button className="icon-button" disabled={status === "loading"}>
        <Save size={18} />
        {status === "loading" ? "Đang lưu..." : "Lưu hồ sơ"}
      </button>
    </form>
  );
}
