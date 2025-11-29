'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { getInvitationByToken, acceptInvitationByToken } from '@/lib/onboarding-api';
import { getAccessToken } from '@/lib/token-utils';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Mail, Building2, UserCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { isAuthenticated, isLoading: authLoading, user, refreshUserData } = useAuth();
  const { refreshTenant } = useOnboarding();

  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const data = await getInvitationByToken(token);
        setInvitation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invitation');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invitations/accept/${token}`);
      return;
    }

    // Check if logged-in email matches invitation email
    if (user?.email !== invitation?.email) {
      setError(`This invitation is for ${invitation?.email}. Please log in with that email address.`);
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        router.push(`/login?redirect=/invitations/accept/${token}`);
        return;
      }

      await acceptInvitationByToken(token, accessToken);
      setSuccess(true);

      // Refresh user data to get updated role
      try {
        await refreshUserData();
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }

      // Refresh tenant data to load the new company membership
      try {
        await refreshTenant();
      } catch (refreshError) {
        console.error('Failed to refresh tenant data:', refreshError);
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRegister = () => {
    router.push(`/register?email=${encodeURIComponent(invitation.email)}&redirect=/invitations/accept/${token}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              variant="primary"
              onClick={() => router.push('/login')}
              fullWidth
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h1>
            <p className="text-gray-600 mb-2">
              You've successfully joined <span className="font-semibold text-emerald-600">{invitation.tenant_name}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center">
            You're Invited!
          </h1>
          <p className="text-emerald-50 text-center mt-2">
            Join your team on FieldPilot
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6">
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            </div>
          )}

          {/* Invitation Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-lg font-semibold text-gray-900">{invitation.tenant_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{invitation.role}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Invited Email</p>
                <p className="text-lg font-semibold text-gray-900">{invitation.email}</p>
              </div>
            </div>

            {invitation.invited_by && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Invited By</p>
                  <p className="text-lg font-semibold text-gray-900">{invitation.invited_by}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-700">Invitation Expires</p>
                <p className="text-lg font-semibold text-amber-900">
                  {new Date(invitation.expires_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAuthenticated ? (
            user?.email === invitation.email ? (
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAccept}
                  loading={isAccepting}
                  disabled={isAccepting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {isAccepting ? 'Accepting...' : 'Accept Invitation'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/dashboard')}
                  disabled={isAccepting}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert
                  type="warning"
                  message={`You're logged in as ${user?.email}. Please log out and log in with ${invitation.email} to accept this invitation.`}
                />
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/login')}
                >
                  Log in with Different Account
                </Button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 text-center">
                  To accept this invitation, you need to log in or create an account with <span className="font-semibold">{invitation.email}</span>
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push(`/login?redirect=/invitations/accept/${token}`)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Log In to Accept
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleRegister}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
