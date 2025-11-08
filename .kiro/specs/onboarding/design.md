# Design Document

## Overview

The onboarding system provides a comprehensive multi-tenant company setup and management solution for Field Pilot. It enables users to create companies, complete a guided 5-step onboarding process, invite team members, and manage tenant-specific settings. The system enforces strict schema-based access control where all onboarding operations occur in the public schema (localhost:8000) while tenant-specific operations occur in isolated tenant subdomains.

The implementation follows existing patterns established in the authentication system, utilizing React Context for state management, TypeScript for type safety, and a modular component architecture. The design integrates seamlessly with the existing authentication flow and prepares users for transition to their tenant-specific workspace.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Onboarding  │  │   Company    │  │    Team      │      │
│  │   Context    │  │  Management  │  │  Management  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Onboarding API Client                     │   │
│  │  (onboarding-api.ts)                                 │   │
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
│  ├─ Company/Tenant Management                                │
│  ├─ Onboarding Process                                       │
│  ├─ Team Invitations                                         │
│  └─ Member Management                                        │
├─────────────────────────────────────────────────────────────┤
│  Tenant Schemas (subdomain.localhost:8000)                   │
│  ├─ Customer Management                                      │
│  ├─ Equipment Tracking                                       │
│  └─ Work Orders                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App Layout
├── OnboardingProvider (Context)
│   ├── OnboardingWizard (Main Container)
│   │   ├── Step1: CompanyInfoForm
│   │   ├── Step2: PlanSelectionForm
│   │   ├── Step3: PaymentSetupForm
│   │   ├── Step4: TeamInvitationForm
│   │   └── Step5: OnboardingComplete
│   ├── CompanySettings (Management)
│   │   ├── CompanyInfoView
│   │   └── CompanyInfoEditForm
│   └── TeamManagement (Management)
│       ├── MemberList
│       ├── InviteMemberForm
│       ├── PendingInvitationsList
│       └── InvitationAcceptance
```

## Components and Interfaces

### 1. Type Definitions

**File:** `src/types/onboarding.ts`

```typescript
// Company/Tenant Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  company_email: string;
  company_phone: string | null;
  website: string | null;
  company_size: string | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  is_active: boolean;
  trial_ends_at: string;
  is_trial_active: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  member_count: number;
  created_at: string;
  updated_at: string;
  domain?: string;
  access_url?: string;
}

export interface CreateCompanyRequest {
  name: string;
  company_email: string;
  company_phone?: string;
  company_size?: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  company_email?: string;
  company_phone?: string;
  company_size?: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

// Onboarding Types
export interface CompleteStepRequest {
  step: number;
  data?: Record<string, any>;
}

// Team Member Types
export interface TenantMember {
  id: string;
  tenant: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    employee_id: string;
    department: string | null;
    job_title: string | null;
    is_active: boolean;
    is_verified: boolean;
    two_factor_enabled: boolean;
    created_at: string;
    last_login_at: string | null;
  };
  role: 'owner' | 'admin' | 'manager' | 'member';
  is_active: boolean;
  joined_at: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  first_name?: string;
  last_name?: string;
}

// Invitation Types
export interface Invitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  is_valid: boolean;
  tenant_name?: string;
}

export interface InvitationCheckResponse {
  id: string;
  tenant_name: string;
  role: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
}

// API Response Types
export interface OnboardingApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
}

export interface OnboardingApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
  code?: string;
}
```

### 2. API Client

**File:** `src/lib/onboarding-api.ts`

This module provides all API functions for onboarding operations, following the same pattern as `auth-api.ts`:

```typescript
import { OnboardingApiResponse, OnboardingApiError, Tenant, ... } from '@/types/onboarding';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Generic fetch wrapper
async function fetchOnboardingAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Error handling, token injection, response parsing
}

// Company Management
export async function createCompany(data: CreateCompanyRequest, accessToken: string): Promise<Tenant>
export async function getCurrentTenant(accessToken: string): Promise<Tenant | null>
export async function updateTenant(data: UpdateCompanyRequest, accessToken: string): Promise<Tenant>

// Onboarding Process
export async function completeOnboardingStep(data: CompleteStepRequest, accessToken: string): Promise<Tenant>

