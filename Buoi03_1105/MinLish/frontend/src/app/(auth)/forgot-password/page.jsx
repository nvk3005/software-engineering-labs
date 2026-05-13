import ForgotPasswordForm from './ForgotPasswordForm';
import AuthCard from '@/components/ui/auth-card';

export const metadata = {
  title: 'Quên mật khẩu - MinLish',
  description: 'Nhập email để nhận mã OTP đặt lại mật khẩu',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Nhập email để nhận mã OTP khôi phục mật khẩu">
      <ForgotPasswordForm />
    </AuthCard>
  );
}