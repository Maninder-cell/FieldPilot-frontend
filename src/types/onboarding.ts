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
  step_data?: {
    plan_id?: string;
    plan_slug?: string;
    billing_cycle?: 'monthly' | 'yearly';
    payment_completed?: boolean;
    payment_method_added?: boolean;
    payment_method_id?: string;
    subscription_created?: boolean;
    trial_mode?: boolean;
    [key: string]: any;
  };
}

// Tenant Settings Types
export interface TenantSettings {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  features_enabled: Record<string, any>;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  timezone: string;
  language: string;
  date_format: string;
  business_hours: Record<string, any>;
  custom_fields: Record<string, any>;
  integrations: Record<string, any>;
  // Wage and Working Hours Settings (Phase 1)
  normal_working_hours_per_day: string;
  default_normal_hourly_rate: string;
  default_overtime_hourly_rate: string;
  overtime_multiplier: string;
  currency: string;
}

export interface UpdateTenantSettingsRequest {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  features_enabled?: Record<string, any>;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  timezone?: string;
  language?: string;
  date_format?: string;
  business_hours?: Record<string, any>;
  custom_fields?: Record<string, any>;
  integrations?: Record<string, any>;
  // Wage and Working Hours Settings
  normal_working_hours_per_day?: number;
  default_normal_hourly_rate?: number;
  default_overtime_hourly_rate?: number;
  overtime_multiplier?: number;
  currency?: string;
}

// Technician Wage Rate Types (Phase 2)
export interface TechnicianWageRate {
  id: string;
  technician: string;
  technician_name: string;
  technician_email: string;
  normal_hourly_rate: string;
  overtime_hourly_rate: string;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  notes: string;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTechnicianWageRateRequest {
  technician: string;
  normal_hourly_rate: number;
  overtime_hourly_rate: number;
  effective_from: string;
  effective_to?: string;
  notes?: string;
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
  role: MemberRole;
  is_active: boolean;
  joined_at: string;
}

export interface UserTenantMembership {
  id: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  role: string;
  employee_id: string;
  department: string | null;
  job_title: string | null;
  phone: string | null;
  joined_at: string;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
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
  token: string;  // Token needed for accepting invitation
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

// All available member roles (must match backend ROLE_CHOICES)
export type MemberRole = 'owner' | 'admin' | 'manager' | 'employee' | 'technician' | 'customer';

// Role options for dropdowns and forms
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
  {
    value: 'technician' as const,
    label: 'Technician',
    description: 'Field technician with access to tasks and time tracking',
  },
  {
    value: 'customer' as const,
    label: 'Customer',
    description: 'External customer with limited access to their data',
  },
] as const;

// Role permissions helper
export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: ['all'],
  admin: ['manage_members', 'manage_settings', 'view_all'],
  manager: ['manage_team', 'manage_projects', 'view_assigned'],
  employee: ['view_assigned'],
  technician: ['view_tasks', 'log_time', 'update_status'],
  customer: ['view_own_data'],
};

// Helper function to get role label
export const getRoleLabel = (role: MemberRole): string => {
  const option = ROLE_OPTIONS.find(opt => opt.value === role);
  return option?.label || role;
};

// Helper function to get role description
export const getRoleDescription = (role: MemberRole): string => {
  const option = ROLE_OPTIONS.find(opt => opt.value === role);
  return option?.description || '';
};

// Helper function to check if role has permission
export const hasPermission = (role: MemberRole, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes('all') || permissions.includes(permission);
};

// Helper function to check if role is admin level (owner or admin)
export const isAdminRole = (role: MemberRole): boolean => {
  return role === 'owner' || role === 'admin';
};

// Helper function to check if role is manager level or above
export const isManagerRole = (role: MemberRole): boolean => {
  return role === 'owner' || role === 'admin' || role === 'manager';
};
