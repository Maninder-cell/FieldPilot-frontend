'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  Tenant,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  TenantMember,
  InviteMemberRequest,
  Invitation,
  InvitationCheckResponse,
  OnboardingApiError,
} from '@/types/onboarding';
import {
  createCompany as createCompanyAPI,
  getCurrentTenant,
  updateTenant as updateTenantAPI,
  completeOnboardingStep,
  getTenantMembers as getTenantMembersAPI,
  inviteMember as inviteMemberAPI,
  getPendingInvitations as getPendingInvitationsAPI,
  checkInvitations as checkInvitationsAPI,
  acceptInvitation as acceptInvitationAPI,
  updateMemberRole as updateMemberRoleAPI,
  removeMember as removeMemberAPI,
  resendInvitation as resendInvitationAPI,
  revokeInvitation as revokeInvitationAPI,
} from '@/lib/onboarding-api';
import { getAccessToken } from '@/lib/token-utils';

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
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  loadPendingInvitations: () => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;

  // Invitation Management
  checkUserInvitations: () => Promise<void>;
  acceptInvite: (invitationId: string) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [userInvitations, setUserInvitations] = useState<InvitationCheckResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Cache flags to prevent redundant API calls
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [invitationsLoaded, setInvitationsLoaded] = useState(false);

  // Load tenant data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTenantData();
    } else {
      // Clear data when user logs out
      setTenant(null);
      setMembers([]);
      setPendingInvitations([]);
      setUserInvitations([]);
      setCurrentStep(1);
      setMembersLoaded(false);
      setInvitationsLoaded(false);
    }
  }, [isAuthenticated, user]);

  // Update current step when tenant data changes
  useEffect(() => {
    if (tenant) {
      setCurrentStep(tenant.onboarding_step);
    } else {
      // No tenant means user needs to create a company (step 1)
      setCurrentStep(1);
    }
  }, [tenant]);

  const loadTenantData = async () => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const tenantData = await getCurrentTenant(accessToken);
      setTenant(tenantData); // Will be null if no company exists
      
      // Store tenant slug with user data for API routing
      if (tenantData && user) {
        const { storeUserData } = await import('@/lib/token-utils');
        storeUserData({ ...user, tenant_slug: tenantData.slug });
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
      // Set tenant to null on error to trigger company creation flow
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompany = async (data: CreateCompanyRequest) => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const newTenant = await createCompanyAPI(data, accessToken);
      setTenant(newTenant);
      setCurrentStep(newTenant.onboarding_step);
      
      // Store tenant slug with user data for API routing
      if (user) {
        const { storeUserData } = await import('@/lib/token-utils');
        storeUserData({ ...user, tenant_slug: newTenant.slug });
      }
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCompany = async (data: UpdateCompanyRequest) => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const updatedTenant = await updateTenantAPI(data, accessToken);
      setTenant(updatedTenant);
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshTenant = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const tenantData = await getCurrentTenant(accessToken);
      setTenant(tenantData);
    } catch (error) {
      console.error('Error refreshing tenant:', error);
      throw error;
    }
  };

  const handleCompleteStep = async (step: number, data?: Record<string, any>) => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const updatedTenant = await completeOnboardingStep({ step, data }, accessToken);

      // Debug: Log the response from backend
      console.log('OnboardingContext - Step completed:', step);
      console.log('OnboardingContext - Updated tenant:', updatedTenant);
      console.log('OnboardingContext - Step data:', updatedTenant.step_data);

      setTenant(updatedTenant);

      // If the backend didn't advance the step, manually set it to next step
      let nextStep = updatedTenant.onboarding_step > step ? updatedTenant.onboarding_step : step + 1;

      // Cap at step 5 (completion step)
      if (nextStep > 5) {
        nextStep = 5;
      }

      setCurrentStep(nextStep);

      // Also update the tenant object with the correct step if backend didn't
      if (updatedTenant.onboarding_step === step) {
        setTenant({ ...updatedTenant, onboarding_step: nextStep });
      }
    } catch (error) {
      console.error('Error completing step:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  const handleLoadMembers = useCallback(async (force = false) => {
    // Skip if already loaded and not forcing refresh
    if (membersLoaded && !force) {
      return;
    }
    
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const membersData = await getTenantMembersAPI(accessToken);
      setMembers(membersData);
      setMembersLoaded(true);
    } catch (error) {
      console.error('Error loading members:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [membersLoaded]);

  const handleLoadPendingInvitations = useCallback(async (force = false) => {
    // Skip if already loaded and not forcing refresh
    if (invitationsLoaded && !force) {
      return;
    }
    
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const invitationsData = await getPendingInvitationsAPI(accessToken);
      setPendingInvitations(invitationsData);
      setInvitationsLoaded(true);
    } catch (error) {
      console.error('Error loading pending invitations:', error);
      throw error;
    }
  }, [invitationsLoaded]);

  const handleInviteTeamMember = useCallback(async (data: InviteMemberRequest) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      await inviteMemberAPI(data, accessToken);

      // Force refresh members and pending invitations after successful invite
      await handleLoadMembers(true);
      await handleLoadPendingInvitations(true);
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  }, [handleLoadMembers, handleLoadPendingInvitations]);

  const handleCheckUserInvitations = useCallback(async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const invitationsData = await checkInvitationsAPI(accessToken);
      setUserInvitations(invitationsData);
    } catch (error) {
      console.error('Error checking user invitations:', error);
      throw error;
    }
  }, []);

  const handleAcceptInvite = async (invitationId: string) => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      await acceptInvitationAPI(invitationId, accessToken);

      // Refresh tenant data and user invitations after accepting
      await handleRefreshTenant();
      await handleCheckUserInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMemberRole = useCallback(async (memberId: string, role: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    setIsLoading(true);
    try {
      await updateMemberRoleAPI(memberId, role, accessToken);
      // Force refresh members list after update
      await handleLoadMembers(true);
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleLoadMembers]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    setIsLoading(true);
    try {
      await removeMemberAPI(memberId, accessToken);
      // Force refresh members list after removal
      await handleLoadMembers(true);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleLoadMembers]);

  const handleResendInvitation = useCallback(async (invitationId: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    setIsLoading(true);
    try {
      await resendInvitationAPI(invitationId, accessToken);
      // Force refresh invitations list after resend
      await handleLoadPendingInvitations(true);
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleLoadPendingInvitations]);

  const handleRevokeInvitation = useCallback(async (invitationId: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    setIsLoading(true);
    try {
      await revokeInvitationAPI(invitationId, accessToken);
      // Force refresh invitations list after revoke
      await handleLoadPendingInvitations(true);
    } catch (error) {
      console.error('Error revoking invitation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleLoadPendingInvitations]);

  const value: OnboardingContextType = {
    // State
    tenant,
    members,
    pendingInvitations,
    userInvitations,
    isLoading,
    currentStep,

    // Company Management
    createCompany: handleCreateCompany,
    updateCompany: handleUpdateCompany,
    refreshTenant: handleRefreshTenant,

    // Onboarding Process
    completeStep: handleCompleteStep,
    goToStep: handleGoToStep,

    // Team Management
    loadMembers: handleLoadMembers,
    inviteTeamMember: handleInviteTeamMember,
    updateMemberRole: handleUpdateMemberRole,
    removeMember: handleRemoveMember,
    loadPendingInvitations: handleLoadPendingInvitations,
    resendInvitation: handleResendInvitation,
    revokeInvitation: handleRevokeInvitation,

    // Invitation Management
    checkUserInvitations: handleCheckUserInvitations,
    acceptInvite: handleAcceptInvite,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
