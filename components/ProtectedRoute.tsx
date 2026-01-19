import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback = null }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth');
      } else {
        setHasCheckedAuth(true);
      }
    }
  }, [user, isLoading, router]);

  // Show fallback while checking authentication
  if (isLoading || !hasCheckedAuth) {
    return fallback || <div>Loading...</div>;
  }

  // If user is authenticated, render children
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated, return fallback (which should redirect in useEffect)
  return <>{fallback}</>;
}