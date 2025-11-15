# Implementation Plan

- [ ] 1. Set up billing type definitions and API client
- [x] 1.1 Create billing type definitions
  - Create `src/types/billing.ts` with all interfaces: SubscriptionPlan, Subscription, Invoice, Payment, UsageSummary, BillingOverview, request types, and Stripe types
  - Define subscription status and payment status enums
  - Define payment method types
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1, 9.1, 10.1_

- [x] 1.2 Implement billing API client
  - Create `src/lib/billing-api.ts` following the pattern from `auth-api.ts`
  - Implement `fetchBillingAPI` wrapper with error handling and token injection
  - Implement subscription functions: `getSubscriptionPlans`, `getCurrentSubscription`, `createSubscription`, `updateSubscription`, `cancelSubscription`
  - Implement billing data functions: `getBillingOverview`, `getInvoices`, `getPayments`
  - Implement Stripe functions: `createSetupIntent`, `addPaymentMethod`
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 15.1_

- [ ] 2. Create BillingContext for state management
- [x] 2.1 Implement BillingContext with state and methods
  - Create `src/contexts/BillingContext.tsx` following the pattern from `AuthContext.tsx`
  - Define BillingContextType interface with state and methods
  - Implement state management for subscription, plans, invoices, payments, billing overview, loading, and selected billing cycle
  - Implement subscription management methods: `loadSubscription`, `createNewSubscription`, `upgradeDowngrade`, `cancelCurrentSubscription`, `reactivateSubscription`
  - Implement plan management methods: `loadPlans`, `setBillingCycle`
  - Implement payment method methods: `setupPaymentMethod`, `savePaymentMethod`
  - Implement billing data methods: `loadBillingOverview`, `loadInvoices`, `loadPayments`, `refreshBillingData`
  - Add error handling for all operations
  - _Requirements: 2.1, 2.2, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 15.1, 16.1_

- [x] 2.2 Add BillingProvider to app layout
  - Update `src/app/layout.tsx` to wrap children with BillingProvider
  - Ensure BillingProvider is nested inside AuthProvider and OnboardingProvider
  - _Requirements: 2.1, 20.1_

- [ ] 3. Set up Stripe integration
- [x] 3.1 Install Stripe dependencies
  - Install `@stripe/stripe-js` and `@stripe/react-stripe-js` packages
  - _Requirements: 1.1, 12.1_

- [x] 3.2 Create Stripe provider component
  - Create `src/components/billing/StripeProvider.tsx`
  - Initialize Stripe with publishable key from environment variable
  - Wrap with Elements provider from @stripe/react-stripe-js
  - _Requirements: 1.1, 12.1, 12.2_

- [x] 3.3 Create payment method form with Stripe Elements
  - Create `src/components/billing/PaymentMethodForm.tsx`
  - Integrate CardElement from Stripe Elements
  - Implement card validation and error display
  - Handle setup intent creation and confirmation
  - Collect billing details (name, email)
  - Call `setupPaymentMethod()` and `savePaymentMethod()` from BillingContext
  - Show loading state during processing
  - Display Stripe errors with user-friendly messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 12.1, 12.2, 12.3, 12.4, 12.5, 15.1, 16.3_

- [ ] 4. Build subscription status and overview components
- [x] 4.1 Create subscription status badge component
  - Create `src/components/billing/SubscriptionStatusBadge.tsx`
  - Display status with color-coded styling (active: green, trialing: blue, past_due: yellow, canceled: red, unpaid: red)
  - Show appropriate icon for each status
  - _Requirements: 4.1, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 4.2 Create subscription overview component
  - Create `src/components/billing/SubscriptionOverview.tsx`
  - Display current plan name, description, and pricing
  - Show billing cycle (monthly/yearly)
  - Display next renewal date with countdown
  - Show subscription status badge
  - Display trial information if applicable
  - Add quick action buttons: Upgrade, Change billing cycle, Cancel
  - Handle null subscription state (no subscription)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 5. Implement plan selection and comparison
