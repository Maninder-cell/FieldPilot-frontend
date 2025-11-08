# Design Document

## Overview

This design document outlines the technical implementation for password management and user profile features in the Field Pilot application. The implementation builds upon the existing authentication infrastructure, reusing established patterns for API communication, form validation, error handling, and state management. The design follows Next.js 14 App Router conventions with React Server Components and Client Components, TypeScript for type safety, and Tailwind CSS for styling.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Forgot Password│  │ Reset Password │  │Change Password│ │
│  │     Page       │  │     Page       │  │     Page      │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │  View Profile  │  │  Edit Profile  │                    │
│  │     Page       │  │     Page       │                    │
│  └────────────────┘  └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Components                         │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ForgotPasswordForm│  │ ResetPasswordForm│                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ChangePasswordForm│  │   ProfileForm    │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Client Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              auth-api.ts (Extended)                   │  │
│  │  - forgotPassword()    - resetPassword()             │  │
│  │  - changePassword()    - getProfile()                │  │
│  │  - updateProfile()                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend REST API                            │
│  POST /api/auth/forgot-password/                            │
│  POST /api/auth/reset-password/                             │
│  POST /api/auth/change-password/                            │
│  GET  /api/auth/profile/                                    │
│  PUT  /api/auth/profile/update/                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App Router Pages
├── /forgot-password
│   └── ForgotPasswordForm (Client Component)
├── /reset-password
│   └── ResetPasswordForm (Client Component)
├── /settings/change-password
│   └── ChangePasswordForm (Client Component)
├── /profile
│   └── ProfileView (Client Component)
└── /profile/edit
    └── ProfileForm (Client Component)
```

## Components and Interfaces

### 1. Password Management Components

#### ForgotPasswordForm Component

**Purpose:** Allow users to request a password reset OTP via email

**Props:**
```typescript
interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
}
```

**State:**
- `email: string` - User's email address
- `isSubmitting: boolean` - Form submission state
- `apiError: string | null` - General API error message
- `successMessage: string | null` - Success feedback message
- `errors: Record<string, string>` - Field-specific validation errors
- `touched: Record<string, boolean>` - Track which fields have been touched

**Key Features:**
- Email validation
- API error handling
- Success message display
- Automatic redirect to reset password page on success

---

#### ResetPasswordForm Component

**Purpose:** Allow users to reset their password using an OTP code

**Props:**
```typescript
interface ResetPasswordFormProps {
  email?: string;
  onSuccess?: () => void;
}
```

**State:**
- `email: string` - User's email address (pre-filled if provided)
- `otpCode: string` - 6-digit OTP code
- `newPassword: string` - New password
- `newPasswordConfirm: string` - Password confirmation
- `isSubmitting: boolean` - Form submission state
- `isResending: boolean` - Resend OTP state
- `resendCooldown: number` - Cooldown timer for resend button
- `apiError: string | null` - General API error message
- `successMessage: string | null` - Success feedback message
- `errors: Record<string, string>` - Field-specific validation errors
- `touched: Record<string, boolean>` - Track which fields have been touched

**Key Features:**
- Email, OTP, and password validation
- Password strength indicator
- Resend OTP functionality with cooldown
- Success message with auto-redirect to login

---

#### ChangePasswordForm Component

**Purpose:** Allow authenticated users to change their current password

**Props:**
```typescript
interface ChangePasswordFormProps {
  onSuccess?: () => void;
}
```

**State:**
- `currentPassword: string` - Current password
- `newPassword: string` - New password
- `newPasswordConfirm: string` - Password confirmation
- `isSubmitting: boolean` - Form submission state
- `apiError: string | null` - General API error message
- `successMessage: string | null` - Success feedback message
- `errors: Record<string, string>` - Field-specific validation errors
- `touched: Record<string, boolean>` - Track which fields have been touched

**Key Features:**
- Current password verification
- New password validation with strength indicator
- Password confirmation matching
- Success feedback
- Requires authentication (protected route)

---

### 2. Profile Management Components

#### ProfileView Component

**Purpose:** Display user's detailed profile information

**Props:**
```typescript
interface ProfileViewProps {
  onEdit?: () => void;
}
```

**State:**
- `profile: UserProfile | null` - User profile data
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message

**Key Features:**
- Fetch and display profile data
- Loading state indicator
- Error handling with retry option
- Edit button to navigate to edit mode
- Organized sections for different profile categories

---

#### ProfileForm Component

**Purpose:** Allow users to edit their profile information

**Props:**
```typescript
interface ProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

