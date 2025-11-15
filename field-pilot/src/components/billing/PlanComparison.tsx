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
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <BillingCycleToggle
          selectedCycle={selectedBillingCycle}
          onCycleChange={setBillingCycle}
          yearlyDiscountPercentage={plans[0]?.yearly_discount_percentage || 17}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = showCurrentPlan && subscription?.plan.slug === plan.slug;
          const isRecommended = plan.slug === recommendedPlanSlug;
          const isProcessing = selectedPlanSlug === plan.slug && isLoading;

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
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
      <div className="text-center text-sm text-gray-600 mt-8">
        <p>All plans include a 14-day free trial. No credit card required to start.</p>
        <p className="mt-2">Need a custom plan? <a href="mailto:sales@fieldpilot.com" className="text-teal-600 hover:underline">Contact sales</a></p>
      </div>
    </div>
  );
}
