/**
 * Toggle Sidebar API Route
 * 
 * Handles toggling the sidebar collapsed state
 * Sets a cookie to persist the state across page reloads
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const currentState = cookieStore.get('sidebarCollapsed')?.value === 'true';
  
  // Toggle the state
  const newState = !currentState;
  
  // Set the cookie with the new state
  const response = NextResponse.redirect(new URL(request.headers.get('referer') || '/dashboard', request.url));
  response.cookies.set('sidebarCollapsed', String(newState), {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  return response;
} 