**State:**
- `formData: UserProfileFormData` - All editable profile fields
- `originalData: UserProfile | null` - Original profile data for comparison
- `isSubmitting: boolean` - Form submission state
- `isLoading: boolean` - Initial data loading state
- `apiError: string | null` - General API error message
- `successMessage: string | null` - Success feedback message
- `errors: Record<string, string>` - Field-specific validation errors
- `touched: Record<string, boolean>` - Track which fields have been touched

**Key Features:**
- Load existing profile data
- Multi-section form (Personal Info, Contact, Emergency Contact, Professional, Preferences)
- Skills and certifications management (tag input)
- Notification preferences toggles
- Form validation
- Only send changed fields to API
- Cancel functionality to revert changes

---

## Data Models

### Extended Type Definitions

```typescript
// Add to src/types/auth.ts

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
  skills: string[];
  certifications: string[];
  timezone: string;
  language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}
```

---

## API Client Extensions

### New API Functions (add to src/lib/auth-api.ts)

```typescript
/**
 * Request password reset OTP
 * POST /api/auth/forgot-password/
 */
export async function forgotPassword(email: string): Promise<void> {
  await fetchAuthAPI<ApiResponse<void>>('/auth/forgot-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
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
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  return response.data;
}
```

---

## Validation Extensions

### New Validation Functions (add to src/lib/validation.ts)

```typescript
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
```

---

## Routing Structure

### New Routes

```
/forgot-password
  - Public route
  - ForgotPasswordForm component
  - Redirects to /reset-password on success

/reset-password
  - Public route
  - ResetPasswordForm component
  - Accepts email query parameter
  - Redirects to /login on success

/settings/change-password
  - Protected route (requires authentication)
  - ChangePasswordForm component
  - Shows success message on completion

/profile
  - Protected route (requires authentication)
  - ProfileView component
  - Displays user profile information
  - Edit button navigates to /profile/edit

/profile/edit
  - Protected route (requires authentication)
  - ProfileForm component
  - Redirects to /profile on success or cancel
```

### Route Protection

Use Next.js middleware or layout-level authentication checks:

```typescript
// Example middleware pattern
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  // Protected routes
  const protectedPaths = ['/profile', '/settings'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

---

## UI Components

### Reusable Components

All forms will reuse existing UI components:

1. **FormInput** - Text, email, password, tel, date inputs
2. **Button** - Primary, secondary, outline variants with loading states
3. **Alert** - Success, error, info, warning messages
4. **PasswordStrengthIndicator** - Visual password strength feedback
5. **TagInput** (New) - For skills and certifications management
6. **Toggle** (New) - For notification preferences

### New UI Components to Create

#### TagInput Component

```typescript
interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}
```

**Features:**
- Add tags by typing and pressing Enter or comma
- Remove tags by clicking X icon
- Display tags as chips/badges
- Validation for duplicate tags
- Maximum tag length validation

---

#### Toggle Component

```typescript
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}
```

**Features:**
- Accessible switch component
- Visual on/off states
- Optional description text
- Keyboard navigation support

---

## Error Handling

### Error Handling Strategy

1. **Field-Level Errors**
   - Display validation errors below each field
   - Show errors only after field is touched or form submission
   - Clear errors when user starts typing

2. **Form-Level Errors**
   - Display API errors in Alert component at top of form
   - Map backend validation errors to specific fields when possible
   - Show generic error message for non-field errors

3. **Network Errors**
   - Catch network failures and display user-friendly message
   - Provide retry option for failed requests
   - Handle timeout scenarios

4. **Authentication Errors**
   - Redirect to login if access token is invalid
   - Show appropriate message for expired sessions
   - Handle 401/403 responses consistently

### Error Message Mapping

```typescript
// Extend getErrorMessage in validation.ts
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
```

---

## State Management

### Form State Pattern

All forms follow a consistent state management pattern:

```typescript
const [formData, setFormData] = useState<FormDataType>(initialState);
const [errors, setErrors] = useState<Record<string, string>>({});
const [touched, setTouched] = useState<Record<string, boolean>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);
const [successMessage, setSuccessMessage] = useState<string | null>(null);
```

### Profile State Management

Profile data is fetched on component mount and stored in local state. Changes are tracked by comparing with original data to send only modified fields to the API.

```typescript
const [profile, setProfile] = useState<UserProfile | null>(null);
const [originalData, setOriginalData] = useState<UserProfile | null>(null);
const [formData, setFormData] = useState<UserProfileFormData>(initialFormData);

