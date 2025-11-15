'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBilling } from '@/contexts/BillingContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlanComparison } from '@/components/billing/PlanComparison';
import { PaymentMethodForm } from '@/components/billing/PaymentMethodForm';
import { StripeProvider } from '@/components/billing/StripeProvider';
import { SubscriptionPlan } from '@/types/billing';

export default function PlansPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { subscription, createNewSubscription } = useBilling();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanSelect = (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/billing/plans`);
      return;
    }

    if (subscription) {
      // Already has subscription, redirect to subscription management
      router.push('/billing/subscription');
      return;
    }

    setSelectedPlan(plan);
    setSelectedBillingCycle(billingCycle);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return;

    setIsCreating(true);
    setError(null);

    try {
      // Payment method is already saved, now create subscription
      await createNewSubscription(selectedPlan.slug, selectedBillingCycle);
      router.push('/billing/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
      setIsCreating(false);
    }
  };

  const handleSkipPayment = async () => {
    if (!selectedPlan) return;

    setIsCreating(true);
    setError(null);

    try {
      // Create subscription without payment method (trial)
      await createNewSubscription(selectedPlan.slug, selectedBillingCycle);
      router.push('/billing/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      {/* Plan Comparison */}
      {!showPaymentForm && (
        <PlanComparison
          onPlanSelect={handlePlanSelect}
          showCurrentPlan={false}
        />
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => !isCreating && setShowPaymentForm(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Subscription
                  </h3>
                  <p className="text-gray-600">
                    You've selected the <strong>{selectedPlan.name}</strong> plan
                  </p>
                </div>

                {/* Selected Plan Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">{selectedPlan.name}</div>
                      <div className="text-sm text-gray-600">
                        {selectedBillingCycle === 'monthly' ? 'Monthly' : 'Yearly'} billing
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${selectedBillingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly}
                      </div>
                      <div className="text-sm text-gray-600">
                        per {selectedBillingCycle === 'monthly' ? 'month' : 'year'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <StripeProvider>
                  <PaymentMethodForm
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => setError(err)}
                    onCancel={() => setShowPaymentForm(false)}
                    showCancel={!isCreating}
                  />
                </StripeProvider>

                {/* Skip Payment Option */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleSkipPayment}
                    disabled={isCreating}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip for now and start free trial
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
