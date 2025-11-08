// Form validation utilities

import { ApiError } from '@/types/auth';

/**
 * Validate email address
 */
export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

/**
 * Validate password
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirm(password: string, passwordConfirm: string): string | null {
  if (!passwordConfirm) return 'Please confirm your password';
  
  if (password !== passwordConfirm) {
    return 'Passwords do not match';
  }
  
  return null;
}

/**
 * Get password strength score and label
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'Weak', color: 'red' };
  if (score <= 4) return { score, label: 'Medium', color: 'yellow' };
  return { score, label: 'Strong', color: 'green' };
}

/**
 * Validate phone number (optional field)
 */
export function validatePhone(phone: string): string | null {
  if (!phone) return null; // Phone is optional
  
  // Remove spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check for valid international format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid phone number with country code (e.g., +1234567890)';
  }
  
  return null;
}

/**
 * Validate OTP code
 */
export function validateOTP(otp: string): string | null {
  if (!otp) return 'Verification code is required';
  
  if (!/^\d{6}$/.test(otp)) {
    return 'Verification code must be 6 digits';
  }
  
  return null;
}

/**
 * Validate required text field
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  
  return null;
}

/**
 * Map API error response to form field errors
 */
export function mapApiErrorsToFields(apiError: ApiError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  if (apiError.details) {
    Object.entries(apiError.details).forEach(([field, messages]) => {
      // Take the first error message for each field
      fieldErrors[field] = messages[0];
    });
  }
  
  return fieldErrors;
}

/**
 * Get user-friendly error message from API error
 */
export function getErrorMessage(error: ApiError): string {
  // Handle specific error codes
  if (error.code === 'EMAIL_NOT_VERIFIED') {
    return 'Please verify your email before logging in.';
  }
  
  if (error.code === 'INVALID_CREDENTIALS') {
    return 'Invalid email or password. Please try again.';
  }
  
  // Return API message or generic fallback
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Validate date of birth
 */
export function validateDateOfBirth(date: string): string | null {
  if (!date) return null; // Optional field
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return 'Date must be in YYYY-MM-DD format';
  }
  
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (age < 18 || age > 100) {
    return 'Please enter a valid date of birth';
  }
  
  return null;
}

/**
 * Validate zip code
 */
export function validateZipCode(zipCode: string): string | null {
  if (!zipCode) return null; // Optional field
  
  // Support various zip code formats (US, Canada, UK, etc.)
  const zipRegex = /^[A-Z0-9\s-]{3,10}$/i;
  if (!zipRegex.test(zipCode)) {
    return 'Please enter a valid zip/postal code';
  }
  
  return null;
}

/**
 * Validate emergency contact phone
 */
export function validateEmergencyPhone(phone: string): string | null {
  if (!phone) return null; // Optional field
  
  return validatePhone(phone);
}

/**
 * Validate current password (for change password)
 */
export function validateCurrentPassword(password: string): string | null {
  if (!password) return 'Current password is required';
  return null;
}

/**
 * Validate new password (for reset/change password)
 */
export function validateNewPassword(password: string): string | null {
  return validatePassword(password);
}

/**
 * Validate new password confirmation
 */
export function validateNewPasswordConfirm(
  newPassword: string,
  newPasswordConfirm: string
): string | null {
  return validatePasswordConfirm(newPassword, newPasswordConfirm);
}

/**
 * Get user-friendly error message for password operations
 */
export function getPasswordErrorMessage(error: ApiError): string {
  if (error.code === 'INVALID_OTP') {
    return 'Invalid or expired verification code. Please request a new one.';
  }
  
  if (error.code === 'INCORRECT_PASSWORD') {
    return 'Current password is incorrect. Please try again.';
  }
  
  if (error.code === 'WEAK_PASSWORD') {
    return 'Password does not meet security requirements.';
  }
  
  return error.message || 'An error occurred. Please try again.';
}
