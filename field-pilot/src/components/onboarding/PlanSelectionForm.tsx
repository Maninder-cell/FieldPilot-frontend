'use client';

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useBilling } from '@/contexts/BillingContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { getSubscriptionPlans } from '@/lib/api';
import { SubscriptionPlan } from '@/types/landing';
import { OnboardingApiError } from '@/types/onboarding';

interface PlanSelectionFormProps {
  onSuccess?: () => void;
}

export default function PlanSelectionForm({ onSuccess }: PlanSelectionFormProps) {
  const { completeStep, isLoading: contextLoading } = useOnboarding();
  const { setBillingCycle: setGlobalBillingCycle } = useBilling();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
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

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setApiError('Please select a plan to continue');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Save billing cycle to global context for step 3
      setGlobalBillingCycle(billingCycle);
      
      // Save plan selection to localStorage as backup
      localStorage.setItem('onboarding_plan_slug', selectedPlan.slug);
      localStorage.setItem('onboarding_plan_id', selectedPlan.id);
      localStorage.setItem('onboarding_billing_cycle', billingCycle);
      
      // Complete step 2 with plan selection
      await completeStep(2, {
        plan_id: selectedPlan.id,
        plan_slug: selectedPlan.slug,
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
      ? plan.price_monthly
      : plan.price_yearly;
  };

  const getPricePerMonth = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly'
      ? (parseFloat(plan.price_yearly) / 12).toFixed(2)
      : plan.price_monthly;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      {/* Page Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Choose Your Plan
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your needs. You can change or cancel anytime.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
          </button>
          
          {plans[0]?.yearly_discount_percentage && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
              Save up to {Math.round(plans[0].yearly_discount_percentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan?.id === plan.id;
          const isRecommended = index === 1; // Middle plan is recommended
          const price = getPrice(plan);
          const pricePerMonth = getPricePerMonth(plan);
          
          // Get previous plan for feature comparison
          const previousPlan = index > 0 ? plans[index - 1] : null;
          
          // Get all features for current plan
          const currentPlanFeatures = Object.keys(plan.features).filter(key => plan.features[key]);
          
          // Get features from previous plan (if exists)
          const previousPlanFeatures = previousPlan 
            ? Object.keys(previousPlan.features).filter(key => previousPlan.features[key])
            : [];

          // Filter to show only NEW features (not in previous plan)
          const uniqueFeatures = previousPlan
            ? currentPlanFeatures.filter(feature => !previousPlanFeatures.includes(feature))
            : currentPlanFeatures;

          // Convert features to display format
          const displayFeatures = uniqueFeatures.map((key) => {
            return key.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          });

          const previousPlanText = previousPlan 
            ? `Everything in ${previousPlan.name}, plus:`
            : null;

          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`relative bg-white rounded-2xl border-2 p-6 sm:p-8 flex flex-col h-full shadow-sm cursor-pointer group ${
                isRecommended
                  ? 'border-teal-500 shadow-xl z-10'
                  : isSelected
                  ? 'border-teal-600 shadow-lg'
                  : 'border-gray-200 hover:border-teal-300 hover:shadow-lg hover:-translate-y-1'
              } transition-all duration-200 ease-out`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    RECOMMENDED
                  </span>
                </div>
              )}

              {/* Selected Badge */}
              {isSelected && !isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    ✓ SELECTED
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">{plan.name}</h3>
              
              {/* Plan Description */}
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 min-h-[2.5rem] sm:min-h-12">{plan.description}</p>

              {/* Pricing */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
                <div className="flex items-baseline flex-wrap gap-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 break-all">${price}</span>
                  <span className="text-gray-500 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                    / {billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-xs sm:text-sm text-teal-600 font-medium mt-2 break-words">
                    ${pricePerMonth}/month when billed annually
                  </p>
                )}
              </div>

              {/* Resource Limits */}
              <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3 bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center text-xs sm:text-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 sm:mr-3 shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">Up to {plan.max_users ?? 'Unlimited'}</strong> users
                  </span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 sm:mr-3 shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">{plan.max_equipment ?? 'Unlimited'}</strong> equipment
                  </span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 sm:mr-3 shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">{plan.max_storage_gb ? `${plan.max_storage_gb} GB` : 'Unlimited'}</strong> storage
                  </span>
                </div>
              </div>

              {/* Features */}
              {displayFeatures.length > 0 && (
                <div className="mb-6 sm:mb-8 flex-1 flex flex-col">
                  {previousPlanText ? (
                    <div className="mb-4 sm:mb-5">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-blue-50 px-3 py-2 rounded-lg border border-teal-200">
                        <svg className="w-4 h-4 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {previousPlanText}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wide">
                      What's Included:
                    </h4>
                  )}
                  <ul className="space-y-2 sm:space-y-3 flex-1">
                    {displayFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs sm:text-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 mr-2 sm:mr-3 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trial Notice */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-teal-100">
        <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">
          🎉 All plans include a 14-day free trial
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          Payment details required in next step.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting || contextLoading}
          disabled={!selectedPlan || isSubmitting || contextLoading}
        >
          Continue to Payment Setup
        </Button>
      </div>
    </form>
  );
}