- [x] 5.1 Create billing cycle toggle component
  - Create `src/components/billing/BillingCycleToggle.tsx`
  - Toggle between monthly and yearly
  - Show "Save X%" badge for yearly
  - Update selected billing cycle in context
  - _Requirements: 3.1, 3.2, 3.3, 14.1, 14.2, 14.3, 14.4_

- [x] 5.2 Create plan card component
  - Create `src/components/billing/PlanCard.tsx`
  - Display plan name, description, and pricing based on selected billing cycle
  - Show feature list with checkmarks
  - Display resource limits (users, equipment, storage, API calls)
  - Add "Current Plan" badge if applicable
  - Add "Recommended" badge for suggested plan
  - Include Select/Upgrade/Downgrade button based on context
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5.3 Create plan comparison component
  - Create `src/components/billing/PlanComparison.tsx`
  - Render BillingCycleToggle at the top
  - Display all plans in a grid using PlanCard components
  - Highlight current plan
  - Show loading state while fetching plans
  - Handle plan selection and trigger subscription creation or update
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 14.1, 14.2, 14.3_

- [ ] 6. Implement usage tracking components
- [x] 6.1 Create usage metric component
  - Create `src/components/billing/UsageMetric.tsx`
  - Display resource name and icon
  - Show current count vs limit
  - Render progress bar with percentage
  - Color-code based on usage: green (<80%), yellow (80-100%), red (>100%)
  - Show warning icon when approaching or exceeding limit
  - _Requirements: 8.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 6.2 Create usage metrics dashboard component
  - Create `src/components/billing/UsageMetrics.tsx`
  - Display UsageMetric components for users, equipment, and storage
  - Show upgrade prompt when limits are exceeded
  - Link to plan comparison for upgrades
  - _Requirements: 8.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 7. Build invoice management components
- [x] 7.1 Create invoice status badge component
  - Create `src/components/billing/InvoiceStatusBadge.tsx`
  - Display status with color-coded styling (paid: green, open: blue, draft: gray, void: red, uncollectible: red)
  - Show appropriate icon for each status
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 7.2 Create invoice list component
  - Create `src/components/billing/InvoiceList.tsx`
  - Display table with columns: invoice number, issue date, due date, amount, status
  - Show InvoiceStatusBadge for each invoice
  - Add download PDF button for each invoice
  - Implement pagination controls
  - Show loading state while fetching
  - Handle empty state when no invoices exist
  - Make responsive for mobile (card layout)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 17.1, 17.2, 17.3, 17.4_

- [ ] 8. Build payment history components
- [x] 8.1 Create payment status badge component
  - Create `src/components/billing/PaymentStatusBadge.tsx`
  - Display status with color-coded styling (succeeded: green, pending: blue, failed: red, canceled: gray, refunded: yellow)
  - Show appropriate icon for each status
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 8.2 Create payment history component
  - Create `src/components/billing/PaymentHistory.tsx`
  - Display table with columns: date, amount, payment method, status
  - Show PaymentStatusBadge for each payment
  - Display failure reason for failed payments
  - Implement pagination controls
  - Show loading state while fetching
  - Handle empty state when no payments exist
  - Make responsive for mobile (card layout)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 17.1, 17.2, 17.3, 17.4_

- [ ] 9. Create billing dashboard
- [x] 9.1 Create billing dashboard component
  - Create `src/components/billing/BillingDashboard.tsx`
  - Render SubscriptionOverview at the top
  - Display UsageMetrics section
  - Show recent invoices (last 5) with link to full invoice list
  - Show recent payments (last 5) with link to full payment history
  - Call `loadBillingOverview()` on mount
  - Show loading state while fetching data
  - Handle error states
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 16.1, 16.2_

- [x] 9.2 Create billing dashboard page
  - Create `src/app/billing/dashboard/page.tsx`
  - Render BillingDashboard component
  - Add ProtectedRoute wrapper to require authentication
  - Use schema guard to ensure public schema access
  - _Requirements: 8.1, 19.1, 19.2, 19.3, 19.4_

