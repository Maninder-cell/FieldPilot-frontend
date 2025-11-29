'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useBilling } from '@/contexts/BillingContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { User, Mail, Phone, Briefcase, CreditCard, AlertCircle, TrendingUp, Building2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

function DashboardContent() {
  const { user } = useAuth();
  const { tenant, isLoading, checkUserInvitations, userInvitations, acceptInvite, members, loadMembers } = useOnboarding();
  const { subscription, billingOverview, loadBillingOverview } = useBilling();
  const [showInvitationPrompt, setShowInvitationPrompt] = React.useState(false);
  
  // Get user's role from tenant membership (not from user.role which is the base role)
  const currentUserMembership = members.find(m => m.user.id === user?.id);
  const userRole = currentUserMembership?.role || null;

  // Load members when tenant exists to determine user's actual role
  React.useEffect(() => {
    if (tenant && members.length === 0 && !isLoading) {
      loadMembers().catch(console.error);
    }
  }, [tenant, members.length, isLoading, loadMembers]);

  // Check for pending invitations when user has no tenant
  React.useEffect(() => {
    if (user && !tenant && !isLoading) {
      checkUserInvitations().catch(console.error);
    }
  }, [user, tenant, isLoading, checkUserInvitations]);

  // Show invitation prompt if user has pending invitations and no tenant
  React.useEffect(() => {
    if (!tenant && userInvitations && userInvitations.length > 0) {
      setShowInvitationPrompt(true);
    } else {
      setShowInvitationPrompt(false);
    }
  }, [tenant, userInvitations]);

  // Load billing data when component mounts
  React.useEffect(() => {
    if (user && tenant?.onboarding_completed) {
      loadBillingOverview();
    }
  }, [user, tenant?.onboarding_completed, loadBillingOverview]);

  if (!user) return null;

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show invitation prompt if user has pending invitations
  if (showInvitationPrompt && userInvitations && userInvitations.length > 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white text-center">
                You Have Pending Invitations!
              </h1>
              <p className="text-emerald-50 text-center mt-2">
                You've been invited to join {userInvitations.length === 1 ? 'a team' : 'teams'} on FieldPilot
              </p>
            </div>

            {/* Invitations List */}
            <div className="p-8">
              <div className="space-y-4 mb-6">
                {userInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="border-2 border-emerald-200 rounded-lg p-6 bg-emerald-50 hover:border-emerald-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {invitation.tenant_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Role: <span className="font-semibold capitalize">{invitation.role}</span>
                            </p>
                          </div>
                        </div>
                        {invitation.invited_by && (
                          <p className="text-sm text-gray-600 mb-2">
                            Invited by: <span className="font-medium">{invitation.invited_by}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(invitation.expires_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={async () => {
                          try {
                            await acceptInvite(invitation.id);
                            // Refresh to show dashboard with new tenant
                            window.location.reload();
                          } catch (error: any) {
                            alert(error.message || 'Failed to accept invitation');
                          }
                        }}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Option to create own company */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600 text-center mb-4">
                  Or, if you prefer to create your own company:
                </p>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowInvitationPrompt(false)}
                >
                  Create My Own Company
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show onboarding wizard only if:
  // 1. No tenant exists (user needs to create a company), OR
  // 2. User is the owner AND onboarding is not completed
  // Users who joined via invitation should skip onboarding
  const shouldShowOnboarding = !tenant || (userRole === 'owner' && tenant && !tenant.onboarding_completed);
  
  if (shouldShowOnboarding) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OnboardingWizard />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.first_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Welcome message for invited users */}
        {tenant && !tenant.onboarding_completed && userRole && userRole !== 'owner' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900">
                  Welcome to {tenant.name}!
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  You've successfully joined the team. The company owner is still completing the setup process. You'll have full access once setup is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Alert - Trial Ending Soon */}
        {subscription?.is_trial && subscription?.days_until_renewal <= 7 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-900">
                  Trial Ending Soon
                </h3>
                <p className="text-sm text-orange-800 mt-1">
                  Your trial ends in {subscription.days_until_renewal} days. Add a payment method to continue using all features.
                </p>
                <Link
                  href="/billing/payment-methods"
                  className="inline-block mt-2 text-sm font-medium text-orange-700 hover:text-orange-800 underline"
                >
                  Add Payment Method →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Company Info Card */}
        {tenant && (
          <div className="bg-linear-to-r from-teal-50 to-cyan-50 rounded-lg shadow-sm border border-teal-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Your Company
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Company Name</p>
                <p className="text-base text-gray-900 font-semibold">{tenant.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{tenant.company_email}</p>
              </div>
              {tenant.company_phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">{tenant.company_phone}</p>
                </div>
              )}
              {tenant.industry && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="text-base text-gray-900">{tenant.industry}</p>
                </div>
              )}
              {tenant.is_trial_active && (
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg p-4 border border-teal-300">
                    <p className="text-sm font-medium text-blue-900">
                      🎉 Free Trial Active
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your trial ends on {new Date(tenant.trial_ends_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Widget */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Subscription & Usage</h3>
              <Link
                href="/billing/dashboard"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View Details →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Plan */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">Current Plan</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{subscription.plan.name}</p>
                <p className="text-sm text-blue-700">
                  ${subscription.billing_cycle === 'monthly' ? subscription.plan.price_monthly : subscription.plan.price_yearly}/
                  {subscription.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                </p>
              </div>

              {/* Usage Summary */}
              {billingOverview?.usage_summary?.users && billingOverview?.usage_summary?.storage && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Users</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {billingOverview.usage_summary.users.current} / {billingOverview.usage_summary.users.limit}
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (billingOverview.usage_summary.users.percentage ?? 0) >= 80 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(billingOverview.usage_summary.users.percentage ?? 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Storage</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {billingOverview.usage_summary.storage.current} / {billingOverview.usage_summary.storage.limit} GB
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (billingOverview.usage_summary.storage.percentage ?? 0) >= 80 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(billingOverview.usage_summary.storage.percentage ?? 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Your Profile
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Full Name</span>
                </div>
                <p className="text-base text-gray-900">{user.full_name}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Email</span>
              </div>
              <p className="text-base text-gray-900">{user.email}</p>
              {user.is_verified && (
                <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                  Verified
                </span>
              )}
            </div>

            {user.phone && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Phone</span>
                </div>
                <p className="text-base text-gray-900">{user.phone}</p>
              </div>
            )}

            {userRole && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Role</span>
                </div>
                <p className="text-base text-gray-900 capitalize">{userRole}</p>
                {user.employee_id && (
                  <p className="text-sm text-gray-500 mt-1">
                    Employee ID: {user.employee_id}
                  </p>
                )}
              </div>
            )}

            {(user.department || user.job_title) && (
              <div className="border-t border-gray-200 pt-4">
                {user.job_title && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-500">Job Title</span>
                    <p className="text-base text-gray-900">{user.job_title}</p>
                  </div>
                )}
                {user.department && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Department</span>
                    <p className="text-base text-gray-900">{user.department}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
