'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axios';
import useAuthStore from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      setError('Bạn không có quyền truy cập trang quản trị này!');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const res = await axiosInstance.get('/admin/profile');
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy thông tin admin');
      }
    };
    fetchAdminData();
  }, [user, router, mounted]);

  if (!mounted) return <div className="text-center mt-5"><div className="spinner-border text-danger" /></div>;

  if (error) return <div className="container mt-5"><div className="alert alert-danger shadow">{error}</div></div>;
  if (!data) return <div className="text-center mt-5"><div className="spinner-border text-danger" /></div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0 rounded-4 p-4 bg-dark text-white">
        <h2 className="text-danger fw-bold mb-4">Hồ Sơ Quản Trị Viên</h2>
        <div className="row">
          <div className="col-md-4 text-center">
            <img 
              src={data.profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + data.username + '&background=random'} 
              alt="Admin Avatar" 
              className="rounded-circle shadow border border-danger border-3" 
              width="150" 
              height="150" 
            />
            <h4 className="mt-3 fw-bold">{data.profile?.fullname || data.username}</h4>
            <span className="badge bg-danger fs-6">{data.role}</span>
          </div>
          <div className="col-md-8 mt-4 mt-md-0">
            <ul className="list-group list-group-flush rounded bg-secondary">
              <li className="list-group-item bg-secondary text-white border-dark"><strong>Username:</strong> {data.username}</li>
              <li className="list-group-item bg-secondary text-white border-dark"><strong>Email:</strong> {data.email}</li>
              <li className="list-group-item bg-secondary text-white border-dark"><strong>Phone:</strong> {data.profile?.phone || 'Chưa cập nhật'}</li>
              <li className="list-group-item bg-secondary text-white border-dark"><strong>Giới tính:</strong> {data.profile?.gender || 'Chưa cập nhật'}</li>
              <li className="list-group-item bg-secondary text-white border-dark"><strong>Bio:</strong> {data.profile?.bio || 'Chưa cập nhật'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
