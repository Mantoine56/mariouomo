import { AuthService } from './auth-service';
import { config } from './config';

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
   * Make a GET request to the API
   * @param endpoint The API endpoint path
   * @param params Optional query parameters
   * @returns The response data
   * @throws ApiError if the request fails
   */
  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Build URL with query parameters
    const url = new URL(`${config.api.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    // Get authentication token
    const token = await AuthService.getToken();
    
    if (!token) {
      throw new ApiError('Authentication required', 401);
    }
    
    try {
      // Make the request
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...config.api.defaultHeaders,
        },
      });
      
      // Handle non-successful responses
      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Parsing error JSON failed, use default message
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Parse and return the response data
      return response.json();
    } catch (error) {
      // Rethrow API errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert other errors to ApiError
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }
  
  /**
   * Make a POST request to the API
   * @param endpoint The API endpoint path
   * @param data The data to send in the request body
   * @returns The response data
   * @throws ApiError if the request fails
   */
  static async post<T>(endpoint: string, data: any): Promise<T> {
    // Get authentication token
    const token = await AuthService.getToken();
    
    if (!token) {
      throw new ApiError('Authentication required', 401);
    }
    
    try {
      // Make the request
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...config.api.defaultHeaders,
        },
        body: JSON.stringify(data),
      });
      
      // Handle non-successful responses
      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Parsing error JSON failed, use default message
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      // Parse and return the response data
      return response.json();
    } catch (error) {
      // Rethrow API errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert other errors to ApiError
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }
} 