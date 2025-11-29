'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import RoleBadge from './RoleBadge';
import { Mail, Building, User, Calendar, CheckCircle } from 'lucide-react';
import { OnboardingApiError } from '@/types/onboarding';

export default function InvitationAcceptance() {
  const router = useRouter();
  const { userInvitations, checkUserInvitations, acceptInvite, isLoading } = useOnboarding();
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    handleCheckInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckInvitations = async () => {
    try {
      setIsLoadingInvitations(true);
      await checkUserInvitations();
    } catch (error) {
      console.error('Error checking invitations:', error);
      setApiError('Failed to load invitations. Please try again.');
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const handleAccept = async (invitationId: string, tenantName: string) => {
    try {
      setAcceptingId(invitationId);
      setApiError(null);
      
      await acceptInvite(invitationId);
      
      // Show success and redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      const apiError = error as OnboardingApiError;
      setApiError(apiError.message || 'Failed to accept invitation. Please try again.');
      setAcceptingId(null);
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
    return `${diffDays} days left`;
  };

  if (isLoadingInvitations || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  if (userInvitations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Mail className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
        <p className="text-gray-600 mb-6">
          You don't have any pending invitations at the moment
        </p>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pending Invitations</h2>
        <p className="text-gray-600 mt-1">
          You have {userInvitations.length} invitation{userInvitations.length !== 1 ? 's' : ''} to join {userInvitations.length !== 1 ? 'companies' : 'a company'}
        </p>
      </div>

      <div className="space-y-4">
        {userInvitations.map((invitation) => {
          const isExpired = new Date(invitation.expires_at) < new Date();
          const isAccepting = acceptingId === invitation.id;

          return (
            <div
              key={invitation.id}
              className={`bg-white border-2 rounded-lg p-6 transition-all ${
                isExpired ? 'border-red-200 bg-red-50' : 'border-teal-200 hover:border-teal-300'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-teal-100 rounded-full p-3 mr-4">
                      <Building className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invitation.tenant_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Invited you to join their team
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={invitation.role as any} size="md" />
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-600">Invited by</p>
                      <p className="font-medium text-gray-900">{invitation.invited_by}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-600">Sent on</p>
                      <p className="font-medium text-gray-900">
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expiration Warning */}
                {!isExpired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>⏰ {getTimeUntilExpiration(invitation.expires_at)}</strong> - 
                      Accept soon before this invitation expires
                    </p>
                  </div>
                )}

                {isExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>❌ This invitation has expired</strong> - 
                      Please contact {invitation.invited_by} to resend the invitation
                    </p>
                  </div>
                )}

                {/* Actions */}
                {!isExpired && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => handleAccept(invitation.id, invitation.tenant_name)}
                      loading={isAccepting}
                      disabled={isAccepting}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept Invitation
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <p className="text-sm text-teal-800">
          <strong>Note:</strong> Accepting an invitation will add you to the company's team with the specified role. 
          You'll be able to access their workspace and collaborate with other team members.
        </p>
      </div>
    </div>
  );
}
