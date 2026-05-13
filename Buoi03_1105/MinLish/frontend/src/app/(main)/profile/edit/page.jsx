"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import useAuthStore from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { putProfileSchema } from "./user.schemas";

export default function EditProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    gender: "",
    bio: "",
    birthday: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Giải phóng bộ nhớ preview URL tránh memory leak
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (!mounted) return;
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(`/user/profile`);
        const profile = res.data.data;

        setFormData({
          fullname: profile.profile?.fullname || "",
          phone: profile.profile?.phone || "",
          gender: profile.profile?.gender || "",
          bio: profile.profile?.bio || "",
          birthday: profile.profile?.birthday || "",
        });

        if (profile.imagePresignedUrl) {
          setPreview(profile.imagePresignedUrl);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [mounted, user?.id]); // user?.id tránh fetch khi user undefined khi load lại trang

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi của field đó khi người dùng bắt đầu sửa
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Kích thước ảnh quá lớn (tối đa 2MB)");
        return;
      }
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");

    //Validate bằng Zod ở Frontend
    const validation = putProfileSchema.safeParse({
      ...formData,
      userId: String(user?.id), // Ép kiểu vì schema yêu cầu string
    });

    if (!validation.success) {
      // Chuyển đổi lỗi Zod thành object { fieldName: message }
      const errors = {};
      validation.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return; // Dừng lại không call API
    }

    try {
      const form = new FormData();

      form.append("userId", user.id);
      form.append("fullname", formData.fullname);
      form.append("phone", formData.phone);
      form.append("gender", formData.gender);
      form.append("bio", formData.bio);
      form.append("birthday", formData.birthday);

      if (avatar) {
        form.append("avatar", avatar);
      }

      await axiosInstance.post("/user/profile", form, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        },
      });

      setSuccess("Cập nhật hồ sơ thành công");

      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow border-0 rounded-4 p-4">
        <h1 className="fw-bold text-primary mb-4 text-center">Cập Nhật Hồ Sơ</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Họ tên</label>

              <input
                type="text"
                className={`form-control ${fieldErrors.fullname ? "is-invalid" : ""}`}
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
              />
              {fieldErrors.fullname && (
                <div className="invalid-feedback">{fieldErrors.fullname}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Giới tính</label>

              <select
                className="form-select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Số điện thoại</label>

              <input
                type="text"
                className={`form-control ${fieldErrors.phone ? "is-invalid" : ""}`}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {fieldErrors.phone && (
                <div className="invalid-feedback">{fieldErrors.phone}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Tiểu sử</label>

              <textarea
                className="form-control"
                rows="4"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3 d-flex flex-column align-items-center justify-content-center">
              <label className="form-label fw-bold">Avatar</label>
              <div
                className="position-relative"
                style={{ width: "150px", height: "150px" }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover", // Quan trọng nhất: Cắt ảnh vừa khung mà không làm méo
                      display: "block", // Loại bỏ khoảng trống inline mặc định
                    }}
                    className="rounded-circle object-fit-cover border shadow-sm"
                  />
                ) : (
                  <div
                    className="bg-light rounded-circle d-inline-block border"
                    style={{ width: "150px", height: "150px" }}
                  />
                )}

                {/* Nút bấm giả để kích hoạt chọn file */}
                <label
                  htmlFor="avatar-input"
                  className="btn btn-primary rounded-circle position-absolute d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    bottom: "5px",
                    right: "5px",
                    width: "35px",
                    height: "35px",
                    cursor: "pointer",
                    padding: "0",
                    border: "2px solid white",
                  }}
                  title="Thay đổi ảnh"
                >
                  <span style={{ fontSize: "14px" }}>
                    <i className="bi bi-pencil-fill"></i>
                  </span>
                </label>

                {/* Input thật nhưng được ẩn đi */}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Lưu thay đổi
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push("/profile")}
            >
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
