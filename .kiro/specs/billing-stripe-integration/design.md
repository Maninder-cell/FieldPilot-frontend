# Design Document

## Overview

The Stripe billing integration provides a comprehensive, professional-grade subscription and payment management system for Field Pilot. This system extends beyond the basic payment setup in onboarding to deliver a full-featured billing dashboard with subscription management, payment method handling, invoice viewing, usage tracking, and subscription lifecycle management.

The design follows industry best practices for payment processing, utilizing Stripe Elements for PCI-compliant card collection, implementing proper error handling for payment failures, and providing clear user feedback throughout all billing operations. The system integrates seamlessly with the existing onboarding flow while also providing standalone billing management capabilities accessible from a dedicated billing section.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Billing    │  │ Subscription │  │   Payment    │      │
│  │   Context    │  │  Management  │  │   Methods    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Billing API Client                        │   │
│  │  (billing-api.ts)                                    │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Stripe.js / Stripe Elements               │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    HTTP/REST API                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Django/PostgreSQL)                 │
├─────────────────────────────────────────────────────────────┤
│  Public Schema (localhost:8000)                              │
│  ├─ Subscription Management                                  │
│  ├─ Payment Processing (Stripe)                              │
│  ├─ Invoice Generation                                       │
│  └─ Usage Tracking                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Stripe API                                │
│  ├─ Setup Intents                                            │
│  ├─ Payment Methods                                          │
│  ├─ Customer Management                                      │
│  └─ Webhooks (future)                                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App Layout
├── BillingProvider (Context)
│   ├── Billing Dashboard
│   │   ├── SubscriptionOverview
│   │   ├── UsageMetrics
│   │   ├── RecentInvoices
│   │   └── RecentPayments
│   ├── Subscription Management
│   │   ├── PlanComparison
│   │   ├── BillingCycleToggle
│   │   ├── UpgradeDowngradeFlow
│   │   └── CancelSubscriptionModal
│   ├── Payment Methods
│   │   ├── PaymentMethodList
│   │   ├── AddPaymentMethodForm (Stripe Elements)
│   │   └── SetDefaultPaymentMethod
│   ├── Invoices
│   │   ├── InvoiceList
│   │   └── InvoiceDetail
│   └── Payment History
│       └── PaymentList
```


## Components and Interfaces

### 1. Type Definitions

**File:** `src/types/billing.ts`

```typescript
// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  yearly_discount_percentage: number;
  max_users: number;
  max_equipment: number;
  max_storage_gb: number;
  max_api_calls_per_month: number;
  features: Record<string, boolean>;
  is_active: boolean;
}

// Subscription Types
export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  is_active: boolean;
  is_trial: boolean;
  days_until_renewal: number;
  current_users_count: number;
  current_equipment_count: number;
  current_storage_gb: string;
  usage_limits_exceeded: string[];
  created_at: string;
}

export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete' 
  | 'incomplete_expired';

// Invoice Types
export interface Invoice {
  id: string;
  invoice_number: string;
  subtotal: string;
  tax: string;
  total: string;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  invoice_pdf_url: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

// Payment Types
export interface Payment {
  id: string;
  amount: string;
  currency: string;
  payment_method: PaymentMethodType;
  status: PaymentStatus;
  failure_code: string;
  failure_message: string;
  processed_at: string | null;
  created_at: string;
}

export type PaymentMethodType = 'card' | 'bank_transfer' | 'ach' | 'wire';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

// Usage Types
export interface UsageSummary {
  users: UsageMetric;
  equipment: UsageMetric;
  storage: UsageMetric;
}

export interface UsageMetric {
  current: number;
  limit: number;
  percentage: number;
}

// Billing Overview Types
export interface BillingOverview {
  subscription: Subscription | null;
  current_invoice: Invoice | null;
  recent_payments: Payment[];
  usage_summary: UsageSummary;
}

// Request Types
export interface CreateSubscriptionRequest {
  plan_slug: string;
  billing_cycle: 'monthly' | 'yearly';
  payment_method_id?: string;
}

export interface UpdateSubscriptionRequest {
  plan_slug?: string;
  billing_cycle?: 'monthly' | 'yearly';
  cancel_at_period_end?: boolean;
}

export interface CancelSubscriptionRequest {
  cancel_immediately?: boolean;
  reason?: string;
}

export interface AddPaymentMethodRequest {
  payment_method_id: string;
  set_as_default?: boolean;
}

// Stripe Types
export interface SetupIntentResponse {
  client_secret: string;
  customer_id: string;
}

// API Response Types
export interface BillingApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
  };
}

