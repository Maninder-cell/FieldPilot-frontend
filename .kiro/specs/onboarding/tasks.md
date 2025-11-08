# Implementation Plan

- [x] 1. Set up type definitions and API client
- [x] 1.1 Create onboarding type definitions
  - Create `src/types/onboarding.ts` with all interfaces: Tenant, CreateCompanyRequest, UpdateCompanyRequest, CompleteStepRequest, TenantMember, InviteMemberRequest, Invitation, InvitationCheckResponse, OnboardingApiResponse, OnboardingApiError
  - Define company size options as constants
  - Define role types and permissions
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 7.1_

- [x] 1.2 Implement onboarding API client
  - Create `src/lib/onboarding-api.ts` following the pattern from `auth-api.ts`
  - Implement `fetchOnboardingAPI` wrapper with error handling and token injection
  - Implement company management functions: `createCompany`, `getCurrentTenant`, `updateTenant`
  - Implement onboarding process function: `completeOnboardingStep`
  - Implement team management functions: `getTenantMembers`, `inviteMember`
  - Implement invitation functions: `getPendingInvitations`, `checkInvitations`, `acceptInvitation`
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 4.1, 5.1, 5.2, 6.1, 7.1, 7.2, 8.1, 11.1_

- [x] 2. Create OnboardingContext for state management
- [x] 2.1 Implement OnboardingContext with state and methods
  - Create `src/contexts/OnboardingContext.tsx` following the pattern from `AuthContext.tsx`
  - Define OnboardingContextType interface with state and methods
  - Implement state management for tenant, members, invitations, loading, and current step
  - Implement company management methods: `createCompany`, `updateCompany`, `refreshTenant`
  - Implement onboarding process methods: `completeStep`, `goToStep`
  - Implement team management methods: `loadMembers`, `inviteTeamMember`, `loadPendingInvitations`
  - Implement invitation methods: `checkUserInvitations`, `acceptInvite`
  - Add automatic tenant loading on authentication
  - Add error handling for all operations
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 5.1, 5.2, 6.1, 7.1, 7.2, 11.1, 11.2, 12.1_

- [x] 2.2 Add OnboardingProvider to app layout
  - Update `src/app/layout.tsx` to wrap children with OnboardingProvider
  - Ensure OnboardingProvider is nested inside AuthProvider
  - _Requirements: 1.1, 2.1_

- [x] 3. Build shared UI components
- [x] 3.1 Create StepIndicator component
  - Create `src/components/onboarding/StepIndicator.tsx`
  - Display visual progress for 5 onboarding steps
  - Show completed, current, and upcoming steps with appropriate styling
  - Make responsive for mobile and desktop
  - _Requirements: 3.1, 3.2_

- [x] 3.2 Create RoleBadge component
  - Create `src/components/onboarding/RoleBadge.tsx`
  - Display role with color-coded styling (owner: purple, admin: blue, manager: green, member: gray)
  - Show role icon and label
  - _Requirements: 4.1, 5.1, 10.1, 10.2_

- [x] 3.3 Create TrialStatusBadge component
  - Create `src/components/onboarding/TrialStatusBadge.tsx`
  - Display trial active/expired status
  - Show days remaining when active
  - Use appropriate colors (green for active, red for expired)
  - _Requirements: 2.1, 9.1, 9.2_

- [x] 4. Implement Step 1: Company Info Form
- [x] 4.1 Create CompanyInfoForm component
  - Create `src/components/onboarding/CompanyInfoForm.tsx`
  - Build form with fields: name (required), company_email (required), company_phone, company_size, industry, website, address, city, state, zip_code, country
  - Implement form validation using existing validation patterns
  - Add company size dropdown with predefined options
  - Add industry dropdown or text input
  - Use existing FormInput component for consistency
  - Call `createCompany()` from OnboardingContext on submission
  - Show loading state during submission
  - Display validation errors inline
  - Automatically advance to step 2 on success
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 11.1, 12.2, 12.3_

