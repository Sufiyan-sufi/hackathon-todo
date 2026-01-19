'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPageContent = () => {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // If user is already authenticated, redirect to dashboard or redirect path
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  if (isAuthenticated) {
    return null; // Render nothing if redirecting
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </a>
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
};

const RegisterPage = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </React.Suspense>
  );
};

export default RegisterPage;