export interface BillingApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta: {
    timestamp: string;
  };
}
```

### 2. Billing API Client

**File:** `src/lib/billing-api.ts`

This module provides all API functions for billing operations:

```typescript
import { 
  BillingApiResponse, 
  SubscriptionPlan, 
  Subscription,
  Invoice,
  Payment,
  BillingOverview,
  SetupIntentResponse,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
  AddPaymentMethodRequest
} from '@/types/billing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Generic fetch wrapper with error handling
async function fetchBillingAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Implementation with error handling, token injection, response parsing
}

// Subscription Plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]>

// Subscription Management
export async function getCurrentSubscription(accessToken: string): Promise<Subscription | null>
export async function createSubscription(data: CreateSubscriptionRequest, accessToken: string): Promise<Subscription>
export async function updateSubscription(data: UpdateSubscriptionRequest, accessToken: string): Promise<Subscription>
export async function cancelSubscription(data: CancelSubscriptionRequest, accessToken: string): Promise<Subscription>

// Billing Overview
export async function getBillingOverview(accessToken: string): Promise<BillingOverview>

// Invoices
export async function getInvoices(accessToken: string, page?: number, pageSize?: number): Promise<Invoice[]>

// Payments
export async function getPayments(accessToken: string, page?: number, pageSize?: number): Promise<Payment[]>

// Stripe Payment Methods
export async function createSetupIntent(accessToken: string): Promise<SetupIntentResponse>
export async function addPaymentMethod(data: AddPaymentMethodRequest, accessToken: string): Promise<void>
```


### 3. Billing Context

**File:** `src/contexts/BillingContext.tsx`

Manages billing state and provides methods for subscription and payment management:

```typescript
interface BillingContextType {
  // State
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  invoices: Invoice[];
  payments: Payment[];
  billingOverview: BillingOverview | null;
  isLoading: boolean;
  selectedBillingCycle: 'monthly' | 'yearly';
  
  // Subscription Management
  loadSubscription: () => Promise<void>;
  createNewSubscription: (planSlug: string, billingCycle: 'monthly' | 'yearly', paymentMethodId?: string) => Promise<void>;
  upgradeDowngrade: (planSlug: string, billingCycle?: 'monthly' | 'yearly') => Promise<void>;
  cancelCurrentSubscription: (immediately: boolean, reason?: string) => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  
  // Plan Management
  loadPlans: () => Promise<void>;
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  
  // Payment Methods
  setupPaymentMethod: () => Promise<SetupIntentResponse>;
  savePaymentMethod: (paymentMethodId: string, setAsDefault: boolean) => Promise<void>;
  
  // Billing Data
  loadBillingOverview: () => Promise<void>;
  loadInvoices: (page?: number) => Promise<void>;
  loadPayments: (page?: number) => Promise<void>;
  
  // Utility
  refreshBillingData: () => Promise<void>;
}
```

**Key Features:**
- Integrates with AuthContext for token management
- Caches subscription and plan data
- Provides centralized state for all billing operations
- Handles loading states and errors
- Automatically refreshes data after mutations

### 4. Stripe Integration Components

#### 4.1 Stripe Provider Setup

**File:** `src/components/billing/StripeProvider.tsx`

Wrapper component that initializes Stripe:

```typescript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

#### 4.2 Payment Method Form

**File:** `src/components/billing/PaymentMethodForm.tsx`

Stripe Elements integration for card collection:

```typescript
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export function PaymentMethodForm({ onSuccess, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const { setupPaymentMethod, savePaymentMethod } = useBilling();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    // Get setup intent
    const { client_secret } = await setupPaymentMethod();
    
    // Confirm card setup
    const { setupIntent, error } = await stripe.confirmCardSetup(client_secret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: billingName,
          email: billingEmail,
        },
      },
    });
    
    if (error) {
      onError(error.message);
      return;
    }
    
    // Save payment method
    await savePaymentMethod(setupIntent.payment_method as string, true);
    onSuccess();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={cardElementOptions} />
      <button type="submit" disabled={!stripe}>
        Save Payment Method
      </button>
    </form>
  );
}
```

### 5. UI Components

#### 5.1 Billing Dashboard

**File:** `src/components/billing/BillingDashboard.tsx`

Main billing overview page:

```typescript
export function BillingDashboard() {
  const { billingOverview, loadBillingOverview } = useBilling();
  
  useEffect(() => {
    loadBillingOverview();
  }, []);
  
  return (
    <div className="billing-dashboard">
      <SubscriptionOverview subscription={billingOverview?.subscription} />
      <UsageMetrics usage={billingOverview?.usage_summary} />
      <RecentInvoices invoices={billingOverview?.recent_payments} />
      <RecentPayments payments={billingOverview?.recent_payments} />
    </div>
  );
}
```

#### 5.2 Subscription Overview

**File:** `src/components/billing/SubscriptionOverview.tsx`

Displays current subscription details:

