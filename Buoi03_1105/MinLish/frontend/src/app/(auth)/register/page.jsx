'use client';
import { useState } from 'react';
import RegisterForm from './RegisterForm';
import VerifyOtpForm from './VerifyOtpForm';
import AuthCard from '@/components/ui/auth-card';

export default function RegisterPage() {
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleRegisterSuccess = (email) => {
    setRegisteredEmail(email);
    setStep('verify');
  };

  return (
    <AuthCard
      title={step === 'register' ? 'Đăng ký tài khoản để bắt đầu học' : 'Vui lòng xác thực tài khoản'}
    >
      {step === 'register' ? (
        <RegisterForm onSuccess={handleRegisterSuccess} />
      ) : (
        <VerifyOtpForm email={registeredEmail} />
      )}
    </AuthCard>
  );
}

