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

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
});

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await axiosInstance.post('/auth/forgot-password', { email: data.email });
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
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
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}