- [x] 5. Implement Step 2: Plan Selection Form
- [x] 5.1 Create PlanSelectionForm component
  - Create `src/components/onboarding/PlanSelectionForm.tsx`
  - Fetch and display subscription plans using existing `getSubscriptionPlans()` from `api.ts`
  - Add monthly/yearly billing toggle
  - Display plan cards with features, pricing, and limits
  - Highlight recommended plan
  - Store selected plan_id in step data
  - Call `completeStep(2, { plan_id, billing_cycle })` on plan selection
  - Show loading state while fetching plans
  - Handle plan fetch errors gracefully
  - _Requirements: 3.1, 3.2, 3.4, 11.1_

- [x] 6. Implement Step 3: Payment Setup Form
- [x] 6.1 Create PaymentSetupForm component
  - Create `src/components/onboarding/PaymentSetupForm.tsx`
  - Integrate Stripe Elements for card collection
  - Create setup intent via billing API
  - Handle card validation and errors
  - Create subscription after successful card setup
  - Call `completeStep(3, { subscription_id })` on success
  - Show loading states during payment processing
  - Display clear error messages for payment failures
  - Add skip option for trial users
  - _Requirements: 3.1, 3.2, 3.4, 11.1, 11.4_

- [x] 7. Implement Step 4: Team Invitation Form
- [x] 7.1 Create TeamInvitationForm component
  - Create `src/components/onboarding/TeamInvitationForm.tsx`
  - Build form to invite team members with fields: email (required), role (required), first_name, last_name
  - Add role selector with descriptions for each role
  - Allow adding multiple invitations before submitting
  - Display list of pending invitations to be sent
  - Call `inviteTeamMember()` for each invitation
  - Show success/error feedback for each invitation
  - Provide skip option to complete step without inviting
  - Call `completeStep(4)` when user proceeds
  - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3, 5.4, 5.5, 11.1_

- [x] 8. Implement Step 5: Onboarding Complete
- [x] 8.1 Create OnboardingComplete component
  - Create `src/components/onboarding/OnboardingComplete.tsx`
  - Display success message and congratulations
  - Show tenant access URL and subdomain
  - Display next steps and getting started tips
  - Provide button to access tenant workspace
  - Call `completeStep(5)` to finalize onboarding
  - Show confetti or celebration animation
  - _Requirements: 3.1, 3.2, 13.4, 14.1, 14.2, 14.4_

- [x] 9. Create main OnboardingWizard container
- [x] 9.1 Implement OnboardingWizard component
  - Create `src/components/onboarding/OnboardingWizard.tsx`
  - Render StepIndicator at the top
  - Conditionally render step components based on currentStep from context
  - Add navigation buttons (back/next) where appropriate
  - Handle step transitions
  - Show loading state while tenant data loads
  - Redirect to dashboard if onboarding is already completed
  - _Requirements: 3.1, 3.2, 3.3, 13.1, 13.2, 13.3, 13.5_

- [x] 9.2 Create onboarding start page
  - Create `src/app/onboarding/start/page.tsx`
  - Render OnboardingWizard component
  - Add ProtectedRoute wrapper to require authentication
  - Check if user already has a company and redirect appropriately
  - _Requirements: 1.1, 3.1, 13.1_

- [x] 10. Implement company management components
- [x] 10.1 Create CompanyInfoView component
  - Create `src/components/onboarding/CompanyInfoView.tsx`
  - Display current company information in read-only format
  - Show trial status badge with days remaining
  - Display member count
  - Show subdomain and access URL
  - Add edit button (visible only to owner/admin)
  - _Requirements: 2.1, 2.2, 9.1, 9.2, 10.1, 10.2, 14.1, 14.2, 15.1_

- [x] 10.2 Create CompanyInfoEditForm component
  - Create `src/components/onboarding/CompanyInfoEditForm.tsx`
  - Build editable form with all company fields
  - Pre-populate with current company data
  - Implement validation
  - Call `updateCompany()` on save
  - Show success/error feedback
  - Return to view mode on successful save
  - Add cancel button to discard changes
  - _Requirements: 2.1, 2.2, 2.3, 11.1, 12.4_

