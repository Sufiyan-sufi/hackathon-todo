'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth/auth-context';
import { registerSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import ErrorMessage from './ErrorMessage';

type FormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { register: registerAuth, error, clearError, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  // Watch the password field to show strength requirements
  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    // Clear any previous errors
    clearError();

    try {
      await registerAuth(data.email, data.password, data.name);
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  // Function to check password strength
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    return { checks, passedChecks };
  };

  const { checks, passedChecks } = password ? checkPasswordStrength(password) : { checks: {}, passedChecks: 0 };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && <ErrorMessage message={error} onClose={clearError} />}

      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="name" className="sr-only">
            Full Name
          </label>
          <input
            id="name"
            {...register('name')}
            type="text"
            autoComplete="name"
            disabled={isLoading}
            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
              isLoading ? 'bg-gray-100' : ''
            }`}
            placeholder="Full Name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>
          <input
            id="email-address"
            {...register('email')}
            type="email"
            autoComplete="email"
            disabled={isLoading}
            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
              isLoading ? 'bg-gray-100' : ''
            }`}
            placeholder="Email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            {...register('password')}
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
              isLoading ? 'bg-gray-100' : ''
            }`}
            placeholder="Password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="sr-only">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            {...register('confirmPassword')}
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
              isLoading ? 'bg-gray-100' : ''
            }`}
            placeholder="Confirm Password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Password strength indicator */}
      {password && (
        <div className="text-xs p-2 bg-gray-50 rounded">
          <div className="font-medium mb-1">Password requirements:</div>
          <ul className="space-y-1">
            <li className={`flex items-center ${checks.length ? 'text-green-600' : 'text-gray-500'}`}>
              {checks.length ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="w-4 h-4 mr-1">○</span>
              )}
              At least 8 characters
            </li>
            <li className={`flex items-center ${checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
              {checks.lowercase ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="w-4 h-4 mr-1">○</span>
              )}
              Contains lowercase letter
            </li>
            <li className={`flex items-center ${checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
              {checks.uppercase ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="w-4 h-4 mr-1">○</span>
              )}
              Contains uppercase letter
            </li>
            <li className={`flex items-center ${checks.number ? 'text-green-600' : 'text-gray-500'}`}>
              {checks.number ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="w-4 h-4 mr-1">○</span>
              )}
              Contains number
            </li>
            <li className={`flex items-center ${checks.special ? 'text-green-600' : 'text-gray-500'}`}>
              {checks.special ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="w-4 h-4 mr-1">○</span>
              )}
              Contains special character
            </li>
          </ul>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
            isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </div>

      <div className="text-sm text-center">
        <span className="text-gray-600">Already have an account? </span>
        <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;