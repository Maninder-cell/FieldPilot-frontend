'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import RoleBadge from '../onboarding/RoleBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PendingInvitationsListSkeleton } from './PendingInvitationsListSkeleton';
import { Mail, Clock, User, MoreVertical, RefreshCw, XCircle } from 'lucide-react';

interface PendingInvitationsListProps {
  onInvitationUpdate?: () => void;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  is_valid: boolean;
}

export default function PendingInvitationsList({ onInvitationUpdate }: PendingInvitationsListProps) {
  const { pendingInvitations, loadPendingInvitations, resendInvitation, revokeInvitation, isLoading } = useOnboarding();
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
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

  const handleResendInvitation = async () => {
    if (!selectedInvitation) return;

    setActionLoading(true);
    try {
      await resendInvitation(selectedInvitation.id);
      setShowResendModal(false);
      setSelectedInvitation(null);
      if (onInvitationUpdate) onInvitationUpdate();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      alert(error.message || 'Failed to resend invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeInvitation = async () => {
    if (!selectedInvitation) return;

    setActionLoading(true);
    try {
      await revokeInvitation(selectedInvitation.id);
      setShowRevokeModal(false);
      setSelectedInvitation(null);
      if (onInvitationUpdate) onInvitationUpdate();
    } catch (error: any) {
      console.error('Error revoking invitation:', error);
      alert(error.message || 'Failed to revoke invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const openResendModal = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowResendModal(true);
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const openRevokeModal = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowRevokeModal(true);
    setOpenMenuId(null);
    setMenuPosition(null);
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

  if (isLoadingInvitations && !hasLoaded) {
    return <PendingInvitationsListSkeleton />;
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
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
                      !invitation.is_valid ? 'text-red-600 font-medium' : 'text-gray-900'
                    }`}>
                      {getTimeUntilExpiration(invitation.expires_at)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative inline-block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({
                          top: rect.bottom + window.scrollY + 8,
                          right: window.innerWidth - rect.right - window.scrollX
                        });
                        setOpenMenuId(openMenuId === invitation.id ? null : invitation.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {openMenuId === invitation.id && menuPosition && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => {
                            setOpenMenuId(null);
                            setMenuPosition(null);
                          }}
                        />
                        <div 
                          className="fixed z-50 w-56 rounded-lg shadow-xl bg-white ring-1 ring-gray-200 overflow-hidden"
                          style={{
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`
                          }}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => openResendModal(invitation)}
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4 mr-3" />
                              Resend Invitation
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                              onClick={() => openRevokeModal(invitation)}
                              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-3" />
                              Revoke Invitation
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {pendingInvitations.map((invitation) => (
          <div key={invitation.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center flex-1">
                <div className="bg-teal-100 rounded-full p-2 mr-3">
                  <Mail className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                  <p className="text-xs text-gray-500">Invited by {invitation.invited_by}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={invitation.role as any} size="sm" />
                <div className="relative inline-block">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuPosition({
                        top: rect.bottom + window.scrollY + 8,
                        right: window.innerWidth - rect.right - window.scrollX
                      });
                      setOpenMenuId(openMenuId === invitation.id ? null : invitation.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {openMenuId === invitation.id && menuPosition && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        }}
                      />
                      <div 
                        className="fixed z-50 w-56 rounded-lg shadow-xl bg-white ring-1 ring-gray-200 overflow-hidden"
                        style={{
                          top: `${menuPosition.top}px`,
                          right: `${menuPosition.right}px`
                        }}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => openResendModal(invitation)}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4 mr-3" />
                            Resend Invitation
                          </button>
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={() => openRevokeModal(invitation)}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-3" />
                            Revoke Invitation
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Sent</p>
                <p className="text-gray-900">{new Date(invitation.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className={`${
                  !invitation.is_valid ? 'text-red-600 font-medium' : 'text-gray-900'
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
          <strong>Note:</strong> Invitations expire after 7 days. You can resend expired invitations to extend the expiration date.
        </p>
      </div>

      {/* Resend Invitation Modal */}
      {showResendModal && selectedInvitation && (
        <ConfirmModal
          isOpen={showResendModal}
          onClose={() => {
            setShowResendModal(false);
            setSelectedInvitation(null);
          }}
          onConfirm={handleResendInvitation}
          title="Resend Invitation"
          message={`Resend the invitation to ${selectedInvitation.email}? This will extend the expiration date by 7 days.`}
          confirmText="Resend Invitation"
          cancelText="Cancel"
          variant="info"
          isProcessing={actionLoading}
        />
      )}

      {/* Revoke Invitation Modal */}
      {showRevokeModal && selectedInvitation && (
        <ConfirmModal
          isOpen={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            setSelectedInvitation(null);
          }}
          onConfirm={handleRevokeInvitation}
          title="Revoke Invitation"
          message={`Are you sure you want to revoke the invitation to ${selectedInvitation.email}? They will no longer be able to join using this invitation.`}
          confirmText="Revoke Invitation"
          cancelText="Cancel"
          variant="danger"
          isProcessing={actionLoading}
        />
      )}
    </div>
  );
}
