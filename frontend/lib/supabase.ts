/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client that will be used for:
 * - Authentication
 * - Database operations
 * - Storage (file uploads/downloads)
 */
import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Initialize Supabase client
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

/**
 * Supabase client instance
 * This client is used for client-side operations with anonymous permissions
 * Configured to use cookies for session storage to allow proper auth with middleware
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use cookies as the storage mechanism
    storage: {
      getItem: (key) => {
        if (typeof document === 'undefined') return null;
        const value = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${key}=`))
          ?.split('=')[1];
        return value ? value : null;
      },
      setItem: (key, value) => {
        if (typeof document === 'undefined') return;
        document.cookie = `${key}=${value}; path=/; max-age=2592000; SameSite=Lax; secure`;
      },
      removeItem: (key) => {
        if (typeof document === 'undefined') return;
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      },
    },
  },
});

/**
 * Helper function to get the storage URL for a given bucket and file path
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns The full URL to the file
 */
export function getStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Helper function to upload a file to Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @param file The file to upload
 * @returns The upload result with data or error
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  return { data, error };
}

/**
 * Helper function to delete a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns The delete result with data or error
 */
export async function deleteFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  return { data, error };
}

/**
 * Helper function to sign out the current user
 * Clears all session data and cookies
 * @returns Promise that resolves after logout is complete
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  // Clear any custom cookies that might be set
  if (typeof document !== 'undefined') {
    document.cookie = `currentPath=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
  
  return { error };
}

/**
 * Helper function to get user information from session
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

/**
 * Subscribe to auth changes
 * @param callback Function to call when auth state changes
 * @returns Subscription that can be unsubscribed
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
} 