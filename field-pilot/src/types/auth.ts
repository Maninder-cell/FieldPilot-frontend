// TypeScript interfaces for Field Pilot Authentication

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'employee';
  employee_id: string;
  department: string | null;
  job_title: string | null;
  is_active: boolean;
  is_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'owner' | 'admin' | 'employee';
}

export interface RegisterResponse {
  user: User;
}

export interface VerifyEmailRequest {
  email: string;
  otp_code: string;
}

export interface VerifyEmailResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
  };
}

export interface ResendOTPRequest {
  email: string;
  purpose: 'email_verification' | 'password_reset';
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
}
