'use client';

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Check } from 'lucide-react';
import { getSubscriptionPlans } from '@/lib/api';
import { SubscriptionPlan } from '@/types/landing';
import { OnboardingApiError } from '@/types/onboarding';

interface PlanSelectionFormProps {
  onSuccess?: () => void;
}

export default function PlanSelectionForm({ onSuccess }: PlanSelectionFormProps) {
  const { completeStep, isLoading: contextLoading } = useOnboarding();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const plansData = await getSubscriptionPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
      setApiError('Failed to load subscription plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlanId) {
      setApiError('Please select a plan to continue');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      await completeStep(2, {
        plan_id: selectedPlanId,
        billing_cycle: billingCycle,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;
      setApiError(apiError.message || 'Failed to save plan selection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'monthly' 
      ? parseFloat(plan.price_monthly)
      : parseFloat(plan.price_yearly) / 12;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (billingCycle === 'yearly' && plan.yearly_discount_percentage) {
      return Math.round(plan.yearly_discount_percentage);
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="text-gray-600">
          Select the plan that best fits your needs. You can change or cancel anytime.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <button
          type="button"
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'monthly'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'yearly'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Yearly
          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
            Save up to 17%
          </span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isRecommended = plan.slug === 'professional';
          const price = getPrice(plan);
          const savings = getSavings(plan);

          return (
            <div
              key={plan.id}
              className={`
                relative rounded-lg border-2 p-6 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-teal-600 bg-teal-50 shadow-lg' 
                  : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                }
                ${isRecommended ? 'ring-2 ring-teal-600' : ''}
              `}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="bg-teal-600 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${price.toFixed(0)}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>

                {billingCycle === 'yearly' && savings > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Save {savings}% with annual billing
                  </div>
                )}

                <ul className="space-y-3">
                  {Object.entries(plan.features)
                    .filter(([_, enabled]) => enabled)
                    .map(([feature, _], index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </li>
                    ))}
                </ul>

                {plan.max_users && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Up to {plan.max_users} users
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trial Notice */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <p className="text-sm text-teal-800">
          <strong>14-day free trial included!</strong> Your trial starts now. You won't be charged until after the trial period ends.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting || contextLoading}
          disabled={!selectedPlanId || isSubmitting || contextLoading}
        >
          Continue to Payment Setup
        </Button>
      </div>
    </form>
  );
}
