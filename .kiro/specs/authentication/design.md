# Authentication Feature Design Document

## Overview

This design document outlines the technical architecture and implementation approach for the authentication feature in the Field Pilot application. The authentication system will provide user registration, email verification, login, and session management capabilities using Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS.

The system integrates with the backend API documented in `BACKEND_API_REFERENCE.md` and follows the existing project patterns established in the landing page implementation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  /login          │  /register       │  /verify-email        │
│  LoginPage       │  RegisterPage    │  VerifyEmailPage      │
└────────┬─────────┴────────┬─────────┴────────┬──────────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │     Authentication Context          │
         │  - User State Management            │
         │  - Token Management                 │
         │  - Auto Token Refresh               │
         └──────────────────┬──────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │        API Client Layer             │
         │  - Auth API Functions               │
         │  - Token Interceptors               │
         │  - Error Handling                   │
         └──────────────────┬──────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │      Backend API (Django)           │
         │  - /api/auth/register/              │
         │  - /api/auth/login/                 │
         │  - /api/auth/verify-email/          │
         │  - /api/auth/token/refresh/         │
         └─────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: React Context API
- **Storage**: Browser LocalStorage for tokens
- **HTTP Client**: Native Fetch API

## Components and Interfaces

### 1. Page Components

#### LoginPage (`/app/login/page.tsx`)
- Renders the login form
- Handles login form submission
- Manages navigation to register and forgot password pages
- Redirects authenticated users to dashboard

#### RegisterPage (`/app/register/page.tsx`)
- Renders the registration form
- Handles registration form submission
- Validates password strength
- Redirects to email verification on success

#### VerifyEmailPage (`/app/verify-email/page.tsx`)
- Renders the OTP verification form
- Handles OTP submission
- Provides resend OTP functionality
- Redirects to login on successful verification

### 2. Form Components

#### LoginForm (`/components/auth/LoginForm.tsx`)
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}
```

Features:
- Email and password input fields
- Remember me checkbox
- Password visibility toggle
- Real-time validation
- Loading state during submission
- Error message display

#### RegisterForm (`/components/auth/RegisterForm.tsx`)
```typescript
interface RegisterFormProps {
  onSuccess?: (email: string) => void;
}

interface RegisterFormData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}
```

Features:
- All required registration fields
- Password strength indicator
- Password confirmation validation
- Phone number formatting
- Real-time field validation
- Loading state during submission

#### VerifyEmailForm (`/components/auth/VerifyEmailForm.tsx`)
```typescript
interface VerifyEmailFormProps {
  email?: string;
  onSuccess?: () => void;
}

