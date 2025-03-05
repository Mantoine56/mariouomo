import { Metadata } from 'next';

/**
 * Metadata for the login page
 */
export const metadata: Metadata = {
  title: 'Login | Mario Uomo Admin',
  description: 'Sign in to the Mario Uomo admin dashboard',
};

/**
 * Layout for the login page
 * Provides a clean container for the login form
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 