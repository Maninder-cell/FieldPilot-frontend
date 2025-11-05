// Authentication API Client for Field Pilot

import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendOTPRequest,
  TokenRefreshResponse,
  ApiResponse,
  ApiError,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Generic fetch wrapper with error handling for authentication endpoints
 */
async function fetchAuthAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle backend error structure
      const error: ApiError = {
        status: response.status,
        message: data.error?.message || data.message || 'An error occurred',
        details: data.error?.details || data.details,
        code: data.error?.code || data.code,
      };
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if ((error as ApiError).status) {
      throw error;
    }
    
    // Handle network errors
    throw {
      status: 0,
      message: 'Network error. Please check your connection and try again.',
    } as ApiError;
  }
}

/**
 * Register a new user
 * POST /api/auth/register/
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetchAuthAPI<ApiResponse<{ user: User }>>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return { user: response.data.user };
}

/**
 * Login user and get JWT tokens
 * POST /api/auth/login/
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetchAuthAPI<ApiResponse<LoginResponse>>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.data;
}

/**
 * Verify email with OTP code
 * POST /api/auth/verify-email/
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const response = await fetchAuthAPI<ApiResponse<VerifyEmailResponse>>('/auth/verify-email/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.data;
}

/**
 * Resend OTP code
 * POST /api/auth/resend-otp/
 */
export async function resendOTP(data: ResendOTPRequest): Promise<void> {
  await fetchAuthAPI<ApiResponse<void>>('/auth/resend-otp/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Refresh access token
 * POST /api/auth/token/refresh/
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse> {
  const response = await fetchAuthAPI<TokenRefreshResponse>('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  });
  
  return response;
}

/**
 * Logout user and blacklist refresh token
 * POST /api/auth/logout/
 */
export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    await fetchAuthAPI<ApiResponse<void>>('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch (error) {
    // Log error but don't throw - logout should always succeed locally
    console.error('Logout API error:', error);
  }
}

/**
 * Get current user info
 * GET /api/auth/profile/
 */
export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await fetchAuthAPI<ApiResponse<{ user: User }>>('/auth/profile/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  return response.data.user;
}
