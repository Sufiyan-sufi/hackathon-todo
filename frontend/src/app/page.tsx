'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If user is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If user is not authenticated, redirect to login
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a loading state while checking authentication status
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-zinc-50"></div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">
            Loading...
          </h1>
          <p className="text-lg text-gray-600 dark:text-zinc-400 text-center">
            Checking authentication status
          </p>
        </div>
      </main>
    </div>
  );
}
