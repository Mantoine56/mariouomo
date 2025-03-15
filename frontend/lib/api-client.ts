import { config } from './config';
import { supabase } from './supabase';

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
 * API Client Service
 * 
 * Handles API requests to the backend
 * Manages authentication, error handling, and response parsing
 */
export class ApiClient {
  // Map to track failed endpoints to avoid repeated calls
  private static failedEndpoints = new Map<string, { timestamp: number, retryCount: number }>();
  private static readonly ERROR_COOLDOWN = 60 * 1000; // 1 minute cooldown before retrying
  private static readonly MAX_RETRY_COUNT = 3; // Max number of retries before longer cooldown
  private static readonly EXTENDED_ERROR_COOLDOWN = 15 * 60 * 1000; // 15 minutes for repeated failures
  
  /**
   * Check if an endpoint is on cooldown due to previous errors
   * @param endpoint The API endpoint to check
   * @returns boolean indicating if endpoint is on cooldown
   */
  private static isEndpointOnCooldown(endpoint: string): boolean {
    const failedEndpoint = ApiClient.failedEndpoints.get(endpoint);
    
    if (!failedEndpoint) {
      return false;
    }
    
    const now = Date.now();
    const { timestamp, retryCount } = failedEndpoint;
    
    // Use longer cooldown for endpoints that have failed multiple times
    const cooldownPeriod = retryCount >= ApiClient.MAX_RETRY_COUNT
      ? ApiClient.EXTENDED_ERROR_COOLDOWN
      : ApiClient.ERROR_COOLDOWN;
    
    if (now - timestamp < cooldownPeriod) {
      // Still on cooldown
      return true;
    }
    
    // Cooldown expired, remove from map
    ApiClient.failedEndpoints.delete(endpoint);
    return false;
  }
  
  /**
   * Mark an endpoint as failed
   * @param endpoint The API endpoint that failed
   */
  private static markEndpointAsFailed(endpoint: string): void {
    const existingEntry = ApiClient.failedEndpoints.get(endpoint);
    
    if (existingEntry) {
      // Increment retry count for existing entry
      ApiClient.failedEndpoints.set(endpoint, {
        timestamp: Date.now(),
        retryCount: existingEntry.retryCount + 1
      });
    } else {
      // Add new entry
      ApiClient.failedEndpoints.set(endpoint, {
        timestamp: Date.now(),
        retryCount: 1
      });
    }
  }
  
  /**
   * Returns the authentication token from Supabase
   * This is a production-ready implementation without mock tokens
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting Supabase session:', error);
        return null;
      }
      
      if (data?.session) {
        return data.session.access_token;
      } else {
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
      customAuthHeader?: boolean, // If true, send the token directly without 'Bearer ' prefix
      bypassCooldown?: boolean // If true, bypass the endpoint cooldown check
    }
  ): Promise<T> {
    try {
      // Ensure endpoint starts with a slash if not already
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Check if endpoint is on cooldown due to previous errors
      if (!options?.bypassCooldown && ApiClient.isEndpointOnCooldown(normalizedEndpoint)) {
        throw new ApiError(`Endpoint ${normalizedEndpoint} is temporarily unavailable`, 503);
      }
      
      // Construct URL with query parameters
      let url = `${config.api.baseUrl}${normalizedEndpoint}`;
      if (params && Object.keys(params).length > 0) {
        // Ensure all params are properly stringified
        const validParams: Record<string, string> = {};
        
        for (const key in params) {
          if (params[key] !== undefined && params[key] !== null) {
            validParams[key] = String(params[key]);
          }
        }
        
        const queryString = new URLSearchParams(validParams).toString();
        url += `?${queryString}`;
      }
      
      // Get auth token
      const token = await ApiClient.getAuthToken();
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...config.api.defaultHeaders
      };
      
      // Add authorization header if token is available
      if (token) {
        if (options?.customAuthHeader) {
          // Used for APIs that expect the raw token
          headers['Authorization'] = token;
        } else {
          // Standard Bearer token format
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'  // Include cookies for session management
      });
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication error - token might be invalid or expired');
        throw new ApiError('Unauthorized', response.status);
      }
      
      // Handle 500 Internal Server Errors
      if (response.status === 500) {
        let errorMessage = 'Internal server error';
        let errorDetails = null;
        
        try {
          // Try to parse error details from response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData;
          console.error(`500 Internal Server Error at ${url}:`, errorData);
        } catch (e) {
          console.error(`500 Internal Server Error at ${url}, could not parse details`);
        }
        
        // Mark endpoint as failed to prevent repeated calls
        ApiClient.markEndpointAsFailed(normalizedEndpoint);
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Handle bad request errors
      if (response.status === 400) {
        let errorMessage = 'Bad request';
        
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
        console.error(`API error: ${error.message} (status: ${error.status})`);
        throw error;
      }
      
      // Convert other errors to ApiError with generic message
      console.error('Request failed:', error);
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
      // Ensure endpoint starts with a slash if not already
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      const url = `${config.api.baseUrl}${normalizedEndpoint}`;
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
      
      // Check if response has content
      const contentLength = response.headers.get('Content-Length');
      const hasContent = contentLength === null || parseInt(contentLength) > 0;
      
      // Handle empty responses gracefully (successful but no content)
      if (!hasContent) {
        console.log('API returned success with empty response');
        // Return an empty object as the successful result for 201 Created or 204 No Content
        if (response.status === 201 || response.status === 204) {
          return { success: true } as T;
        }
        return {} as T;
      }
      
      try {
        // Parse successful response
        const responseData = await response.json();
        return responseData as T;
      } catch (error) {
        console.warn('Could not parse JSON response, returning empty object', error);
        // If there was content but it couldn't be parsed as JSON, return empty object
        return { success: true } as T;
      }
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
      // Ensure endpoint starts with a slash if not already
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      const url = `${config.api.baseUrl}${normalizedEndpoint}`;
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
      
      // Check if response has content
      const contentLength = response.headers.get('Content-Length');
      const hasContent = contentLength === null || parseInt(contentLength) > 0;
      
      // Handle empty responses gracefully (successful but no content)
      if (!hasContent) {
        console.log('API returned success with empty response');
        // Return an empty object as the successful result for 204 No Content
        if (response.status === 204) {
          return { success: true } as T;
        }
        return {} as T;
      }
      
      try {
        // Parse successful response
        const responseData = await response.json();
        return responseData as T;
      } catch (error) {
        console.warn('Could not parse JSON response, returning empty object', error);
        // If there was content but it couldn't be parsed as JSON, return empty object
        return { success: true } as T;
      }
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
      // Ensure endpoint starts with a slash if not already
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      const url = `${config.api.baseUrl}${normalizedEndpoint}`;
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
      
      // Check if response has content
      const contentLength = response.headers.get('Content-Length');
      const hasContent = contentLength === null || parseInt(contentLength) > 0;
      
      // Handle empty responses gracefully (successful but no content)
      if (!hasContent) {
        console.log('API returned success with empty response');
        // Return an empty object as the successful result
        return { success: true } as T;
      }
      
      try {
        // Parse successful response
        const responseData = await response.json();
        return responseData as T;
      } catch (error) {
        console.warn('Could not parse JSON response, returning empty object', error);
        // If there was content but it couldn't be parsed as JSON, return empty object
        return { success: true } as T;
      }
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