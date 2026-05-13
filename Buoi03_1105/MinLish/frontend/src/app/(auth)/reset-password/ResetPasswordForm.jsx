'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/services/axios';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';

const resetPasswordSchema = z
  .object({
    email: z.string().email('Email không đúng định dạng'),
    otpCode: z
      .string()
      .length(6, 'Mã OTP phải đúng 6 chữ số')
      .regex(/^\d{6}$/, 'Mã OTP chỉ gồm chữ số'),
    newPassword: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export default function ResetPasswordForm({ email }) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: email || '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await axiosInstance.post('/auth/reset-password', {
        email: data.email,
        otpCode: data.otpCode,
        newPassword: data.newPassword,
      });
      router.push('/login?reset=success');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
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
        id="email"
        label="Địa chỉ Email"
        type="email"
        placeholder="name@example.com"
        readOnly
        className="opacity-70"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormField
        id="otpCode"
        label="Mã OTP (6 chữ số)"
        type="text"
        placeholder="123456"
        maxLength={6}
        inputMode="numeric"
        error={errors.otpCode?.message}
        {...register('otpCode')}
      />

      <FormField
        id="newPassword"
        label="Mật khẩu mới"
        type="password"
        placeholder="Tối thiểu 6 ký tự"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />

      <FormField
        id="confirmPassword"
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu mới"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-primary hover:underline">
          ← Gửi lại OTP
        </Link>
      </p>
    </form>
  );
}