import { supabase } from './supabase';

/**
 * Authentication service for managing JWT tokens and user sessions
 * Connects to Supabase for authentication and retrieves tokens for API requests
 */
export class AuthService {
  // Store JWT token in memory (consider more secure options for production)
  private static token: string | null = null;

  /**
   * Get the JWT token for API requests
   * @returns The JWT token or null if not authenticated
   */
  static async getToken(): Promise<string | null> {
    // If we already have a token, return it
    if (this.token) return this.token;

    // Get session from Supabase
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    if (session?.access_token) {
      this.token = session.access_token;
      return this.token;
    }

    return null;
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated, false otherwise
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Clear the stored token (on logout)
   */
  static clearToken() {
    this.token = null;
  }
  
  /**
   * Get the user role from the token
   * @returns The user role (e.g., 'admin', 'user') or null if not authenticated
   */
  static async getUserRole(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    if (session?.user?.app_metadata?.role) {
      return session.user.app_metadata.role;
    }
    
    return null;
  }
  
  /**
   * Check if the current user has admin privileges
   * @returns True if the user is an admin, false otherwise
   */
  static async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin';
  }
} 