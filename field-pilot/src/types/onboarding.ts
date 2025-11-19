// TypeScript interfaces for FieldRino Onboarding and Tenant Management

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
  role: 'owner' | 'admin' | 'manager' | 'employee';
  is_active: boolean;
  joined_at: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'employee';
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

// Constants
export const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
] as const;

export const ROLE_OPTIONS = [
  {
    value: 'owner' as const,
    label: 'Owner',
    description: 'Full access, can manage billing and delete company',
  },
  {
    value: 'admin' as const,
    label: 'Admin',
    description: 'Can manage members, settings, and all operations except billing',
  },
  {
    value: 'manager' as const,
    label: 'Manager',
    description: 'Can manage team members and projects',
  },
  {
    value: 'employee' as const,
    label: 'Employee',
    description: 'Basic access to assigned features',
  },
] as const;

export type MemberRole = 'owner' | 'admin' | 'manager' | 'employee';

// Role permissions helper
export const ROLE_PERMISSIONS = {
  owner: ['all'],
  admin: ['manage_members', 'manage_settings', 'view_all'],
  manager: ['manage_team', 'manage_projects', 'view_assigned'],
  employee: ['view_assigned'],
} as const;
