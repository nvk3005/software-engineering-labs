'use client';
import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/axios';
import { Button } from '@/components/ui/button';
import OtpInput from '@/components/ui/otp-input';

const verifyOtpSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  otpCode: z
    .string()
    .length(6, 'Mã OTP phải đúng 6 chữ số')
    .regex(/^\d{6}$/, 'Mã OTP chỉ gồm chữ số'),
});

export default function VerifyOtpForm({ email }) {
  const router = useRouter();
  const otpInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { 
      email: email || '',
      otpCode: ''
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await axiosInstance.post('/auth/verify-otp', {
        email: data.email,
        otpCode: data.otpCode,
      });
      router.push('/login?verified=success');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn');
      // Trigger animation and clear
      if (otpInputRef.current) {
        otpInputRef.current.clearWithAnimation();
      }

    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMsg('');
    setResendSuccess('');
    try {
      await axiosInstance.post('/auth/resend-otp', { email });
      setResendSuccess('Đã gửi lại mã OTP mới!');
      setTimeout(() => setResendSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể gửi lại mã, vui lòng thử lại sau');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Chúng tôi đã gửi mã xác thực đến email<br />
          <strong className="text-foreground">{email}</strong>.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive text-center">
          {errorMsg}
        </div>
      )}

      {resendSuccess && (
        <div className="rounded-md bg-green-100 px-4 py-2 text-sm text-green-700 text-center">
          {resendSuccess}
        </div>
      )}

      <div className="py-2">
        <label className="text-sm font-medium mb-3 block text-center">Nhập mã xác thực 6 chữ số</label>
        <Controller
          name="otpCode"
          control={control}
          render={({ field }) => (
            <OtpInput
              ref={otpInputRef}
              value={field.value}
              onChange={field.onChange}
              error={errors.otpCode?.message}
            />
          )}
        />
      </div>

      <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading || isResending}>
        {isLoading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Không nhận được mã?{' '}
        <button
          type="button"
          className="text-primary hover:underline font-semibold disabled:opacity-50"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? 'Đang gửi...' : 'Gửi lại'}
        </button>
      </div>
    </form>
  );
}


