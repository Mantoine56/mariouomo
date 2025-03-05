import { Metadata } from 'next';

/**
 * Metadata for the registration page
 */
export const metadata: Metadata = {
  title: 'Register | Mario Uomo Admin',
  description: 'Create an admin account for the Mario Uomo dashboard',
};

/**
 * Layout for the registration page
 * Provides a clean container for the registration form
 */
export default function RegisterLayout({
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