- [ ] 10. Implement subscription management flows
- [x] 10.1 Create upgrade/downgrade modal component
  - Create `src/components/billing/UpgradeDowngradeModal.tsx`
  - Display current plan and selected new plan
  - Show pricing comparison
  - Display proration information (if applicable)
  - Show billing cycle change option
  - Add confirm and cancel buttons
  - Call `upgradeDowngrade()` on confirmation
  - Show loading state during update
  - Display success/error messages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 14.5, 16.1, 16.2_

- [x] 10.2 Create cancel subscription modal component
  - Create `src/components/billing/CancelSubscriptionModal.tsx`
  - Display confirmation message with impact explanation
  - Add radio buttons for "Cancel immediately" vs "Cancel at period end"
  - Add optional reason textarea
  - Show what happens after cancellation
  - Add confirm and cancel buttons
  - Call `cancelCurrentSubscription()` on confirmation
  - Show loading state during cancellation
  - Display success message
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 16.1, 16.2_

- [x] 10.3 Create subscription management page
  - Create `src/app/billing/subscription/page.tsx`
  - Display current subscription details
  - Show PlanComparison component for upgrades/downgrades
  - Add cancel subscription button (opens CancelSubscriptionModal)
  - Add reactivate button if subscription is set to cancel at period end
  - Use ProtectedRoute and schema guard
  - _Requirements: 4.1, 5.1, 6.1, 19.1, 19.2_

- [ ] 11. Create plan selection page
- [x] 11.1 Create plans page
  - Create `src/app/billing/plans/page.tsx`
  - Render PlanComparison component
  - Handle plan selection for new subscriptions
  - Show PaymentMethodForm modal when plan is selected without existing payment method
  - Create subscription after payment method is added
  - Redirect to billing dashboard after successful subscription creation
  - Allow viewing plans without authentication
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 12. Create payment methods page
- [x] 12.1 Create payment methods page
  - Create `src/app/billing/payment-methods/page.tsx`
  - Display list of saved payment methods (if backend supports)
  - Show PaymentMethodForm for adding new payment method
  - Add set as default option
  - Use ProtectedRoute and schema guard
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 19.1, 19.2_

- [ ] 13. Create invoices page
- [x] 13.1 Create invoices page
  - Create `src/app/billing/invoices/page.tsx`
  - Render InvoiceList component
  - Implement pagination
  - Add date range filter (optional enhancement)
  - Use ProtectedRoute and schema guard
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 19.1, 19.2_

- [ ] 14. Create payments page
- [x] 14.1 Create payments page
  - Create `src/app/billing/payments/page.tsx`
  - Render PaymentHistory component
  - Implement pagination
  - Add date range filter (optional enhancement)
  - Use ProtectedRoute and schema guard
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 19.1, 19.2_

- [ ] 15. Integrate billing with onboarding
- [x] 15.1 Update PaymentSetupForm in onboarding
  - Update `src/components/onboarding/PaymentSetupForm.tsx`
  - Replace existing payment form with PaymentMethodForm component
  - Show selected plan details from step 2
  - Create subscription after payment method is added
  - Store subscription ID in step data
  - Allow skipping for trial users
  - Call `completeStep(3, { subscription_id })` on success
  - _Requirements: 1.1, 2.1, 2.2, 20.1, 20.2, 20.3_

- [x] 15.2 Update OnboardingComplete to show subscription
  - Update `src/components/onboarding/OnboardingComplete.tsx`
  - Display subscription status and plan name
  - Show trial information if applicable
  - Add link to billing dashboard
  - _Requirements: 20.4, 20.5_

- [ ] 16. Add billing to navigation and dashboard
- [ ] 16.1 Update main navigation
  - Update navigation component to add billing link
  - Show billing badge for trial expiration warning
  - Add quick access to subscription management
  - _Requirements: 4.1, 13.2, 20.4_

