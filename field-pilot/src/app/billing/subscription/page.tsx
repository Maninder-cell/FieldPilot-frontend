'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useBilling } from '@/contexts/BillingContext';
import { SubscriptionOverview } from '@/components/billing/SubscriptionOverview';
import { PlanComparison } from '@/components/billing/PlanComparison';
import { CancelSubscriptionModal } from '@/components/billing/CancelSubscriptionModal';
import { UpgradeDowngradeModal } from '@/components/billing/UpgradeDowngradeModal';
import { SubscriptionPlan } from '@/types/billing';

export default function SubscriptionManagementPage() {
  const { subscription, loadSubscription, reactivateSubscription, isLoading } = useBilling();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (subscription && plan.slug !== subscription.plan.slug) {
      setSelectedPlan(plan);
      setShowUpgradeModal(true);
    }
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      await reactivateSubscription();
      await loadSubscription();
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
