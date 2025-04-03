
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Welcome Back</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
