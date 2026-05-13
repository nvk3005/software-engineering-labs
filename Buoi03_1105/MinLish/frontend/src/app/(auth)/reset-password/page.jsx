import ResetPasswordForm from './ResetPasswordForm';
import AuthCard from '@/components/ui/auth-card';

export const metadata = {
  title: 'Đặt lại mật khẩu – MinLish',
  description: 'Nhập mã OTP và mật khẩu mới để khôi phục tài khoản',
};

export default function ResetPasswordPage({ searchParams }) {
  const email = searchParams?.email || '';

  return (
    <AuthCard title="Nhập mã OTP và mật khẩu mới">
      <ResetPasswordForm email={email} />
    </AuthCard>
  );
}