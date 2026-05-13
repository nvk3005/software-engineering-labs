'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '@/services/axios';
import useAuthStore from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import './login.css';

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Vui lòng nhập mật khẩu')
});

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosInstance.post('/auth/login', data, { withCredentials: true });
      const { accessToken, user } = res.data.data;
      setAuth(accessToken, user);

      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <div className="login-card p-5 rounded-4 shadow-lg">
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">MinLish</h2>
          <p className="text-muted">Chào mừng trở lại! Vui lòng đăng nhập</p>
        </div>

        {errorMsg && <div className="alert alert-danger p-2 fs-6">{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              placeholder="name@example.com"
              {...register('email')}
            />
            <label htmlFor="email">Địa chỉ Email</label>
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="form-floating mb-4">
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              placeholder="Mật khẩu"
              {...register('password')}
            />
            <label htmlFor="password">Mật khẩu</label>
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 fw-bold rounded-3"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
