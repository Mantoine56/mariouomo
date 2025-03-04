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
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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