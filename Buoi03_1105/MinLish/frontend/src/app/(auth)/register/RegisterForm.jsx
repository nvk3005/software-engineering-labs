'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import axiosInstance from '@/services/axios';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Tên người dùng ít nhất 3 ký tự'),
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export default function RegisterForm({ onSuccess }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosInstance.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      // res.data.data will contain the email or message from backend
      onSuccess(data.email);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {errorMsg && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <FormField
        id="username"
        label="Tên đăng nhập"
        type="text"
        placeholder="username"
        error={errors.username?.message}
        {...register('username')}
      />

      <FormField
        id="email"
        label="Địa chỉ Email"
        type="email"
        placeholder="name@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormField
        id="password"
        label="Mật khẩu"
        type="password"
        placeholder="Tối thiểu 6 ký tự"
        error={errors.password?.message}
        {...register('password')}
      />

      <FormField
        id="confirmPassword"
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </form>
  );
}