// Team Members
export async function getTenantMembers(accessToken: string): Promise<TenantMember[]>
export async function inviteMember(data: InviteMemberRequest, accessToken: string): Promise<void>

// Invitations
export async function getPendingInvitations(accessToken: string): Promise<Invitation[]>
export async function checkInvitations(accessToken: string): Promise<InvitationCheckResponse[]>
export async function acceptInvitation(invitationId: string, accessToken: string): Promise<{ tenant_name: string; role: string }>
```

### 3. Onboarding Context

**File:** `src/contexts/OnboardingContext.tsx`

Manages onboarding state and provides methods for company and team management:

```typescript
interface OnboardingContextType {
  // State
  tenant: Tenant | null;
  members: TenantMember[];
  pendingInvitations: Invitation[];
  userInvitations: InvitationCheckResponse[];
  isLoading: boolean;
  currentStep: number;
  
  // Company Management
  createCompany: (data: CreateCompanyRequest) => Promise<void>;
  updateCompany: (data: UpdateCompanyRequest) => Promise<void>;
  refreshTenant: () => Promise<void>;
  
  // Onboarding Process
  completeStep: (step: number, data?: Record<string, any>) => Promise<void>;
  goToStep: (step: number) => void;
  
  // Team Management
  loadMembers: () => Promise<void>;
  inviteTeamMember: (data: InviteMemberRequest) => Promise<void>;
  loadPendingInvitations: () => Promise<void>;
  
  // Invitation Management
  checkUserInvitations: () => Promise<void>;
  acceptInvite: (invitationId: string) => Promise<void>;
}
```

**Key Features:**
- Integrates with AuthContext to access user and tokens
- Automatically loads tenant data when user is authenticated
- Tracks current onboarding step
- Provides centralized state management for all onboarding operations
- Handles error states and loading indicators

### 4. UI Components

#### 4.1 Onboarding Wizard

**File:** `src/components/onboarding/OnboardingWizard.tsx`

Main container component that orchestrates the 5-step onboarding flow:

```typescript
export default function OnboardingWizard() {
  const { currentStep, tenant } = useOnboarding();
  
  return (
    <div className="onboarding-wizard">
      <StepIndicator currentStep={currentStep} totalSteps={5} />
      {currentStep === 1 && <CompanyInfoForm />}
      {currentStep === 2 && <PlanSelectionForm />}
      {currentStep === 3 && <PaymentSetupForm />}
      {currentStep === 4 && <TeamInvitationForm />}
      {currentStep === 5 && <OnboardingComplete />}
    </div>
  );
}
```

#### 4.2 Step Components

**Step 1: Company Info Form**
- File: `src/components/onboarding/CompanyInfoForm.tsx`
- Collects company details (name, email, phone, size, industry, etc.)
- Validates required fields (name, company_email)
- Calls `createCompany()` on submission
- Automatically advances to step 2 on success

**Step 2: Plan Selection Form**
- File: `src/components/onboarding/PlanSelectionForm.tsx`
- Displays available subscription plans
- Allows monthly/yearly toggle
- Stores selected plan in step data
- Calls `completeStep(2, { plan_id })` on selection

**Step 3: Payment Setup Form**
- File: `src/components/onboarding/PaymentSetupForm.tsx`
- Integrates with Stripe for payment method collection
- Creates setup intent and subscription
- Calls `completeStep(3, { subscription_id })` on success

**Step 4: Team Invitation Form**
- File: `src/components/onboarding/TeamInvitationForm.tsx`
- Allows inviting multiple team members
- Shows list of invited members
- Provides skip option
- Calls `inviteTeamMember()` for each invitation
- Calls `completeStep(4)` when done

**Step 5: Onboarding Complete**
- File: `src/components/onboarding/OnboardingComplete.tsx`
- Shows success message and next steps
- Displays tenant access URL
- Provides button to access tenant workspace
- Calls `completeStep(5)` to finalize onboarding

#### 4.3 Company Management Components

**Company Info View**
- File: `src/components/onboarding/CompanyInfoView.tsx`
- Displays current company information
- Shows trial status and expiration
- Provides edit button (owner/admin only)

**Company Info Edit Form**
- File: `src/components/onboarding/CompanyInfoEditForm.tsx`
- Editable form for company details
- Validates changes
- Calls `updateCompany()` on save

#### 4.4 Team Management Components

**Member List**
- File: `src/components/onboarding/MemberList.tsx`
- Displays all tenant members with roles
- Shows user details (name, email, department, join date)
- Provides role badges
- Includes invite button (owner/admin only)

**Invite Member Form**
- File: `src/components/onboarding/InviteMemberForm.tsx`
- Modal/drawer form for inviting members
- Fields: email, role, first_name, last_name
- Role selector with descriptions
- Calls `inviteTeamMember()` on submit

**Pending Invitations List**
- File: `src/components/onboarding/PendingInvitationsList.tsx`
- Shows all pending invitations (owner/admin only)
- Displays email, role, invited by, expiration
- Provides resend/cancel options

**Invitation Acceptance**
- File: `src/components/onboarding/InvitationAcceptance.tsx`
- Displays pending invitations for current user
- Shows tenant name, role, inviter
- Provides accept/decline buttons
- Calls `acceptInvite()` on acceptance

#### 4.5 Shared UI Components

**Step Indicator**
- File: `src/components/onboarding/StepIndicator.tsx`
- Visual progress indicator for onboarding steps
- Shows completed, current, and upcoming steps

**Role Badge**
- File: `src/components/onboarding/RoleBadge.tsx`
- Displays role with appropriate styling
- Color-coded by permission level

**Trial Status Badge**
- File: `src/components/onboarding/TrialStatusBadge.tsx`
- Shows trial active/expired status
- Displays days remaining

## Data Models

### Tenant Data Flow

```
User Registration → Email Verification → Login
                                          ↓
                                    Check Invitations
                                    ↙            ↘
                          Has Invitations    No Invitations
                                ↓                  ↓
                          Show Invites      Create Company
                                ↓                  ↓
                          Accept Invite     Onboarding Step 1
                                ↓                  ↓
                          Join Tenant       Complete Steps 2-5
                                ↓                  ↓
                          Access Tenant     Onboarding Complete
                                ↓                  ↓
                                └──────────────────┘
                                         ↓
                                  Tenant Workspace
