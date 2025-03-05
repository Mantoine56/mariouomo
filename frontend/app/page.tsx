// File: app/page.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Home page component
 * Serves as the landing page with links to login and dashboard
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Mario Uomo</h1>
        <p className="text-xl mb-8">Premium Men's Fashion E-commerce</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">
              Admin Login
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/register">
              Create Admin Account
            </Link>
          </Button>
        </div>
        
        <p className="mt-8 text-sm text-muted-foreground">
          This is a development environment for the Mario Uomo admin dashboard.
        </p>
      </div>
    </main>
  );
}