- Current plan name and pricing
- Billing cycle (monthly/yearly)
- Next renewal date
- Subscription status badge
- Trial status if applicable
- Quick actions: Upgrade, Change billing cycle, Cancel

#### 5.3 Plan Comparison

**File:** `src/components/billing/PlanComparison.tsx`

Displays all available plans for upgrade/downgrade:

- Plan cards with pricing
- Feature comparison
- Billing cycle toggle
- Current plan indicator
- Upgrade/Downgrade buttons
- Proration preview

#### 5.4 Usage Metrics

**File:** `src/components/billing/UsageMetrics.tsx`

Displays resource usage against limits:

- Progress bars for users, equipment, storage
- Current count vs limit
- Percentage indicators
- Warning badges when approaching limits
- Exceeded limit alerts

#### 5.5 Invoice List

**File:** `src/components/billing/InvoiceList.tsx`

Displays invoice history:

- Table with invoice number, date, amount, status
- Download PDF button
- Pagination controls
- Status badges (paid, open, void)
- Filter by date range

#### 5.6 Payment History

**File:** `src/components/billing/PaymentHistory.tsx`

Displays payment records:

- Table with date, amount, method, status
- Status badges (succeeded, failed, refunded)
- Failure reason for failed payments
- Pagination controls

#### 5.7 Cancel Subscription Modal

**File:** `src/components/billing/CancelSubscriptionModal.tsx`

Handles subscription cancellation:

- Confirmation dialog
- Cancel immediately vs at period end option
- Reason for cancellation (optional)
- Impact explanation
- Confirm/Cancel buttons


## Data Models

### Subscription Lifecycle Flow

```
No Subscription → Create with Trial → Active (Trial)
                                          ↓
                                    Trial Expires
                                          ↓
                              Payment Method Added?
                                    ↙         ↘
                                  Yes          No
                                   ↓            ↓
                            Active (Paid)   Incomplete
                                   ↓
                          ┌────────┴────────┐
                          ↓                 ↓
                    Upgrade/Downgrade    Cancel
                          ↓                 ↓
                    Active (New Plan)   Canceled
```

### Payment Method Setup Flow

```
User Clicks "Add Payment Method"
          ↓
Create Setup Intent (Backend)
          ↓
Display Stripe Card Element
          ↓
User Enters Card Details
          ↓
Stripe Validates Card
          ↓
3D Secure Required?
    ↙         ↘
  Yes          No
   ↓            ↓
Show Auth     Confirm Setup
   ↓            ↓
Confirm ────────┘
   ↓
Get Payment Method ID
   ↓
Save to Backend
   ↓
Success
```

### State Management

**BillingContext State:**
```typescript
{
  subscription: Subscription | null,
  plans: SubscriptionPlan[],
  invoices: Invoice[],
  payments: Payment[],
  billingOverview: BillingOverview | null,
  isLoading: boolean,
  selectedBillingCycle: 'monthly' | 'yearly'
}
```

**Local Storage:**
- Selected billing cycle preference
- Last fetched subscription data (with TTL)
- Cached plan data

## Error Handling

### Error Types and Handling Strategy

1. **Stripe Errors**
   - Card declined: Show specific decline reason
   - Invalid card: Highlight invalid fields
   - Authentication required: Trigger 3D Secure flow
   - Network error: Provide retry option

2. **Validation Errors (400)**
   - Invalid plan: Show available plans
   - Already has subscription: Redirect to manage subscription
   - Missing payment method: Prompt to add payment method

3. **Authentication Errors (401)**
   - Redirect to login
   - Clear auth state

4. **Permission Errors (403)**
   - Schema mismatch: Redirect to localhost:8000
   - Insufficient permissions: Show owner/admin required message

5. **Not Found Errors (404)**
   - No subscription: Show create subscription flow
   - Resource not found: Show appropriate message

6. **Server Errors (500)**
   - Show generic error with retry
   - Log for debugging

### Stripe-Specific Error Handling

```typescript
const handleStripeError = (error: StripeError) => {
  switch (error.type) {
    case 'card_error':
      // Card was declined
      return error.message;
    case 'validation_error':
      // Invalid parameters
      return 'Please check your card details';
    case 'api_error':
      // Stripe API error
      return 'Payment processing error. Please try again.';
    case 'authentication_error':
      // Authentication with Stripe failed
      return 'Payment system error. Please contact support.';
    default:
      return 'An unexpected error occurred';
  }
};
```

## Testing Strategy

### Unit Tests

**Billing API Client Tests** (`billing-api.test.ts`)
- Test all API functions
- Mock fetch responses
- Verify request formatting
- Test error handling
- Test pagination

**Billing Context Tests** (`BillingContext.test.tsx`)
- Test state management
- Verify API integration
- Test subscription lifecycle
- Test error scenarios
- Verify loading states

