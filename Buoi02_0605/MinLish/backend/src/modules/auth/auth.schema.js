import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Tên người dùng ít nhất 3 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự')
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  otpCode: z.string().length(6, 'Mã OTP phải có 6 chữ số')
});


export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  otpCode: z.string().length(6, 'Mã OTP phải có 6 chữ số'),
  newPassword: z.string().min(6, 'Mật khẩu mới ít nhất 6 ký tự')
});
