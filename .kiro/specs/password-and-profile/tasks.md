# Implementation Plan

- [x] 1. Extend type definitions and API client
  - Add new TypeScript interfaces for password management and profile features to `src/types/auth.ts`
  - Implement API client functions in `src/lib/auth-api.ts` for forgot password, reset password, change password, get profile, and update profile
  - _Requirements: 1.3, 2.2, 3.3, 4.3, 6.2, 7.3_

- [x] 2. Extend validation utilities
  - Add validation functions for date of birth, zip code, emergency contact phone, current password, and new password to `src/lib/validation.ts`
  - Implement password error message mapping function
  - _Requirements: 5.1, 5.3, 11.1, 11.3_

- [x] 3. Create new UI components
  - [x] 3.1 Implement TagInput component for skills and certifications management
    - Create `src/components/ui/TagInput.tsx` with add/remove tag functionality
    - Support keyboard input (Enter, comma) and click to remove
    - Include validation for duplicate tags
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 3.2 Implement Toggle component for notification preferences
    - Create `src/components/ui/Toggle.tsx` with accessible switch functionality
    - Support keyboard navigation and visual on/off states
    - Include optional description text
    - _Requirements: 8.1, 8.2_

- [x] 4. Implement Forgot Password feature
  - [x] 4.1 Create ForgotPasswordForm component
    - Create `src/components/auth/ForgotPasswordForm.tsx` with email field
    - Implement form validation and submission logic
    - Add success message display and error handling
    - _Requirements: 1.2, 1.3, 1.4, 11.1-11.5, 12.1-12.5_
  
  - [x] 4.2 Create forgot password page
    - Create `src/app/forgot-password/page.tsx` with ForgotPasswordForm
    - Add navigation link from login page
    - Implement redirect to reset password page on success
    - _Requirements: 1.1, 1.5_

- [x] 5. Implement Reset Password feature
  - [x] 5.1 Create ResetPasswordForm component
    - Create `src/components/auth/ResetPasswordForm.tsx` with email, OTP, and password fields
    - Implement form validation with password strength indicator
    - Add resend OTP functionality with 60-second cooldown
    - Include success message and error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 5.1-5.5, 11.1-11.5, 12.1-12.5_
  
  - [x] 5.2 Create reset password page
    - Create `src/app/reset-password/page.tsx` with ResetPasswordForm
    - Accept email query parameter for pre-filling
    - Implement redirect to login page on success
    - _Requirements: 2.4_

- [x] 6. Implement Change Password feature
  - [x] 6.1 Create ChangePasswordForm component
    - Create `src/components/auth/ChangePasswordForm.tsx` with current password, new password, and confirmation fields
    - Implement form validation with password strength indicator
    - Add authentication check and access token handling
    - Include success message and error handling
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.1-5.5, 11.1-11.5, 12.1-12.5_
  
  - [x] 6.2 Create change password page
    - Create `src/app/settings/change-password/page.tsx` with ChangePasswordForm
    - Implement route protection for authenticated users only
    - Add navigation from settings or profile page
    - _Requirements: 4.1_

- [x] 7. Implement Profile View feature
  - [x] 7.1 Create ProfileView component
    - Create `src/components/profile/ProfileView.tsx` to display profile data
    - Implement data fetching with loading state
    - Organize profile information into sections (Personal, Contact, Emergency, Professional, Preferences)
    - Add Edit Profile button
    - Include error handling with retry option
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 7.2 Create profile view page
    - Create `src/app/profile/page.tsx` with ProfileView component
    - Implement route protection for authenticated users only
    - Add navigation from main menu or user dropdown
    - _Requirements: 6.1_

- [x] 8. Implement Profile Edit feature
  - [x] 8.1 Create ProfileForm component
    - Create `src/components/profile/ProfileForm.tsx` with all editable profile fields
    - Implement multi-section form layout (Personal Info, Contact, Emergency Contact, Professional, Preferences)
    - Add TagInput for skills and certifications
    - Add Toggle components for notification preferences
    - Implement form validation for all fields
    - Track changed fields and send only modifications to API
    - Include Cancel and Save buttons
    - Add success message and error handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1-8.5, 9.1-9.5, 10.1-10.5, 11.1-11.5, 12.1-12.5_
  
  - [x] 8.2 Create profile edit page
    - Create `src/app/profile/edit/page.tsx` with ProfileForm component
    - Implement route protection for authenticated users only
    - Handle navigation from profile view page
    - Implement redirect to profile view on success or cancel
    - _Requirements: 7.1_

- [x] 9. Update navigation and routing
  - Add "Forgot Password" link to login page
  - Add "Change Password" option to settings menu
  - Add "Profile" link to main navigation or user dropdown
  - Ensure all protected routes check authentication status
  - _Requirements: 1.1, 4.1, 6.1_

- [x] 10. Integration and polish
  - [x] 10.1 Test complete password reset flow
    - Test forgot password → reset password → login flow
    - Verify OTP resend functionality works correctly
    - Test error scenarios (invalid OTP, expired OTP, weak password)
    - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.4_
  
  - [x] 10.2 Test change password functionality
    - Test change password with correct current password
    - Test error handling for incorrect current password
    - Verify password strength validation
    - _Requirements: 4.1-4.5, 5.1-5.5_
  
  - [x] 10.3 Test profile management flow
    - Test profile view data loading and display
    - Test profile edit with various field combinations
    - Verify only changed fields are sent to API
    - Test skills and certifications management
    - Test notification preferences toggles
    - Test cancel functionality
    - _Requirements: 6.1-6.5, 7.1-7.5, 8.1-8.5, 9.1-9.5, 10.1-10.5_
  
  - [x] 10.4 Verify form validation across all forms
    - Test real-time validation on blur
    - Test form submission with invalid data
    - Test API error mapping to form fields
    - Verify error messages are clear and helpful
    - _Requirements: 11.1-11.5_
  
  - [x] 10.5 Verify loading states and user feedback
    - Test loading indicators on all forms
    - Test button disabled states during submission
    - Test success messages display correctly
    - Test error messages display correctly
    - _Requirements: 12.1-12.5_
