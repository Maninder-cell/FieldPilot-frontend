'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBilling } from '@/contexts/BillingContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlanComparison } from '@/components/billing/PlanComparison';
import { PaymentMethodForm } from '@/components/billing/PaymentMethodForm';
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

  const handlePaymentSuccess = async (paymentMethodId?: string) => {
    if (!selectedPlan) return;

    // Validate payment method ID is provided
    if (!paymentMethodId) {
      setError('Payment method is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create subscription with payment method ID for immediate charging
      await createNewSubscription(selectedPlan.slug, selectedBillingCycle, paymentMethodId);
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Page Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 px-4">
                Choose Your Plan
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
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
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-center justify-center min-h-screen px-4 py-6">
                {/* Background overlay */}
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => !isCreating && setShowPaymentForm(false)}
                />

                {/* Modal panel */}
                <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full z-10">
                  {/* Close button */}
                  <button
                    onClick={() => !isCreating && setShowPaymentForm(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isCreating}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="px-6 py-8 sm:px-8">
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Complete Your Subscription
                      </h3>
                      <p className="text-gray-600">
                        You've selected the <strong>{selectedPlan.name}</strong> plan
                      </p>
                    </div>

                    {/* Selected Plan Summary */}
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-5 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{selectedPlan.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedBillingCycle === 'monthly' ? 'Monthly' : 'Yearly'} billing
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold text-teal-600">
                            ${selectedBillingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            per {selectedBillingCycle === 'monthly' ? 'month' : 'year'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Form */}
                    <PaymentMethodForm
                      onSuccess={handlePaymentSuccess}
                      onError={(err) => setError(err)}
                      onCancel={() => setShowPaymentForm(false)}
                      showCancel={!isCreating}
                    />

                    {/* Skip Payment Option */}
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleSkipPayment}
                        disabled={isCreating}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Skip for now and start free trial →
                      </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