interface VerifyEmailFormData {
  email: string;
  otp_code: string;
}
```

Features:
- Email input (pre-filled if available)
- 6-digit OTP input
- Resend OTP button with cooldown timer
- Auto-focus on OTP field
- Loading state during submission

### 3. Shared UI Components

#### FormInput (`/components/ui/FormInput.tsx`)
```typescript
interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}
```

#### Button (`/components/ui/Button.tsx`)
```typescript
interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}
```

#### Alert (`/components/ui/Alert.tsx`)
```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}
```

### 4. Context and State Management

#### AuthContext (`/contexts/AuthContext.tsx`)
```typescript
interface User {
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  verifyEmail: (email: string, otpCode: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

Features:
- Centralized authentication state
- Automatic token refresh before expiration
- Persistent authentication across page reloads
- Protected route handling

## Data Models

### TypeScript Interfaces

#### Authentication Types (`/types/auth.ts`)
```typescript
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
```

### Local Storage Schema

```typescript
// Keys used for localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'field_pilot_access_token',
  REFRESH_TOKEN: 'field_pilot_refresh_token',
  USER_DATA: 'field_pilot_user_data',
  TOKEN_EXPIRY: 'field_pilot_token_expiry',
};
```

## API Integration

### Authentication API Client (`/lib/auth-api.ts`)

```typescript
/**
 * Register a new user
 * POST /api/auth/register/
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse>

/**
 * Login user and get JWT tokens
 * POST /api/auth/login/
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse>

/**
 * Verify email with OTP code
 * POST /api/auth/verify-email/
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse>

/**
 * Resend OTP code
 * POST /api/auth/resend-otp/
 */
export async function resendOTP(data: ResendOTPRequest): Promise<void>

/**
 * Refresh access token
 * POST /api/auth/token/refresh/
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse>

/**
 * Logout user and blacklist refresh token
 * POST /api/auth/logout/
 */
export async function logoutUser(refreshToken: string): Promise<void>

/**
 * Get current user info
 * GET /api/auth/me/
 */
export async function getCurrentUser(): Promise<User>
```

### Token Management Utilities (`/lib/token-utils.ts`)

```typescript
/**
 * Store authentication tokens in localStorage
 */
export function storeTokens(accessToken: string, refreshToken: string): void

/**
 * Retrieve access token from localStorage
 */
export function getAccessToken(): string | null

/**
 * Retrieve refresh token from localStorage
 */
export function getRefreshToken(): string | null

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void

/**
 * Check if access token is expired or about to expire
 */
export function isTokenExpired(token: string): boolean

/**
 * Decode JWT token to get expiration time
 */
export function decodeToken(token: string): { exp: number } | null

/**
 * Calculate time until token expiration
 */
export function getTokenExpiryTime(token: string): number
```

## Error Handling

### Error Handling Strategy

1. **Network Errors**: Display user-friendly message and retry option
2. **Validation Errors**: Map to specific form fields with inline error messages
3. **Authentication Errors**: Clear tokens and redirect to login
4. **Server Errors**: Display generic error message and log details

### Error Display Component

```typescript
interface ErrorDisplayProps {
  error: ApiError | null;
  fieldErrors?: Record<string, string[]>;
  onRetry?: () => void;
}
```

### Error Mapping Utility

```typescript
/**
 * Map API error response to form field errors
 */
export function mapApiErrorsToFields(
  apiError: ApiError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  if (apiError.details) {
    Object.entries(apiError.details).forEach(([field, messages]) => {
      fieldErrors[field] = messages[0]; // Take first error message
    });
  }
  
  return fieldErrors;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: ApiError): string {
  // Handle specific error codes
  if (error.code === 'EMAIL_NOT_VERIFIED') {
    return 'Please verify your email before logging in.';
  }
  
  // Return API message or generic fallback
  return error.message || 'An unexpected error occurred. Please try again.';
}
```

## Validation

### Form Validation Rules

#### Email Validation
```typescript
export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}
```

#### Password Validation
```typescript
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
```

#### Phone Validation
```typescript
export function validatePhone(phone: string): string | null {
  if (!phone) return null; // Phone is optional
  
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    return 'Please enter a valid phone number with country code';
  }
  
  return null;
}
```

#### OTP Validation
```typescript
export function validateOTP(otp: string): string | null {
  if (!otp) return 'Verification code is required';
  
  if (!/^\d{6}$/.test(otp)) {
    return 'Verification code must be 6 digits';
  }
  
  return null;
}
```

## Routing and Navigation

### Route Structure

```
/login                  - Login page (public)
/register              - Registration page (public)
/verify-email          - Email verification page (public)
/forgot-password       - Password reset request (future)
/reset-password        - Password reset form (future)
/dashboard             - Protected dashboard (requires auth)
```

### Route Protection

#### Protected Route Wrapper (`/components/auth/ProtectedRoute.tsx`)
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}
```

Features:
- Check authentication status
- Redirect unauthenticated users to login
- Show loading state during auth check
- Preserve intended destination for post-login redirect

### Navigation Flow

```
Registration Flow:
/register → /verify-email → /login → /dashboard

Login Flow:
/login → /dashboard

Logout Flow:
/dashboard → /login
```

## UI/UX Design

### Design Principles

1. **Consistency**: Match the landing page design system
2. **Clarity**: Clear labels, helpful error messages, obvious CTAs
3. **Feedback**: Loading states, success messages, error handling
4. **Accessibility**: Keyboard navigation, ARIA labels, focus management
5. **Responsiveness**: Mobile-first design, works on all screen sizes

### Color Scheme

```css
/* Primary Colors */
--primary: #3B82F6;      /* Blue for CTAs */
--primary-hover: #2563EB;
--primary-light: #DBEAFE;

/* Status Colors */
--success: #10B981;      /* Green for success states */
--error: #EF4444;        /* Red for errors */
--warning: #F59E0B;      /* Yellow for warnings */
--info: #3B82F6;         /* Blue for info */

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-600: #4B5563;
--gray-900: #111827;
```

### Typography

```css
/* Headings */
h1: text-4xl font-bold (36px)
h2: text-3xl font-bold (30px)
h3: text-2xl font-semibold (24px)

/* Body */
body: text-base (16px)
small: text-sm (14px)

/* Form Labels */
label: text-sm font-medium (14px)
```

### Spacing

```css
/* Form spacing */
--form-gap: 1.5rem (24px)
--input-padding: 0.75rem 1rem (12px 16px)
--button-padding: 0.75rem 1.5rem (12px 24px)
```

### Component Styling

#### Form Container
- Max width: 400px
- Centered on page
- White background with subtle shadow
- Rounded corners (8px)
- Padding: 2rem (32px)

#### Input Fields
- Full width
- Border: 1px solid gray-300
- Focus: Blue border with ring
- Error: Red border
- Height: 44px (touch-friendly)

#### Buttons
- Primary: Blue background, white text
- Full width on mobile
- Height: 44px
- Rounded corners (6px)
- Loading spinner when submitting

## Testing Strategy

### Unit Tests

1. **Validation Functions**
   - Test all validation rules
   - Test edge cases
   - Test error messages

2. **Token Utilities**
   - Test token storage/retrieval
   - Test token expiration checks
   - Test token decoding

3. **API Client Functions**
   - Mock API responses
   - Test error handling
   - Test request formatting

### Integration Tests

1. **Authentication Flow**
   - Complete registration flow
   - Email verification flow
   - Login flow
   - Token refresh flow

2. **Form Submissions**
   - Valid data submission
   - Invalid data handling
   - Network error handling

### E2E Tests (Future)

1. User can register and verify email
2. User can login and access dashboard
3. User session persists across page refresh
4. Token refresh works automatically

## Security Considerations

### Token Security

1. **Storage**: Use localStorage (acceptable for web apps)
2. **Transmission**: Always use HTTPS in production
3. **Expiration**: Respect token expiration times
4. **Refresh**: Implement automatic token refresh
5. **Logout**: Clear all tokens on logout

### Input Sanitization

1. Validate all inputs on frontend
2. Rely on backend for final validation
3. Prevent XSS with React's built-in escaping
4. Use TypeScript for type safety

### Password Handling

1. Never log passwords
2. Use password type inputs
3. Implement password strength indicator
4. Support password visibility toggle

## Performance Optimization

### Code Splitting

- Lazy load auth pages
- Separate auth bundle from main bundle
- Load form components on demand

### Caching

- Cache user data in context
- Minimize API calls
- Use React.memo for expensive components

### Bundle Size

- Use tree-shaking
- Import only needed icons
- Minimize dependencies

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
   - All interactive elements accessible via keyboard
   - Logical tab order
   - Visible focus indicators

2. **Screen Readers**
   - Proper ARIA labels
   - Form field associations
   - Error announcements

3. **Color Contrast**
   - Minimum 4.5:1 for text
   - Error states not relying solely on color

4. **Form Accessibility**
   - Labels for all inputs
   - Error messages associated with fields
   - Required field indicators

## Future Enhancements

1. **Two-Factor Authentication**
   - TOTP support
   - SMS verification
   - Backup codes

2. **Social Login**
   - Google OAuth
   - Microsoft OAuth
   - GitHub OAuth

3. **Password Reset**
   - Forgot password flow
   - Reset password with OTP
   - Password history

4. **Session Management**
   - Active sessions list
   - Remote logout
   - Session timeout warnings

5. **Account Security**
   - Login history
   - Security notifications
   - Suspicious activity detection

## Implementation Notes

### Development Environment Setup

```bash
# Environment variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### File Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── verify-email/
│       └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── VerifyEmailForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── ui/
│       ├── FormInput.tsx
│       ├── Button.tsx
│       ├── Alert.tsx
│       └── PasswordStrengthIndicator.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── auth-api.ts
│   ├── token-utils.ts
│   └── validation.ts
└── types/
    └── auth.ts
```

### Dependencies

No new dependencies required. Using existing:
- next (16.0.1)
- react (19.2.0)
- lucide-react (0.552.0)
- tailwindcss (4.1.16)

## Conclusion

This design provides a comprehensive, secure, and user-friendly authentication system that integrates seamlessly with the existing Field Pilot application architecture. The implementation follows Next.js best practices, maintains consistency with the landing page design, and provides a solid foundation for future authentication enhancements.