```

### State Management

**OnboardingContext State:**
```typescript
{
  tenant: Tenant | null,
  members: TenantMember[],
  pendingInvitations: Invitation[],
  userInvitations: InvitationCheckResponse[],
  isLoading: boolean,
  currentStep: number
}
```

**Local Storage:**
- Tenant data cached for quick access
- Current step persisted for resumption
- Invitation checks cached (with expiration)

## Error Handling

### Error Types and Handling Strategy

1. **Validation Errors (400)**
   - Display field-specific errors inline
   - Highlight invalid fields
   - Provide clear correction guidance

2. **Authentication Errors (401)**
   - Redirect to login
   - Clear auth state
   - Show session expired message

3. **Permission Errors (403)**
   - Show permission denied message
   - Explain required role
   - Provide contact admin option

4. **Not Found Errors (404)**
   - Show resource not found message
   - Provide navigation options
   - Log for debugging

5. **Schema Access Errors (403 - Wrong Schema)**
   - Detect schema mismatch
   - Redirect to correct URL (localhost:8000)
   - Show informative message

6. **Server Errors (500)**
   - Show generic error message
   - Provide retry option
   - Log error details for support

### Error Display Components

**Alert Component** (reuse existing `src/components/ui/Alert.tsx`)
- Display error messages
- Support different severity levels
- Auto-dismiss option

**Error Boundary**
- Catch React errors
- Show fallback UI
- Log errors for debugging

## Testing Strategy

### Unit Tests

**API Client Tests** (`onboarding-api.test.ts`)
- Test all API functions
- Mock fetch responses
- Verify request formatting
- Test error handling

**Context Tests** (`OnboardingContext.test.tsx`)
- Test state management
- Verify API integration
- Test error scenarios
- Verify loading states

**Component Tests**
- Test form validation
- Verify user interactions
- Test conditional rendering
- Verify prop handling

### Integration Tests

**Onboarding Flow Tests**
- Test complete 5-step flow
- Verify step transitions
- Test data persistence
- Verify completion state

**Team Management Tests**
- Test member invitation flow
- Verify invitation acceptance
- Test permission checks
- Verify member list updates

**Company Management Tests**
- Test company creation
- Verify company updates
- Test permission enforcement
- Verify data validation

### E2E Tests (Optional)

**Complete User Journey**
- Register → Verify → Create Company → Complete Onboarding
- Register → Verify → Accept Invitation → Access Tenant
- Login → Invite Members → Manage Company

## Routes and Navigation

### New Routes

```
/onboarding
  /onboarding/start          - Onboarding wizard entry
  /onboarding/step/[step]    - Individual step pages
  /onboarding/complete       - Completion page

