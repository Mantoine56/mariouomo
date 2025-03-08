import { config } from './config';
import { createClient } from '@supabase/supabase-js';

/**
 * API Error class for handling API-specific errors
 * Used to provide more context for errors from the backend
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Base API client for making authenticated requests to the backend
 * Connects to the NestJS backend API endpoints
 */
export class ApiClient {
  /**
   * Returns the authentication token from Supabase
   * This is a production-ready implementation without mock tokens
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      console.log('Getting authentication token from Supabase...');
      const supabase = createClient(config.supabase.url, config.supabase.anonKey);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting Supabase session:', error);
        return null;
      }
      
      if (data?.session) {
        // Only log token length for security
        console.log('Retrieved token successfully', {
          hasToken: !!data.session.access_token,
          tokenLength: data.session.access_token?.length,
          expiresAt: data.session.expires_at
        });
        
        return data.session.access_token;
      } else {
        console.log('No active Supabase session found');
        return null;
      }
    } catch (e) {
      console.error('Error in getAuthToken:', e);
      return null;
    }
  }

  /**
   * Makes a GET request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param params Optional query parameters
   * @param options Optional request options
   * @returns Promise resolving to the response data
   */
  static async get<T>(
    endpoint: string, 
    params?: Record<string, string>, 
    options?: { 
      customAuthHeader?: boolean // If true, send the token directly without 'Bearer ' prefix
    }
  ): Promise<T> {
    try {
      // Construct URL with query parameters
      let url = `${config.api.baseUrl}${endpoint}`;
      if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
      }
      
      // Add custom tag for logging if using non-standard auth header
      const customTag = options?.customAuthHeader ? ' (with custom auth header)' : '';
      console.log(`Making GET request to: ${url}${customTag}`);
      
      // Get auth token
      const token = await ApiClient.getAuthToken();
      console.log(`Authorization token present: ${!!token}`);
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...config.api.defaultHeaders
      };
      
      // Add authorization header if token is available
      if (token) {
        if (options?.customAuthHeader) {
          // Used for APIs that expect the raw token
          headers['Authorization'] = token;
          console.log(`Added Authorization header with raw token (length: ${token.length})`);
        } else {
          // Standard Bearer token format
          headers['Authorization'] = `Bearer ${token}`;
          console.log(`Added Authorization header with Bearer token (length: ${token.length})`);
        }
      }
      
      console.log('Request headers:', headers);
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'  // Include cookies for session management
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication error - token might be invalid or expired');
        throw new ApiError('Unauthorized', response.status);
      }
      
      // Handle other error responses
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        
        try {
          // Try to parse error details from response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Parse successful response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Rethrow ApiErrors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert other errors to ApiError with generic message
      console.error('API request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred', 
        0
      );
    }
  }
  
  /**
   * Makes a POST request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns Promise resolving to the response data
   */
  static async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const url = `${config.api.baseUrl}${endpoint}`;
      console.log(`Making POST request to: ${url}`);
      
      // Get auth token
      const token = await ApiClient.getAuthToken();
      console.log(`Authorization token present: ${!!token}`);
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...config.api.defaultHeaders
      };
      
      // Add authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`Added Authorization header with Bearer token (length: ${token.length})`);
      }
      
      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',  // Include cookies for session management
        body: JSON.stringify(data)
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication error - token might be invalid or expired');
        throw new ApiError('Unauthorized', response.status);
      }
      
      // Handle other error responses
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        
        try {
          // Try to parse error details from response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Parse successful response
      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      // Rethrow ApiErrors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert other errors to ApiError with generic message
      console.error('API request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred', 
        0
      );
    }
  }
  
  /**
   * Makes a DELETE request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @returns Promise resolving to the response data
   */
  static async delete<T>(endpoint: string): Promise<T> {
    try {
      const url = `${config.api.baseUrl}${endpoint}`;
      console.log(`Making DELETE request to: ${url}`);
      
      // Get auth token
      const token = await ApiClient.getAuthToken();
      console.log(`Authorization token present: ${!!token}`);
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...config.api.defaultHeaders
      };
      
      // Add authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`Added Authorization header with Bearer token (length: ${token.length})`);
      }
      
      // Make the request
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include'  // Include cookies for session management
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication error - token might be invalid or expired');
        throw new ApiError('Unauthorized', response.status);
      }
      
      // Handle other error responses
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        
        try {
          // Try to parse error details from response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Parse successful response
      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      // Rethrow ApiErrors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert other errors to ApiError with generic message
      console.error('API request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred', 
        0
      );
    }
  }

  /**
   * Makes a PUT request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns Promise resolving to the response data
   */
  static async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const url = `${config.api.baseUrl}${endpoint}`;
      console.log(`Making PUT request to: ${url}`);
      
      // Get auth token
      const token = await ApiClient.getAuthToken();
      console.log(`Authorization token present: ${!!token}`);
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...config.api.defaultHeaders
      };
      
      // Add authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`Added Authorization header with Bearer token (length: ${token.length})`);
      }
      
      // Make the request
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',  // Include cookies for session management
        body: JSON.stringify(data)
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication error - token might be invalid or expired');
        throw new ApiError('Unauthorized', response.status);
      }
      
      // Handle other error responses
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        
        try {
          // Try to parse error details from response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Parse successful response
      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      // Rethrow ApiErrors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert other errors to ApiError with generic message
      console.error('API request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred', 
        0
      );
    }
  }

  /**
   * Checks if the backend API is available
   * @returns A promise resolving to true if backend is available, false otherwise
   */
  static async isBackendAvailable(): Promise<boolean> {
    try {
      const url = `${config.api.baseUrl}/health`;
      console.log(`Checking if backend is available at: ${url}`);
      
      // Use a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: config.api.defaultHeaders,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Backend availability check result: {status: ${response.status}, ok: ${response.ok}, statusText: '${response.statusText}'}`);
        return response.ok;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          console.error('Backend availability check timed out after 3 seconds');
        } else {
          console.error('Error during backend availability check:', fetchError);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error in isBackendAvailable:', error);
      return false;
    }
  }

  /**
   * Validates the current token with the backend server
   * @returns A promise resolving to true if token is valid, false otherwise
   */
  static async validateTokenWithBackend(): Promise<boolean> {
    try {
      console.log('Validating token with backend...');
      const requestId = Math.random().toString(36).substring(2, 8);
      
      const token = await ApiClient.getAuthToken();
      if (!token) {
        console.log(`[${requestId}] No token available to validate`);
        return false;
      }
      
      console.log(`[${requestId}] Token available for validation (length: ${token.length})`);
      
      // Use a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${config.api.baseUrl}/auth/validate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`[${requestId}] Token validation response status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`[${requestId}] Token validation failed with status: ${response.status}`);
          return false;
        }
        
        const result = await response.json();
        console.log(`[${requestId}] Token validation successful`);
        return true;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          console.error(`[${requestId}] Token validation request timed out after 5 seconds`);
        } else {
          console.error(`[${requestId}] Error during token validation:`, fetchError);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error in validateTokenWithBackend:', error);
      return false;
    }
  }
} 