// Track changes
const hasChanges = useMemo(() => {
  return JSON.stringify(formData) !== JSON.stringify(originalData);
}, [formData, originalData]);

// Get only changed fields
const getChangedFields = (): Partial<UserProfileFormData> => {
  const changes: Partial<UserProfileFormData> = {};
  Object.keys(formData).forEach(key => {
    if (formData[key] !== originalData?.[key]) {
      changes[key] = formData[key];
    }
  });
  return changes;
};
```

---

## Testing Strategy

### Unit Tests

1. **Validation Functions**
   - Test all validation rules
   - Test edge cases (empty, invalid formats, boundary values)
   - Test error message generation

2. **API Client Functions**
   - Mock fetch calls
   - Test success responses
   - Test error handling
   - Test request payload formatting

### Component Tests

1. **Form Components**
   - Test form rendering
   - Test field validation on blur
   - Test form submission
   - Test error display
   - Test success states
   - Test loading states

2. **Profile Components**
   - Test data fetching and display
   - Test edit mode toggle
   - Test form submission with changed fields
   - Test cancel functionality

### Integration Tests

1. **Password Reset Flow**
   - Test complete forgot password → reset password flow
   - Test OTP resend functionality
   - Test error scenarios

2. **Profile Management Flow**
   - Test view → edit → save flow
   - Test cancel without saving
   - Test validation across all fields

---

## Security Considerations

1. **Password Security**
   - Enforce strong password requirements
   - Never log or display passwords
   - Clear password fields on error
   - Use password type inputs with toggle visibility

2. **Authentication**
   - Verify access token for all protected routes
   - Handle token expiration gracefully
   - Redirect to login on authentication failure
   - Include Authorization header for authenticated requests

3. **Data Privacy**
   - Only send changed fields in profile updates
   - Validate all user inputs
   - Sanitize data before display
   - Handle PII (Personally Identifiable Information) appropriately

4. **API Security**
   - Use HTTPS in production
   - Implement CSRF protection
   - Rate limit password reset requests
   - Validate OTP codes server-side

---

## Performance Considerations

1. **Code Splitting**
   - Use dynamic imports for profile edit page
   - Lazy load TagInput component
   - Split password management routes

2. **Data Fetching**
   - Cache profile data in component state
   - Implement loading states
   - Handle stale data scenarios

3. **Form Optimization**
   - Debounce validation on input
   - Memoize expensive computations
   - Optimize re-renders with React.memo

4. **Bundle Size**
   - Reuse existing components
   - Minimize new dependencies
   - Tree-shake unused code

---

## Accessibility

1. **Keyboard Navigation**
   - All interactive elements keyboard accessible
   - Proper tab order
   - Focus management on errors

2. **Screen Readers**
   - Proper ARIA labels
   - Error announcements
   - Form field descriptions

3. **Visual Accessibility**
   - Sufficient color contrast
   - Clear error indicators
   - Loading state announcements

4. **Form Accessibility**
   - Associate labels with inputs
   - Provide helpful error messages
   - Mark required fields clearly

---

## Implementation Notes

1. **Consistency**
   - Follow existing authentication patterns
   - Reuse validation utilities
   - Maintain consistent error handling
   - Use established UI components

2. **Code Organization**
   - Keep components focused and single-purpose
   - Extract reusable logic into hooks
   - Maintain clear separation of concerns
   - Follow Next.js App Router conventions

3. **Documentation**
   - Add JSDoc comments to API functions
   - Document component props with TypeScript
   - Include usage examples in comments
   - Update README with new features

4. **Testing**
   - Write tests alongside implementation
   - Maintain high test coverage
   - Test error scenarios thoroughly
   - Include accessibility tests
