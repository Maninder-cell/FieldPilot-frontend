'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import RoleBadge from './RoleBadge';
import { Mail, Clock, User } from 'lucide-react';

export default function PendingInvitationsList() {
  const { pendingInvitations, loadPendingInvitations, isLoading } = useOnboarding();
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only load if we haven't loaded yet
    if (!hasLoaded) {
      handleLoadInvitations();
    }
  }, [hasLoaded]);

  const handleLoadInvitations = async () => {
    try {
      setIsLoadingInvitations(true);
      await loadPendingInvitations();
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const getTimeUntilExpiration = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  // Only show loading spinner if we're actually loading and haven't loaded before
  if (isLoadingInvitations && !hasLoaded) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-sm text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
          <Mail className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">No pending invitations</h3>
        <p className="text-sm text-gray-600">
          All invited members have joined or invitations have expired
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Invitations ({pendingInvitations.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Team members who have been invited but haven't joined yet
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invited By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingInvitations.map((invitation) => (
              <tr key={invitation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {invitation.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={invitation.role as any} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    {invitation.invited_by}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(invitation.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className={`${
                      !invitation.is_valid ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {getTimeUntilExpiration(invitation.expires_at)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {pendingInvitations.map((invitation) => (
          <div key={invitation.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-teal-100 rounded-full p-2 mr-3">
                  <Mail className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                  <p className="text-xs text-gray-500">Invited by {invitation.invited_by}</p>
                </div>
              </div>
              <RoleBadge role={invitation.role as any} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Sent</p>
                <p className="text-gray-900">{new Date(invitation.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className={`${
                  !invitation.is_valid ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {getTimeUntilExpiration(invitation.expires_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Invitations expire after 7 days. Expired invitations will need to be resent.
        </p>
      </div>
    </div>
  );
}
