// Authentication API Client for FieldRino

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
  ForgotPasswordRequest,
  VerifyResetOTPRequest,
  VerifyResetOTPResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserProfile,
  UserProfileFormData,
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
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
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
export async function logoutUser(refreshToken: string, accessToken: string): Promise<void> {
  try {
    await fetchAuthAPI<ApiResponse<void>>('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    // Log error but don't throw - logout should always succeed locally
    console.error('Logout API error:', error);
  }
}

/**
 * Get current user info
 * GET /api/auth/me/
 */
export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await fetchAuthAPI<ApiResponse<User>>('/auth/me/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

/**
 * Request password reset OTP
 * POST /api/auth/forgot-password/
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await fetchAuthAPI<ApiResponse<void>>('/auth/forgot-password/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Verify reset OTP and get reset token
 * POST /api/auth/verify-reset-otp/
 */
export async function verifyResetOTP(data: VerifyResetOTPRequest): Promise<VerifyResetOTPResponse> {
  const response = await fetchAuthAPI<ApiResponse<VerifyResetOTPResponse>>('/auth/verify-reset-otp/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}


/**
 * Reset password with OTP
 * POST /api/auth/reset-password/
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await fetchAuthAPI<ApiResponse<void>>('/auth/reset-password/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Change password for authenticated user
 * POST /api/auth/change-password/
 */
export async function changePassword(
  data: ChangePasswordRequest,
  accessToken: string
): Promise<void> {
  await fetchAuthAPI<ApiResponse<void>>('/auth/change-password/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Get user profile
 * GET /api/auth/profile/
 */
export async function getProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetchAuthAPI<ApiResponse<UserProfile>>('/auth/profile/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

/**
 * Update user profile
 * PUT /api/auth/profile/update/
 */
export async function updateProfile(
  data: Partial<UserProfileFormData>,
  accessToken: string
): Promise<UserProfile> {
  const response = await fetchAuthAPI<ApiResponse<UserProfile>>('/auth/profile/update/', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

/**
 * Get user profile by user ID (for viewing team member profiles)
 * GET /api/v1/auth/profile/{userId}/
 */
export async function getUserProfileById(userId: string, accessToken: string): Promise<UserProfile> {
  const response = await fetchAuthAPI<AuthApiResponse<UserProfile>>(
    `/auth/users/${userId}/profile/`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Upload user avatar
 * POST /api/v1/auth/profile/avatar/
 */
export async function uploadAvatar(file: File, accessToken: string): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE_URL}/auth/profile/avatar/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      message: errorData.message || 'Failed to upload avatar',
      details: errorData.details,
    } as ApiError;
  }

  const data: AuthApiResponse<{ avatar_url: string }> = await response.json();
  return data.data;
}
