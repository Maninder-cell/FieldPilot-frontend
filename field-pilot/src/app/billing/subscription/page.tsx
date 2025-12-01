'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBilling } from '@/contexts/BillingContext';
import { SubscriptionOverview } from '@/components/billing/SubscriptionOverview';
import { PlanComparison } from '@/components/billing/PlanComparison';
import { CancelSubscriptionModal } from '@/components/billing/CancelSubscriptionModal';
import { UpgradeDowngradeModal } from '@/components/billing/UpgradeDowngradeModal';
import { SubscriptionPlan } from '@/types/billing';

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const { subscription, plans, loadSubscription, loadPlans, reactivateSubscription, isLoading } = useBilling();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);
  const [hasProcessedUrlParams, setHasProcessedUrlParams] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, [loadSubscription, loadPlans]);

  // Reset flag when URL params change
  useEffect(() => {
    setHasProcessedUrlParams(false);
  }, [searchParams]);

  // Handle URL query parameters for automatic upgrade modal
  useEffect(() => {
    const upgradePlanSlug = searchParams.get('upgrade');
    const cycleParam = searchParams.get('cycle') as 'monthly' | 'yearly' | null;
    
    if (upgradePlanSlug && subscription && plans.length > 0 && !hasProcessedUrlParams) {
      const planToUpgrade = plans.find(p => p.slug === upgradePlanSlug);
      if (planToUpgrade && planToUpgrade.slug !== subscription.plan.slug) {
        setSelectedPlan(planToUpgrade);
        // If cycle is specified in URL and different from current, pre-check the toggle
        if (cycleParam && cycleParam !== subscription.billing_cycle) {
          // This will be handled by the modal's initial state
        }
        setShowUpgradeModal(true);
        setHasProcessedUrlParams(true);
      }
    }
  }, [searchParams, subscription, plans, hasProcessedUrlParams]);

  const handlePlanSelect = (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => {
    if (subscription && plan.slug !== subscription.plan.slug) {
      setSelectedPlan(plan);
      setShowUpgradeModal(true);
    }
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    setError(null);
    try {
      await reactivateSubscription();
      await loadSubscription();
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to reactivate subscription');
    } finally {
      setIsReactivating(false);
    }
  };

  const handleModalSuccess = () => {
    loadSubscription();
  };

  if (isLoading && !subscription) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // If no subscription, redirect to plans page
  if (!isLoading && !subscription) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">You need an active subscription to manage it</p>
              <Link
                href="/billing/plans"
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Subscription</h1>
          <p className="mt-2 text-gray-600">
            View your current plan and upgrade or downgrade as needed
          </p>
        </div>

        {/* Current Subscription */}
        <div className="mb-8">
          <SubscriptionOverview
            subscription={subscription}
            onCancel={() => setShowCancelModal(true)}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Reactivate Button */}
        {subscription?.cancel_at_period_end && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Reactivate Your Subscription
                </h3>
                <p className="text-sm text-green-700">
                  Your subscription is set to cancel. Reactivate to continue enjoying all features.
                </p>
              </div>
              <button
                onClick={handleReactivate}
                disabled={isReactivating}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isReactivating ? 'Reactivating...' : 'Reactivate'}
              </button>
            </div>
          </div>
        )}

        {/* Available Plans */}
        {!subscription?.cancel_at_period_end && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Plans</h2>
              <p className="mt-2 text-gray-600">
                Choose a plan that fits your needs. Changes take effect immediately with proration.
              </p>
            </div>
            <PlanComparison
              onPlanSelect={handlePlanSelect}
              showCurrentPlan={true}
            />
          </div>
        )}

        {/* Modals */}
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={handleModalSuccess}
        />

        {subscription && selectedPlan && (
          <UpgradeDowngradeModal
            isOpen={showUpgradeModal}
            onClose={() => {
              setShowUpgradeModal(false);
              setSelectedPlan(null);
            }}
            currentPlan={subscription.plan}
            newPlan={selectedPlan}
            currentBillingCycle={subscription.billing_cycle}
            onSuccess={handleModalSuccess}
          />
        )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function SubscriptionManagementPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
