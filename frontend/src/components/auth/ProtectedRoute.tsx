'use client';

import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface ProtectedRouteProps {
  children: ReactElement;
  fallbackPath?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackPath = '/login',
  redirectTo
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated) {
      const redirectPath = redirectTo || fallbackPath;

      // Preserve the attempted destination in URL params
      const currentPath = window.location.pathname + window.location.search;
      const encodedRedirect = encodeURIComponent(currentPath);

      router.push(`${redirectPath}?redirect=${encodedRedirect}`);
    }
  }, [isAuthenticated, isLoading, router, fallbackPath, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authenticated, render the protected content
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated, return nothing (will be redirected by useEffect)
  return null;
};

export default ProtectedRoute;