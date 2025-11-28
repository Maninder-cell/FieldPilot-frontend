'use client';

import React, { useEffect, useState } from 'react';
import { useBilling } from '@/contexts/BillingContext';
import { BillingCycleToggle } from './BillingCycleToggle';
import { PlanCard } from './PlanCard';
import { SubscriptionPlan } from '@/types/billing';

interface PlanComparisonProps {
  onPlanSelect?: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => void;
  showCurrentPlan?: boolean;
}

export function PlanComparison({ onPlanSelect, showCurrentPlan = true }: PlanComparisonProps) {
  const {
    plans,
    subscription,
    selectedBillingCycle,
    setBillingCycle,
    loadPlans,
    isLoading,
  } = useBilling();

  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);

  useEffect(() => {
    if (plans.length === 0) {
      loadPlans();
    }
  }, [plans.length, loadPlans]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlanSlug(plan.slug);
    if (onPlanSelect) {
      onPlanSelect(plan, selectedBillingCycle);
    }
  };

  // Determine which plan is recommended (usually the middle one)
  const recommendedPlanSlug = plans.length >= 2 ? plans[1].slug : null;

  if (isLoading && plans.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No subscription plans available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <BillingCycleToggle
          selectedCycle={selectedBillingCycle}
          onCycleChange={setBillingCycle}
          yearlyDiscountPercentage={plans[0]?.yearly_discount_percentage || 17}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const isCurrentPlan = showCurrentPlan && subscription?.plan.slug === plan.slug;
          // Don't show recommended badge on current plan
          const isRecommended = !isCurrentPlan && plan.slug === recommendedPlanSlug;
          const isProcessing = selectedPlanSlug === plan.slug && isLoading;
          
          // Get previous plan for feature comparison
          const previousPlan = index > 0 ? plans[index - 1] : null;

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              previousPlan={previousPlan}
              billingCycle={selectedBillingCycle}
              isCurrentPlan={isCurrentPlan}
              isRecommended={isRecommended}
              onSelect={() => handlePlanSelect(plan)}
              isLoading={isProcessing}
            />
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="text-center mt-8 sm:mt-12 space-y-4 px-4">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 sm:p-6 max-w-3xl mx-auto border border-teal-100">
          <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">
            🎉 All plans include a 14-day free trial
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            No credit card required to start. Cancel anytime.
          </p>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 px-4">
          Need a custom plan or have questions? {' '}
          <a href="mailto:sales@fieldrino.com" className="text-teal-600 hover:text-teal-700 font-semibold underline">
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
}
