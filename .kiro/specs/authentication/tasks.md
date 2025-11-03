# Implementation Plan

- [x] 1. Set up core authentication infrastructure
  - Create TypeScript type definitions for authentication data models
  - Implement token storage and retrieval utilities in localStorage
  - Create base authentication API client with error handling
  - _Requirements: 1.2, 3.2, 4.1_

- [x] 1.1 Create authentication type definitions
  - Write TypeScript interfaces in `src/types/auth.ts` for User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, VerifyEmailRequest, ApiError, and ApiResponse types
  - Ensure types match the backend API specification from BACKEND_API_REFERENCE.md
  - _Requirements: 1.2, 3.2_

- [x] 1.2 Implement token management utilities
  - Create `src/lib/token-utils.ts` with functions for storing, retrieving, and clearing tokens from localStorage
  - Implement JWT token decoding to extract expiration time
  - Add function to check if token is expired or about to expire
  - _Requirements: 3.3, 4.1, 4.2_

- [x] 1.3 Create authentication API client
  - Implement `src/lib/auth-api.ts` with functions for register, login, verifyEmail, resendOTP, refreshAccessToken, and logoutUser
  - Add error handling and response mapping for all API calls
  - Integrate with existing fetchAPI utility pattern from `src/lib/api.ts`
  - _Requirements: 1.2, 2.3, 3.2, 4.3_

- [x] 2. Build authentication context and state management
  - Create AuthContext with user state and authentication methods
  - Implement automatic token refresh mechanism
  - Add authentication state persistence across page reloads
  - _Requirements: 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

- [x] 2.1 Create AuthContext and AuthProvider
  - Implement `src/contexts/AuthContext.tsx` with user state, isAuthenticated flag, and isLoading state
  - Create context methods for login, logout, register, and verifyEmail
  - Add useAuth custom hook for consuming the context
  - _Requirements: 3.3, 3.4_

- [x] 2.2 Implement token refresh logic
  - Add automatic token refresh when access token is about to expire
  - Set up interval to check token expiration every minute
  - Handle refresh token failure by clearing auth state and redirecting to login
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 2.3 Add authentication persistence
  - Load user data and tokens from localStorage on app initialization
  - Validate stored tokens on mount
  - Restore authenticated state if valid tokens exist
  - _Requirements: 4.1, 4.2_

- [x] 3. Create reusable UI components
  - Build form input component with validation display
  - Create button component with loading states
  - Implement alert component for success/error messages
  - Add password strength indicator component
  - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2, 8.1, 8.2_

- [x] 3.1 Build FormInput component
  - Create `src/components/ui/FormInput.tsx` with label, input field, and error message display
  - Add support for different input types (text, email, password, tel)
  - Implement error state styling with red border
  - Add proper accessibility attributes (aria-labels, aria-invalid)
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3.2 Create Button component
  - Implement `src/components/ui/Button.tsx` with variants (primary, secondary, outline)
  - Add loading state with spinner icon from lucide-react
  - Implement disabled state styling
  - Support fullWidth prop for responsive layouts
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3.3 Build Alert component
  - Create `src/components/ui/Alert.tsx` for displaying success, error, warning, and info messages
  - Add appropriate icons and colors for each alert type
  - Implement optional close button
  - _Requirements: 1.3, 2.4, 3.5_

- [x] 3.4 Create PasswordStrengthIndicator component
  - Implement `src/components/ui/PasswordStrengthIndicator.tsx` to show password strength
  - Calculate strength based on length, character variety, and complexity
  - Display visual indicator with color-coded bars (red/yellow/green)
  - Show strength label (Weak/Medium/Strong)
  - _Requirements: 1.5_

- [x] 4. Implement form validation utilities
  - Create validation functions for email, password, phone, and OTP
  - Add password strength calculation
  - Implement error message generation
  - _Requirements: 1.5, 5.1, 5.2, 5.4_

- [x] 4.1 Create validation utility functions
  - Implement `src/lib/validation.ts` with validateEmail, validatePassword, validatePhone, and validateOTP functions
  - Add getPasswordStrength function that returns score, label, and color
  - Create mapApiErrorsToFields utility to map backend errors to form fields
  - _Requirements: 1.5, 5.1, 5.2, 5.4_

- [x] 5. Build registration form and page
  - Create registration form component with all required fields
  - Implement client-side validation with real-time feedback
  - Add registration page with form and navigation links
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 6.2, 7.1, 7.2, 7.5, 8.1, 8.2_

- [x] 5.1 Create RegisterForm component
  - Implement `src/components/auth/RegisterForm.tsx` with fields for email, password, password_confirm, first_name, last_name, and phone
  - Add real-time validation on blur for each field
  - Integrate password strength indicator
  - Implement password visibility toggle with eye icon
  - Add form submission with loading state
  - _Requirements: 1.1, 1.5, 5.1, 5.2, 5.3, 7.1, 7.2, 7.5, 8.1, 8.2_

- [x] 5.2 Create registration page
  - Implement `src/app/register/page.tsx` with RegisterForm component
  - Add page title and description
  - Include link to login page for existing users
  - Handle successful registration by redirecting to verify-email page with email parameter
  - Display API errors using Alert component
  - _Requirements: 1.1, 1.3, 1.4, 6.2_

- [x] 6. Build email verification form and page
  - Create email verification form with OTP input
  - Add resend OTP functionality with cooldown timer
  - Implement verification page with success redirect
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.4, 7.1, 7.2_

