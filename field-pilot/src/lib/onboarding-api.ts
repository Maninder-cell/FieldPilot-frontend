// Onboarding API Client for FieldRino

import {
  Tenant,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompleteStepRequest,
  TenantMember,
  InviteMemberRequest,
  Invitation,
  InvitationCheckResponse,
  OnboardingApiResponse,
  OnboardingApiError,
} from '@/types/onboarding';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Generic fetch wrapper with error handling for onboarding endpoints
 */
async function fetchOnboardingAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle backend error structure
      const error: OnboardingApiError = {
        status: response.status,
        message: data.error?.message || data.message || 'An error occurred',
        details: data.error?.details || data.details,
        code: data.error?.code || data.code,
      };
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw OnboardingApiError as-is
    if ((error as OnboardingApiError).status) {
      throw error;
    }
    
    // Handle network errors
    throw {
      status: 0,
      message: 'Network error. Please check your connection and try again.',
    } as OnboardingApiError;
  }
}

// ============================================================================
// Company/Tenant Management
// ============================================================================

/**
 * Create a new company/tenant
 * POST /api/v1/onboarding/create/
 */
export async function createCompany(
  data: CreateCompanyRequest,
  accessToken: string
): Promise<Tenant> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<Tenant>>(
    '/onboarding/create/',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Get current user's tenant/company information
 * GET /api/v1/onboarding/current/
 */
export async function getCurrentTenant(accessToken: string): Promise<Tenant | null> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<Tenant | null>>(
    '/onboarding/current/',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Update tenant/company information
 * PUT /api/v1/onboarding/update/
 */
export async function updateTenant(
  data: UpdateCompanyRequest,
  accessToken: string
): Promise<Tenant> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<Tenant>>(
    '/onboarding/update/',
    {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

// ============================================================================
// Onboarding Process
// ============================================================================

/**
 * Complete an onboarding step
 * POST /api/v1/onboarding/onboarding/step/
 */
export async function completeOnboardingStep(
  data: CompleteStepRequest,
  accessToken: string
): Promise<Tenant> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<Tenant>>(
    '/onboarding/onboarding/step/',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

// ============================================================================
// Team Members
// ============================================================================

/**
 * Get list of all members in the tenant
 * GET /api/v1/onboarding/members/
 */
export async function getTenantMembers(accessToken: string): Promise<TenantMember[]> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<TenantMember[]>>(
    '/onboarding/members/',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Invite a new member to the tenant
 * POST /api/v1/onboarding/members/invite/
 */
export async function inviteMember(
  data: InviteMemberRequest,
  accessToken: string
): Promise<void> {
  await fetchOnboardingAPI<OnboardingApiResponse<void>>(
    '/onboarding/members/invite/',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

// ============================================================================
// Invitations
// ============================================================================

/**
 * Get list of pending invitations for the tenant (Owner/Admin only)
 * GET /api/v1/onboarding/invitations/pending/
 */
export async function getPendingInvitations(accessToken: string): Promise<Invitation[]> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<Invitation[]>>(
    '/onboarding/invitations/pending/',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Check if there are pending invitations for the current user's email
 * GET /api/v1/onboarding/invitations/check/
 */
export async function checkInvitations(accessToken: string): Promise<InvitationCheckResponse[]> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<InvitationCheckResponse[]>>(
    '/onboarding/invitations/check/',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Accept a pending invitation to join a tenant
 * POST /api/v1/onboarding/invitations/{invitation_id}/accept/
 */
export async function acceptInvitation(
  invitationId: string,
  accessToken: string
): Promise<{ tenant_name: string; role: string }> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<{ tenant_name: string; role: string }>>(
    `/onboarding/invitations/${invitationId}/accept/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}