/company
  /company/settings          - Company settings page
  /company/team              - Team management page
  /company/invitations       - Invitation management

/invitations
  /invitations/pending       - User's pending invitations
  /invitations/accept/[id]   - Accept invitation page
```

### Navigation Guards

**Onboarding Guard**
- Check if user has completed onboarding
- Redirect to onboarding if incomplete
- Allow access to tenant workspace if complete

**Permission Guard**
- Verify user role for protected actions
- Show permission denied for insufficient access
- Redirect to appropriate page

**Schema Guard**
- Detect current schema (public vs tenant)
- Redirect to correct URL if needed
- Show informative message

## Integration Points

### 1. Authentication Integration

- Use existing `AuthContext` for user and token management
- Leverage `getAccessToken()` for API calls
- Integrate with token refresh mechanism
- Use existing login/logout flows

### 2. Billing Integration

- Integrate with Stripe for payment setup (Step 3)
- Use existing billing API endpoints
- Handle subscription creation
- Manage trial period transitions

### 3. Dashboard Integration

- Check onboarding status on dashboard access
- Redirect to onboarding if incomplete
- Show tenant-specific data after onboarding
- Display trial status in dashboard

### 4. Profile Integration

- Link user profile to tenant membership
- Show tenant information in profile
- Allow switching between tenants (future)

## Security Considerations

### 1. Schema Isolation

- Enforce public schema for onboarding endpoints
- Validate schema on every request
- Prevent cross-schema data access
- Log schema violations

### 2. Role-Based Access Control

- Verify user role before sensitive operations
- Enforce owner/admin restrictions
- Validate role assignments
- Audit role changes

### 3. Invitation Security

- Validate invitation expiration (7 days)
- Verify email ownership
- Prevent duplicate invitations
- Log invitation acceptance

### 4. Data Validation

- Validate all input data
- Sanitize user inputs
- Enforce business rules
- Prevent injection attacks

### 5. Token Management

- Use existing token utilities
- Refresh tokens automatically
- Handle token expiration
- Secure token storage

## Performance Considerations

### 1. Data Caching

- Cache tenant data in context
- Cache member list with TTL
- Cache invitation checks
- Invalidate on updates

### 2. Lazy Loading

- Load components on demand
- Defer non-critical data
- Use React.lazy for routes
- Implement code splitting

### 3. Optimistic Updates

- Update UI immediately
- Revert on error
- Show loading states
- Provide feedback

### 4. API Optimization

- Batch related requests
- Use pagination for lists
- Implement debouncing
- Cache responses

## Accessibility

### 1. Keyboard Navigation

- Support tab navigation
- Provide keyboard shortcuts
- Focus management
- Skip links

### 2. Screen Reader Support

- Semantic HTML
- ARIA labels
- Live regions for updates
- Descriptive text

### 3. Visual Accessibility

- Color contrast compliance
- Focus indicators
- Error announcements
- Loading states

### 4. Form Accessibility

- Label associations
- Error descriptions
- Required field indicators
- Help text

## Deployment Considerations

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Build Configuration

- Ensure API URL is configurable
- Handle subdomain routing
- Configure CORS properly
- Set up error tracking

### Monitoring

- Track onboarding completion rates
- Monitor API errors
- Log schema violations
- Track invitation acceptance rates

## Future Enhancements

1. **Multi-Tenant Switching**
   - Allow users to belong to multiple tenants
   - Provide tenant switcher UI
   - Persist selected tenant

2. **Advanced Team Management**
   - Custom roles and permissions
   - Team hierarchies
   - Bulk member operations

3. **Onboarding Customization**
   - Skip optional steps
   - Custom step order
   - Industry-specific flows

4. **Enhanced Invitations**
   - Invitation templates
   - Bulk invitations
   - Invitation reminders

5. **Analytics Dashboard**
   - Onboarding metrics
   - Team growth tracking
   - Usage analytics
