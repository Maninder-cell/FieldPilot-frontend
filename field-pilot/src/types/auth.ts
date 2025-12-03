// TypeScript interfaces for FieldRino Authentication

export interface User {
  id: string;  // UUID from backend
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  avatar_url?: string | null;
  role: 'owner' | 'admin' | 'employee';
  employee_id: string;
  department?: string | null;
  job_title?: string | null;
  is_active?: boolean;
  is_verified: boolean;
  two_factor_enabled?: boolean;
  created_at: string;
  last_login_at?: string | null;
  tenant_slug?: string; // Tenant slug for API routing
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
  access: string;
  refresh: string;
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp_code: string;
}

export interface VerifyEmailResponse {
  user: {
    id: string;  // UUID from backend
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

// Password Management Types

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOTPRequest {
  email: string;
  otp_code: string;
}

export interface VerifyResetOTPResponse {
  email: string;
  reset_token: string;
  expires_in: string;
}

export interface ResetPasswordRequest {
  email: string;
  reset_token: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Profile Management Types

export interface UserProfile {
  user: User;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  hire_date: string | null;
  skills: string[];
  certifications: string[];
  timezone: string;
  language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  hire_date: string | null;
  skills: string[];
  certifications: string[];
  timezone: string;
  language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}
