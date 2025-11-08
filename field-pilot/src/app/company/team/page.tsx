'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MemberList from '@/components/onboarding/MemberList';
import InviteMemberForm from '@/components/onboarding/InviteMemberForm';
import PendingInvitationsList from '@/components/onboarding/PendingInvitationsList';

function TeamManagementContent() {
  const { user } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInvite = () => {
    setShowInviteForm(true);
  };

  const handleInviteSuccess = () => {
    setShowInviteForm(false);
    // The context will automatically refresh members and invitations
  };

  const handleInviteClose = () => {
    setShowInviteForm(false);
  };

  // Check if user has permission to view invitations (owner or admin)
  const canViewInvitations = user?.role === 'owner' || user?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
              <MemberList onInvite={handleInvite} />
            </div>
          )}

          {/* Pending Invitations (Owner/Admin only) */}
          {!showInviteForm && canViewInvitations && (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <PendingInvitationsList />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TeamManagementPage() {
  return (
    <ProtectedRoute requireOnboarding={true}>
      <TeamManagementContent />
    </ProtectedRoute>
  );
}
