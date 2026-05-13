"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import useAuthStore from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import "./profile.css"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/user/profile`);
        setProfile(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lấy thông tin user");
      }
    };
    fetchProfile();
  }, [user, router, mounted]);

  if (!mounted)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow">{error}</div>
      </div>
    );
  if (!profile)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN"); // Định dạng theo kiểu Việt Nam
  };

  return (
    <div className="profile-wrap">
      <div className="profile-card">
        <div className="profile-banner">
          <div className="avatar-wrap">
            <img
              className="avatar-img"
              src={
                profile?.imagePresignedUrl ||
                `https://ui-avatars.com/api/?name=${profile.username}`
              }
              alt="Avatar"
            />
          </div>
        </div>

        <div className="profile-header d-flex justify-content-between align-items-center">
          <div className="header-info d-flex flex-column">
            <span className="name mr-2 fw-bold fs-4">
              {profile.profile?.fullname || profile.username}
            </span>
            <span className="username d-flex align-items-center text-muted">
              @{profile.username}
              <span className="badge-role ml-2">
                <i className="ti ti-shield-check" />
                {profile.role}
              </span>
            </span>
          </div>
          <button
            className="edit-btn"
            onClick={() => router.push("/profile/edit")}
          >
            <i className="ti ti-edit" /> Cập nhật hồ sơ
          </button>
        </div>

        {/* Thông tin chi tiết */}
        <div className="profile-body">
          <div className="info-grid three-col">
            <div className="info-card">
              <i className="ti ti-mail" />
              <div>
                <div className="label">Email</div>
                <div className="value">{profile.email}</div>
              </div>
            </div>
            <div className="info-card">
              <i className="ti ti-phone" />
              <div>
                <div className="label">Điện thoại</div>
                <div className="value">
                  {profile.profile?.phone || "Chưa cập nhật"}
                </div>
              </div>
            </div>
            <div className="info-card">
              <i className="ti ti-gender-bigender" />
              <div>
                <div className="label">Giới tính</div>
                <div className="value">
                  {profile.profile?.gender === "MALE"
                    ? "Nam"
                    : profile.profile?.gender === "FEMALE"
                      ? "Nữ"
                      : "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </div>

          <div className="info-grid two-col">
            <div className="info-card">
              <i className="ti ti-calendar" />
              <div>
                <div className="label">Ngày sinh</div>
                <div className="value">
                  {formatDate(profile.profile?.birthday)}
                </div>
              </div>
            </div>
            <div className="info-card">
              <i className="ti ti-notes" />
              <div>
                <div className="label">Bio</div>
                <div className="value">
                  {profile.profile?.bio || "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
