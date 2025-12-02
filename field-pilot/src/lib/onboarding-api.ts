// Onboarding API Client for FieldRino

import {
  Tenant,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompleteStepRequest,
  TenantMember,
  UserTenantMembership,
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
 * Get all tenant memberships for the current user
 * GET /api/v1/onboarding/profile/memberships/
 */
export async function getUserTenantMemberships(accessToken: string): Promise<UserTenantMembership[]> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<UserTenantMembership[]>>(
    '/onboarding/profile/memberships/',
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
 * POST /api/v1/onboarding/step/
 */
export async function completeOnboardingStep(
  data: CompleteStepRequest,
  accessToken: string
): Promise<Tenant> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<Tenant>>(
    '/onboarding/step/',
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
 * Get invitation details by token (Public - No auth required)
 * GET /api/v1/onboarding/invitations/{token}/
 */
export async function getInvitationByToken(
  token: string
): Promise<{
  id: string;
  email: string;
  tenant_name: string;
  role: string;
  invited_by: string | null;
  expires_at: string;
}> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<{
    id: string;
    email: string;
    tenant_name: string;
    role: string;
    invited_by: string | null;
    expires_at: string;
  }>>(
    `/onboarding/invitations/${token}/`,
    {
      method: 'GET',
    }
  );
  
  return response.data;
}

/**
 * Accept a pending invitation to join a tenant using token
 * POST /api/v1/onboarding/invitations/accept/{token}/
 */
export async function acceptInvitationByToken(
  token: string,
  accessToken: string
): Promise<{ tenant_name: string; role: string }> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<{ tenant_name: string; role: string }>>(
    `/onboarding/invitations/accept/${token}/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Accept a pending invitation to join a tenant (deprecated - use acceptInvitationByToken)
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

/**
 * Update a team member's role
 * PATCH /api/v1/onboarding/members/{member_id}/role/
 */
export async function updateMemberRole(
  memberId: string,
  role: string,
  accessToken: string
): Promise<TenantMember> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<TenantMember>>(
    `/onboarding/members/${memberId}/role/`,
    {
      method: 'PATCH',
      body: JSON.stringify({ role }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

/**
 * Remove a team member from the tenant
 * DELETE /api/v1/onboarding/members/{member_id}/remove/
 */
export async function removeMember(
  memberId: string,
  accessToken: string
): Promise<void> {
  await fetchOnboardingAPI<OnboardingApiResponse<void>>(
    `/onboarding/members/${memberId}/remove/`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

/**
 * Resend an invitation email
 * POST /api/v1/onboarding/invitations/{invitation_id}/resend/
 */
export async function resendInvitation(
  invitationId: string,
  accessToken: string
): Promise<void> {
  await fetchOnboardingAPI<OnboardingApiResponse<void>>(
    `/onboarding/invitations/${invitationId}/resend/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

/**
 * Revoke/cancel a pending invitation
 * DELETE /api/v1/onboarding/invitations/{invitation_id}/revoke/
 */
export async function revokeInvitation(
  invitationId: string,
  accessToken: string
): Promise<void> {
  await fetchOnboardingAPI<OnboardingApiResponse<void>>(
    `/onboarding/invitations/${invitationId}/revoke/`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

// ============================================================================
// Tenant Settings
// ============================================================================

/**
 * Get tenant settings
 * GET /api/v1/onboarding/settings/
 */
export async function getTenantSettings(accessToken: string): Promise<import('@/types/onboarding').TenantSettings> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<import('@/types/onboarding').TenantSettings>>(
    '/onboarding/settings/',
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
 * Update tenant settings
 * PUT /api/v1/onboarding/settings/
 */
export async function updateTenantSettings(
  data: import('@/types/onboarding').UpdateTenantSettingsRequest,
  accessToken: string
): Promise<import('@/types/onboarding').TenantSettings> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<import('@/types/onboarding').TenantSettings>>(
    '/onboarding/settings/',
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
// Technician Wage Rates (Phase 2)
// ============================================================================

/**
 * Get all technician wage rates
 * GET /api/v1/onboarding/technicians/wage-rates/
 */
export async function getTechnicianWageRates(accessToken: string): Promise<import('@/types/onboarding').TechnicianWageRate[]> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<import('@/types/onboarding').TechnicianWageRate[]>>(
    '/onboarding/technicians/wage-rates/',
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
 * Create a new technician wage rate
 * POST /api/v1/onboarding/technicians/wage-rates/create/
 */
export async function createTechnicianWageRate(
  data: import('@/types/onboarding').CreateTechnicianWageRateRequest,
  accessToken: string
): Promise<import('@/types/onboarding').TechnicianWageRate> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<import('@/types/onboarding').TechnicianWageRate>>(
    '/onboarding/technicians/wage-rates/create/',
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
 * Get a specific technician wage rate
 * GET /api/v1/onboarding/technicians/wage-rates/{rate_id}/
 */
export async function getTechnicianWageRate(
  rateId: string,
  accessToken: string
): Promise<import('@/types/onboarding').TechnicianWageRate> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<import('@/types/onboarding').TechnicianWageRate>>(
    `/onboarding/technicians/wage-rates/${rateId}/`,
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
 * Update a technician wage rate
 * PUT /api/v1/onboarding/technicians/wage-rates/{rate_id}/update/
 */
export async function updateTechnicianWageRate(
  rateId: string,
  data: Partial<import('@/types/onboarding').CreateTechnicianWageRateRequest>,
  accessToken: string
): Promise<import('@/types/onboarding').TechnicianWageRate> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<import('@/types/onboarding').TechnicianWageRate>>(
    `/onboarding/technicians/wage-rates/${rateId}/update/`,
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

/**
 * Delete a technician wage rate
 * DELETE /api/v1/onboarding/technicians/wage-rates/{rate_id}/delete/
 */
export async function deleteTechnicianWageRate(
  rateId: string,
  accessToken: string
): Promise<void> {
  await fetchOnboardingAPI<OnboardingApiResponse<void>>(
    `/onboarding/technicians/wage-rates/${rateId}/delete/`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

/**
 * Get wage rate history for a specific technician
 * GET /api/v1/onboarding/technicians/{technician_id}/wage-rates/history/
 */
export async function getTechnicianWageRateHistory(
  technicianId: string,
  accessToken: string
): Promise<import('@/types/onboarding').TechnicianWageRate[]> {
  const response = await fetchOnboardingAPI<OnboardingApiResponse<import('@/types/onboarding').TechnicianWageRate[]>>(
    `/onboarding/technicians/${technicianId}/wage-rates/history/`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}

// Export a single object with all API methods for easier imports
export const onboardingApi = {
  createCompany,
  getCurrentTenant,
  getUserTenantMemberships,
  updateTenant,
  completeOnboardingStep,
  getTenantMembers,
  inviteMember,
  getPendingInvitations,
  checkInvitations,
  getInvitationByToken,
  acceptInvitationByToken,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  resendInvitation,
  revokeInvitation,
  getTenantSettings,
  updateTenantSettings,
  getTechnicianWageRates,
  getTechnicianWageRate,
  createTechnicianWageRate,
  updateTechnicianWageRate,
  deleteTechnicianWageRate,
  getTechnicianWageRateHistory,
};