- [x] 10.3 Create company settings page
  - Create `src/app/company/settings/page.tsx`
  - Render CompanyInfoView by default
  - Toggle to CompanyInfoEditForm when edit is clicked
  - Add ProtectedRoute wrapper
  - Check user role and show permission error if not owner/admin
  - _Requirements: 2.1, 2.2, 2.3, 10.2, 10.3_

- [ ] 11. Implement team management components
- [x] 11.1 Create MemberList component
  - Create `src/components/onboarding/MemberList.tsx`
  - Display table/grid of all tenant members
  - Show user details: avatar, name, email, role, department, job_title, joined_at
  - Display RoleBadge for each member
  - Add invite button at the top (visible only to owner/admin)
  - Show loading state while fetching members
  - Handle empty state when no members exist
  - Make responsive for mobile
  - _Requirements: 4.1, 4.2, 10.1, 10.2, 15.1, 15.4_

- [x] 11.2 Create InviteMemberForm component
  - Create `src/components/onboarding/InviteMemberForm.tsx`
  - Build modal/drawer form with fields: email, role, first_name, last_name
  - Add role selector with descriptions
  - Implement email validation
  - Call `inviteTeamMember()` on submit
  - Show success message with appropriate text for existing vs new users
  - Display error messages for duplicate invitations or existing members
  - Close modal on success
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.2, 10.3, 11.1_

- [x] 11.3 Create PendingInvitationsList component
  - Create `src/components/onboarding/PendingInvitationsList.tsx`
  - Display table of pending invitations
  - Show email, role, invited_by, created_at, expires_at
  - Calculate and display time until expiration
  - Add resend button for each invitation (future enhancement placeholder)
  - Show empty state when no pending invitations
  - _Requirements: 6.1, 6.2, 6.3, 10.2_

- [x] 11.4 Create team management page
  - Create `src/app/company/team/page.tsx`
  - Render MemberList component
  - Render PendingInvitationsList component (for owner/admin only)
  - Add ProtectedRoute wrapper
  - Load members and invitations on mount
  - _Requirements: 4.1, 5.1, 6.1, 10.1, 10.2_

- [x] 12. Implement invitation acceptance components
- [x] 12.1 Create InvitationAcceptance component
  - Create `src/components/onboarding/InvitationAcceptance.tsx`
  - Display list of pending invitations for current user
  - Show tenant_name, role, invited_by, expires_at for each invitation
  - Add accept and decline buttons for each invitation
  - Call `acceptInvite()` on acceptance
  - Show success message and redirect to tenant workspace
  - Handle expired invitations gracefully
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 11.2_

- [x] 12.2 Create pending invitations page
  - Create `src/app/invitations/pending/page.tsx`
  - Render InvitationAcceptance component
  - Add ProtectedRoute wrapper
  - Check for invitations on mount
  - Show empty state if no invitations
  - _Requirements: 7.1, 7.2_

- [x] 12.3 Add invitation check to post-login flow
  - Update login success handler in AuthContext or login page
  - Call `checkUserInvitations()` after successful login
  - Redirect to invitations page if invitations exist
  - Otherwise proceed to dashboard or onboarding
  - _Requirements: 7.1, 13.1_

- [x] 13. Implement navigation guards and routing
- [x] 13.1 Create onboarding guard hook
  - Create `src/hooks/useOnboardingGuard.ts`
  - Check if user has completed onboarding
  - Redirect to onboarding wizard if incomplete
  - Allow access if onboarding is complete
  - _Requirements: 3.1, 3.2, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 13.2 Create permission guard hook
  - Create `src/hooks/usePermissionGuard.ts`
  - Check user role against required permissions
  - Show permission denied message if insufficient
  - Redirect to appropriate page
  - _Requirements: 2.3, 5.3, 6.2, 10.2, 10.3, 10.4_

- [x] 13.3 Add onboarding check to dashboard
  - Update `src/app/dashboard/page.tsx`
  - Use onboarding guard to check completion status
  - Redirect to onboarding if incomplete
  - Show trial status badge in dashboard header
  - _Requirements: 3.1, 3.2, 9.1, 9.2, 13.4_

