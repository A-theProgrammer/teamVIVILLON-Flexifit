
import React from 'react';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

const RegisterPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Join Flexifit</h1>
        <RegistrationForm />
      </div>
    </div>
  );
};

export default RegisterPage;
