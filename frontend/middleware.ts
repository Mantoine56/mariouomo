import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect dashboard routes
 * Checks for Supabase session cookies and redirects to login if not authenticated
 */
export async function middleware(request: NextRequest) {
  // Only apply to dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for ALL possible Supabase session cookies
    const hasAuthToken = request.cookies.has('sb-erxqwxyhulnycscgbzlm-auth-token');
    const hasAccessToken = request.cookies.has('sb-access-token');
    const hasRefreshToken = request.cookies.has('sb-refresh-token');
    
    // If any of these cookies exist, consider the user authenticated
    const hasSession = hasAuthToken || hasAccessToken || hasRefreshToken;
    
    // Log authentication state (only in development)
    if (process.env.NODE_ENV === 'development') {
      // Get cookie names by parsing the Cookie header
      const cookieHeader = request.headers.get('cookie') || '';
      const cookieNames = cookieHeader
        .split(';')
        .map(cookie => cookie.trim().split('=')[0])
        .filter(Boolean);
      
      console.log('[Middleware] Authentication check:', {
        path: request.nextUrl.pathname,
        hasAuthToken,
        hasAccessToken,
        hasRefreshToken,
        hasSession,
        // Show cookie names for debugging
        cookieNames,
      });
    }
    
    if (!hasSession) {
      // Redirect to login if no session exists
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      
      // Log redirect (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Redirecting to:', loginUrl.toString());
      }
      
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

/**
 * Configure paths that should be checked by this middleware
 */
export const config = {
  matcher: ['/dashboard/:path*'],
}; 