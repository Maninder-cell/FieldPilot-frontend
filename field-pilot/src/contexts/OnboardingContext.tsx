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
  loadPendingInvitations: () => Promise<void>;

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

  const handleLoadMembers = async () => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const membersData = await getTenantMembersAPI(accessToken);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading members:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteTeamMember = async (data: InviteMemberRequest) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      await inviteMemberAPI(data, accessToken);

      // Refresh members and pending invitations after successful invite
      await handleLoadMembers();
      await handleLoadPendingInvitations();
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  };

  const handleLoadPendingInvitations = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const invitationsData = await getPendingInvitationsAPI(accessToken);
      setPendingInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading pending invitations:', error);
      throw error;
    }
  };

  const handleCheckUserInvitations = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');

      const invitationsData = await checkInvitationsAPI(accessToken);
      setUserInvitations(invitationsData);
    } catch (error) {
      console.error('Error checking user invitations:', error);
      throw error;
    }
  };

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
    loadPendingInvitations: handleLoadPendingInvitations,

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