- [x] 6.1 Create VerifyEmailForm component
  - Implement `src/components/auth/VerifyEmailForm.tsx` with email and OTP code fields
  - Pre-fill email field if passed as prop
  - Add 6-digit OTP input with auto-focus
  - Implement resend OTP button with 60-second cooldown timer
  - Add form submission with loading state
  - _Requirements: 2.1, 2.2, 2.5, 7.1, 7.2_

- [x] 6.2 Create email verification page
  - Implement `src/app/verify-email/page.tsx` with VerifyEmailForm component
  - Read email from URL query parameters if available
  - Display success message on successful verification
  - Auto-redirect to login page after 2 seconds on success
  - Show resend OTP link prominently
  - _Requirements: 2.1, 2.3, 2.4, 6.4_

- [x] 7. Build login form and page
  - Create login form with email and password fields
  - Add remember me checkbox
  - Implement login page with navigation links
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 6.1, 6.5, 7.1, 7.2, 7.5, 8.1, 8.2_

- [x] 7.1 Create LoginForm component
  - Implement `src/components/auth/LoginForm.tsx` with email and password fields
  - Add remember me checkbox
  - Implement password visibility toggle
  - Add form validation on submit
  - Handle login submission with loading state
  - Display authentication errors (invalid credentials, email not verified)
  - _Requirements: 3.1, 3.5, 5.1, 5.2, 5.3, 7.1, 7.2, 7.5, 8.1, 8.2_

- [x] 7.2 Create login page
  - Implement `src/app/login/page.tsx` with LoginForm component
  - Add page title and description
  - Include link to registration page for new users
  - Add "Forgot Password" link (placeholder for future implementation)
  - Redirect authenticated users to dashboard
  - Handle successful login by redirecting to dashboard or intended destination
  - _Requirements: 3.1, 3.4, 6.1, 6.5_

- [x] 8. Implement protected route wrapper
  - Create ProtectedRoute component for authentication checks
  - Add loading state during authentication verification
  - Implement redirect logic for unauthenticated users
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 8.1 Create ProtectedRoute component
  - Implement `src/components/auth/ProtectedRoute.tsx` that checks authentication state
  - Show loading spinner while checking authentication
  - Redirect to login page if user is not authenticated
  - Preserve intended destination URL for post-login redirect
  - Allow children to render if user is authenticated
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 9. Integrate authentication with app layout
  - Wrap app with AuthProvider in root layout
  - Update header navigation to show login/register or user menu based on auth state
  - Add logout functionality to user menu
  - _Requirements: 3.4, 4.1, 6.1_

- [x] 9.1 Add AuthProvider to root layout
  - Update `src/app/layout.tsx` to wrap children with AuthProvider
  - Ensure AuthContext is available throughout the app
  - _Requirements: 4.1_

- [x] 9.2 Update Header component with auth state
  - Modify `src/components/landing/Header.tsx` to use useAuth hook
  - Show "Login" and "Sign Up" buttons when user is not authenticated
  - Show user menu with logout option when user is authenticated
  - Implement logout functionality that calls auth context logout method
  - _Requirements: 3.4, 6.1_

- [x] 10. Create placeholder dashboard page
  - Build basic dashboard page to redirect after login
  - Wrap with ProtectedRoute component
  - Display welcome message with user's name
  - _Requirements: 3.4_

- [x] 10.1 Create dashboard page
  - Implement `src/app/dashboard/page.tsx` as a protected route
  - Display welcome message with authenticated user's name
  - Add placeholder content for future dashboard features
  - Include logout button for testing
  - _Requirements: 3.4_

- [x] 11. Add error boundary and loading states
  - Implement error boundary for authentication errors
  - Add loading states for all async operations
  - Create skeleton loaders for forms during initialization
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 11.1 Add loading states to authentication flows
  - Ensure all forms show loading spinners during API calls
  - Disable form inputs while submitting
  - Add skeleton loaders for initial auth state check
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12. Polish UI and responsive design
  - Ensure all auth pages are mobile-responsive
  - Add proper spacing and alignment
  - Implement focus states and keyboard navigation
  - Test accessibility with screen readers
  - _Requirements: 5.1, 5.2, 5.3, 6.3, 8.3, 8.4, 8.5_

- [ ] 12.1 Implement responsive design for auth pages
  - Test all auth pages on mobile, tablet, and desktop viewports
  - Ensure forms are centered and properly sized on all devices
  - Add proper touch targets for mobile (minimum 44px)
  - _Requirements: 6.3_

- [x] 12.2 Add accessibility features
  - Ensure all form inputs have associated labels
  - Add ARIA attributes for error messages and loading states
  - Implement keyboard navigation for all interactive elements
  - Test with keyboard-only navigation
  - Add focus visible indicators
  - _Requirements: 5.1, 5.2, 8.3, 8.4, 8.5_

- [ ] 13. Test authentication flows end-to-end
  - Test complete registration → verification → login flow
  - Verify token refresh works correctly
  - Test error handling for all failure scenarios
  - Verify session persistence across page reloads
  - _Requirements: All requirements_

- [x] 13.1 Manual testing of authentication flows
  - Test user registration with valid and invalid data
  - Test email verification with valid and expired OTP codes
  - Test login with valid credentials, invalid credentials, and unverified email
  - Test token refresh by waiting for token expiration
  - Test logout functionality
  - Test session persistence by refreshing pages
  - Test protected route access when authenticated and unauthenticated
  - _Requirements: All requirements_
