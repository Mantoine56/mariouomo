import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect dashboard routes
 */
export async function middleware(request: NextRequest) {
  // Only apply to dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for Supabase session cookies
    const hasSession = request.cookies.has('sb-access-token') || 
                        request.cookies.has('sb-refresh-token');
    
    if (!hasSession) {
      // Redirect to login if no session exists
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
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