- [x] 13.4 Create schema guard utility
  - Create `src/lib/schema-guard.ts`
  - Detect current schema (public vs tenant) from URL
  - Provide redirect helper for schema mismatches
  - Add error message formatter for schema errors
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 14. Add error handling and user feedback
- [x] 14.1 Enhance Alert component for onboarding errors
  - Update `src/components/ui/Alert.tsx` if needed
  - Ensure support for different error types
  - Add auto-dismiss functionality
  - Support for action buttons in alerts
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 14.2 Create error boundary for onboarding
  - Create `src/components/onboarding/OnboardingErrorBoundary.tsx`
  - Catch React errors in onboarding flow
  - Show user-friendly fallback UI
  - Provide retry and contact support options
  - Log errors for debugging
  - _Requirements: 11.4, 11.5_

- [x] 14.3 Add loading states to all async operations
  - Ensure all API calls show loading indicators
  - Use existing Button loading state
  - Add skeleton loaders for data fetching
  - Disable forms during submission
  - _Requirements: 11.1, 11.2_

- [x] 15. Implement data persistence and caching
- [x] 15.1 Add tenant data caching in OnboardingContext
  - Cache tenant data in context state
  - Implement refresh mechanism with TTL
  - Invalidate cache on updates
  - Persist current step in localStorage for resumption
  - _Requirements: 2.1, 3.1, 12.1, 12.2, 13.5_

- [x] 15.2 Add member list caching
  - Cache member list in context state
  - Refresh on invitation acceptance
  - Invalidate on member changes
  - _Requirements: 4.1, 5.1, 15.2, 15.3_

- [x] 16. Add final integration and polish
- [x] 16.1 Update navigation menu
  - Add company settings link to navigation (owner/admin only)
  - Add team management link to navigation (owner/admin only)
  - Show trial status in header/navigation
  - Add tenant switcher placeholder (future enhancement)
  - _Requirements: 2.1, 4.1, 9.1, 9.2_

- [x] 16.2 Add onboarding completion celebration
  - Add confetti animation to OnboardingComplete component
  - Show personalized success message with user's name
  - Display quick start guide or tutorial links
  - _Requirements: 3.2, 13.4_

- [x] 16.3 Implement responsive design for all components
  - Ensure all onboarding components work on mobile
  - Test tablet layouts
  - Optimize form layouts for small screens
  - Make tables responsive with horizontal scroll or card layout
  - _Requirements: 3.1, 4.1, 5.1, 7.1_

- [x] 16.4 Add accessibility features
  - Ensure keyboard navigation works throughout onboarding
  - Add ARIA labels to all interactive elements
  - Test with screen readers
  - Ensure color contrast meets WCAG standards
  - Add focus indicators
  - _Requirements: 3.1, 4.1, 5.1, 7.1, 11.1_

- [ ]* 17. Testing and validation
- [ ]* 17.1 Write unit tests for API client
  - Test all onboarding API functions
  - Mock fetch responses
  - Verify error handling
  - Test token injection
  - _Requirements: 1.1, 1.2, 8.1, 11.1_

- [ ]* 17.2 Write unit tests for OnboardingContext
  - Test state management
  - Verify API integration
  - Test error scenarios
  - Verify loading states
  - _Requirements: 2.1, 2.2, 3.1, 11.1_

- [ ]* 17.3 Write component tests for forms
  - Test form validation
  - Verify submission handling
  - Test error display
  - Verify loading states
  - _Requirements: 1.1, 2.1, 5.1, 11.1_

- [ ]* 17.4 Write integration tests for onboarding flow
  - Test complete 5-step flow
  - Verify step transitions
  - Test data persistence
  - Verify completion state
  - _Requirements: 3.1, 3.2, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 17.5 Write integration tests for team management
  - Test member invitation flow
  - Verify invitation acceptance
  - Test permission checks
  - Verify member list updates
  - _Requirements: 5.1, 5.2, 7.1, 7.2, 10.2, 10.3_
