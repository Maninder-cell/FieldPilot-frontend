'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TeamMemberList from '@/components/team/TeamMemberList';
import InviteMemberForm from '@/components/onboarding/InviteMemberForm';
import PendingInvitationsList from '@/components/team/PendingInvitationsList';

function TeamManagementContent() {
  const { user } = useAuth();
  const { members } = useOnboarding();
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInvite = () => {
    setShowInviteForm(true);
  };

  const handleInviteSuccess = () => {
    setShowInviteForm(false);
    // Data will be refreshed automatically by the components
  };

  const handleInviteClose = () => {
    setShowInviteForm(false);
  };

  const handleMemberUpdate = () => {
    // Data will be refreshed automatically by the components
  };

  // Find current user's member record to get their tenant-specific role
  const currentUserMember = members.find(m => m.user.id === user?.id);
  const userTenantRole = currentUserMember?.role;
  
  // Check if user has permission to manage team (owner, admin, or manager)
  const canManageTeam = userTenantRole === 'owner' || userTenantRole === 'admin' || userTenantRole === 'manager';

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your team members, roles, and invitations
            </p>
          </div>

          {/* Invite Form Modal/Section */}
          {showInviteForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <InviteMemberForm
                onSuccess={handleInviteSuccess}
                onClose={handleInviteClose}
              />
            </div>
          )}

          {/* Member List */}
          {!showInviteForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <TeamMemberList 
                onInvite={handleInvite}
                onMemberUpdate={handleMemberUpdate}
              />
            </div>
          )}

          {/* Pending Invitations (Owner/Admin only) */}
          {!showInviteForm && canManageTeam && (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <PendingInvitationsList 
                onInvitationUpdate={handleMemberUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TeamManagementPage() {
  return (
    <ProtectedRoute>
      <TeamManagementContent />
    </ProtectedRoute>
  );
}
