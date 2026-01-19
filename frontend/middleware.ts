import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings'];

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  // Note: Server-side middleware cannot access localStorage (client-side only)
  // We'll allow the frontend to handle authentication via the ProtectedRoute component
  // This middleware only handles initial route protection based on cookies if available
  // The frontend will handle localStorage-based authentication in ProtectedRoute component

  const token = request.cookies.get('token')?.value || null;
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // If user is on a protected route but not authenticated (based on cookies only),
  // redirect to login. The frontend will handle localStorage-based auth
  if (isProtectedRoute && !token) {
    // Preserve the attempted destination in the redirect
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated (via cookies) and tries to access public auth routes, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow the request to proceed
  // Frontend will handle localStorage-based authentication in ProtectedRoute component
  return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};