'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

/**
 * Login page component
 * Handles user authentication using Supabase
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        
        if (data?.session) {
          console.log('Existing session found, redirecting to:', redirectPath);
          // Use replace and direct location for more reliable redirect
          window.location.href = redirectPath;
          router.replace(redirectPath);
        } else {
          console.log('No existing session found');
        }
      } catch (err) {
        console.error('Session check exception:', err);
      }
    };
    
    checkSession();
  }, [redirectPath, router]);

  /**
   * Handle form submission
   * Attempts to sign in the user with the provided credentials
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // If login successful, redirect
      if (data?.user) {
        console.log('Authentication successful, redirecting to:', redirectPath);
        
        // Force refresh the auth state before redirecting
        await supabase.auth.getSession();
        
        // Use replace instead of push for a cleaner navigation history
        // and add a slight delay to ensure cookies are properly set
        setTimeout(() => {
          console.log('Executing redirect to:', redirectPath);
          window.location.href = redirectPath; // Direct browser redirect as fallback
          router.replace(redirectPath);
        }, 500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Mario Uomo</h1>
          <p className="text-muted-foreground">Admin Dashboard Login</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            This is a secure area. Please sign in with your Supabase credentials.
          </p>
        </div>
      </Card>
    </div>
  );
} 