- [ ] 16.2 Add billing widget to main dashboard
  - Update `src/app/dashboard/page.tsx`
  - Add subscription status widget
  - Show trial expiration warning if applicable
  - Display usage metrics summary
  - Add link to full billing dashboard
  - _Requirements: 4.1, 11.5, 13.2, 20.4, 20.5_

- [ ] 17. Implement error handling and user feedback
- [x] 17.1 Create Stripe error handler utility
  - Create `src/lib/stripe-error-handler.ts`
  - Map Stripe error types to user-friendly messages
  - Provide actionable guidance for each error type
  - _Requirements: 1.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 17.2 Add error boundaries for billing components
  - Create `src/components/billing/BillingErrorBoundary.tsx`
  - Catch React errors in billing flow
  - Show user-friendly fallback UI
  - Provide retry and contact support options
  - Log errors for debugging
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 17.3 Add loading states to all billing operations
  - Ensure all API calls show loading indicators
  - Use skeleton loaders for data fetching
  - Disable forms during submission
  - Show processing messages for payments
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 18. Implement responsive design
- [ ] 18.1 Make billing dashboard responsive
  - Ensure dashboard works on mobile, tablet, and desktop
  - Use responsive grid for overview sections
  - Stack components vertically on mobile
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 18.2 Make plan comparison responsive
  - Display plan cards in single column on mobile
  - Use two columns on tablet
  - Use three or four columns on desktop
  - Ensure billing cycle toggle is accessible on all devices
  - _Requirements: 17.1, 17.2, 17.3_

- [ ] 18.3 Make tables responsive
  - Use card layout for invoice and payment tables on mobile
  - Use horizontal scroll for tables on tablet
  - Use full table layout on desktop
  - _Requirements: 17.4, 17.5_

- [ ] 19. Add accessibility features
- [ ] 19.1 Ensure keyboard navigation
  - Test keyboard navigation throughout billing flow
  - Add focus indicators to all interactive elements
  - Support tab navigation in modals
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 19.2 Add ARIA labels and screen reader support
  - Add ARIA labels to all buttons and links
  - Use ARIA live regions for status updates
  - Ensure form fields have proper labels
  - Add descriptive text for icons
  - _Requirements: 18.2, 18.3, 18.4, 18.5_

- [ ] 19.3 Ensure color contrast and visual accessibility
  - Verify color contrast meets WCAG standards
  - Use icons with text labels for status
  - Ensure focus indicators are visible
  - Test with high contrast mode
  - _Requirements: 18.5_

- [ ] 20. Add schema guard for billing routes
- [ ] 20.1 Create billing schema guard
  - Update `src/lib/schema-guard.ts` to add billing-specific checks
  - Detect if accessing from tenant subdomain
  - Redirect to localhost:8000 if needed
  - Show informative message about schema requirement
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 20.2 Apply schema guard to all billing routes
  - Add schema guard to all billing pages
  - Ensure automatic redirect on schema mismatch
  - Test from both public and tenant schemas
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [ ]* 21. Testing and validation
- [ ]* 21.1 Write unit tests for billing API client
  - Test all billing API functions
  - Mock fetch responses
  - Verify error handling
  - Test pagination
  - _Requirements: 1.1, 2.1, 15.1_

- [ ]* 21.2 Write unit tests for BillingContext
  - Test state management
  - Verify API integration
  - Test subscription lifecycle
  - Test error scenarios
  - _Requirements: 2.1, 4.1, 5.1, 6.1_

- [ ]* 21.3 Write component tests for billing components
  - Test plan selection
  - Verify payment form validation
  - Test subscription status display
  - Test usage metrics calculation
  - _Requirements: 3.1, 4.1, 5.1, 11.1_

- [ ]* 21.4 Write integration tests for subscription flow
  - Test subscription creation with payment
  - Test upgrade/downgrade flow
  - Test cancellation flow
  - Verify error handling
  - _Requirements: 2.1, 5.1, 6.1_

- [ ]* 21.5 Test Stripe integration with test cards
  - Test successful card setup
  - Test card decline scenarios
  - Test 3D Secure flow
  - Test various error conditions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