**Component Tests**
- Test plan selection
- Verify payment form validation
- Test subscription status display
- Test usage metrics calculation
- Verify modal interactions

### Integration Tests

**Subscription Flow Tests**
- Test subscription creation with payment
- Test subscription creation without payment
- Test upgrade/downgrade flow
- Test cancellation flow
- Verify proration calculations

**Payment Method Tests**
- Test Stripe Elements integration
- Test setup intent creation
- Test payment method saving
- Test 3D Secure flow
- Verify error handling

**Billing Dashboard Tests**
- Test data loading
- Verify overview display
- Test navigation between sections
- Verify refresh functionality

### Stripe Testing

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`
- Insufficient funds: `4000 0000 0000 9995`
- Expired card: `4000 0000 0000 0069`

## Routes and Navigation

### New Routes

```
/billing
  /billing/dashboard         - Main billing overview
  /billing/subscription      - Subscription management
  /billing/plans             - Plan comparison and selection
  /billing/payment-methods   - Payment method management
  /billing/invoices          - Invoice history
  /billing/payments          - Payment history
```

### Navigation Guards

**Billing Access Guard**
- Verify user is authenticated
- Check schema (must be public)
- Redirect if accessing from tenant subdomain

**Subscription Required Guard**
- Check if subscription exists
- Redirect to create subscription if needed
- Allow access to billing dashboard

## Integration Points

### 1. Onboarding Integration

- Use PaymentMethodForm in Step 3 of onboarding
- Create subscription after payment method setup
- Store subscription ID in onboarding step data
- Show subscription status in OnboardingComplete

### 2. Dashboard Integration

- Display subscription status in main dashboard
- Show trial expiration warning
- Display usage metrics widget
- Link to billing dashboard

### 3. Usage Tracking Integration

- Update usage counts when resources are added
- Check limits before allowing resource creation
- Show upgrade prompt when limits are reached
- Display usage in billing dashboard

### 4. Navigation Integration

- Add billing link to main navigation
- Show billing badge for trial expiration
- Add quick access to payment methods
- Link invoices from notifications

## Security Considerations

### 1. PCI Compliance

- Never store card details on frontend
- Use Stripe Elements for card collection
- Tokenize cards before sending to backend
- Use HTTPS for all payment operations

### 2. Schema Isolation

- Enforce public schema for billing endpoints
- Validate schema on every request
- Redirect to correct URL if mismatch
- Log schema violations

### 3. Payment Method Security

- Verify ownership before operations
- Require authentication for all billing operations
- Use setup intents for card collection
- Validate payment method IDs

### 4. Subscription Security

- Verify user has permission to modify subscription
- Validate plan changes
- Prevent duplicate subscriptions
- Audit subscription changes

## Performance Considerations

### 1. Data Caching

- Cache subscription data with TTL
- Cache plan data (rarely changes)
- Invalidate cache on updates
- Use optimistic updates for UI

### 2. Lazy Loading

- Load Stripe.js only when needed
- Defer invoice/payment loading
- Use pagination for large lists
- Implement infinite scroll

### 3. Stripe Elements Optimization

- Preload Stripe.js on billing pages
- Cache Stripe instance
- Debounce card validation
- Show loading states

### 4. API Optimization

- Batch related requests
- Use billing overview endpoint
- Implement request caching
- Debounce search/filter

## Accessibility

### 1. Stripe Elements Accessibility

- Ensure proper label associations
- Support keyboard navigation
- Provide error announcements
- Use ARIA labels

### 2. Billing Dashboard Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Screen reader announcements

### 3. Form Accessibility

- Label all form fields
- Associate errors with fields
- Provide help text
- Support keyboard submission

### 4. Status Indicators

- Use icons with text labels
- Ensure color contrast
- Provide text alternatives
- Announce status changes

## Deployment Considerations

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Stripe Configuration

- Use test keys in development
- Use live keys in production
- Configure webhook endpoints
- Set up error monitoring

### Error Tracking

- Log Stripe errors
- Track payment failures
- Monitor subscription changes
- Alert on critical errors

## Future Enhancements

1. **Webhook Integration**
   - Handle subscription updates
   - Process payment failures
   - Update invoice status
   - Send email notifications

2. **Advanced Payment Methods**
   - Support ACH payments
   - Support wire transfers
   - Multiple payment methods
   - Payment method switching

3. **Billing Analytics**
   - Revenue tracking
   - Churn analysis
   - Usage trends
   - Subscription metrics

4. **Proration Preview**
   - Show exact charges for upgrades
   - Display credits for downgrades
   - Preview next invoice
   - Explain proration logic

5. **Self-Service Portal**
   - Update billing address
   - Download all invoices
   - Export payment history
   - Manage tax information

6. **Usage Alerts**
   - Email when approaching limits
   - In-app notifications
   - Automatic upgrade suggestions
   - Usage forecasting
