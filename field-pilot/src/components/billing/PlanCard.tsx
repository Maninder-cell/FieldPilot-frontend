'use client';

import React from 'react';
import { SubscriptionPlan } from '@/types/billing';

interface PlanCardProps {
  plan: SubscriptionPlan;
  previousPlan?: SubscriptionPlan | null;
  billingCycle: 'monthly' | 'yearly';
  isCurrentPlan?: boolean;
  isRecommended?: boolean;
  onSelect?: () => void;
  buttonText?: string;
  isLoading?: boolean;
}

export function PlanCard({
  plan,
  previousPlan,
  billingCycle,
  isCurrentPlan = false,
  isRecommended = false,
  onSelect,
  buttonText,
  isLoading = false,
}: PlanCardProps) {
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const pricePerMonth = billingCycle === 'yearly'
    ? (parseFloat(plan.price_yearly) / 12).toFixed(2)
    : price;

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
  const allFeatures = uniqueFeatures.map((key) => {
    // Convert snake_case to Title Case
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  });

  // Determine the previous plan name for "Everything in X, plus:" text
  const previousPlanText = previousPlan 
    ? `Everything in ${previousPlan.name}, plus:`
    : null;

  const defaultButtonText = isCurrentPlan
    ? 'Current Plan'
    : buttonText || 'Select Plan';

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-6 sm:p-8 flex flex-col h-full shadow-sm group ${
        isRecommended
          ? 'border-teal-500 shadow-xl z-10'
          : isCurrentPlan
          ? 'border-green-500 shadow-lg'
          : 'border-gray-200 hover:border-teal-300 hover:shadow-lg hover:-translate-y-1'
      } transition-all duration-200 ease-out`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            ⭐ RECOMMENDED
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            ✓ CURRENT PLAN
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3">{plan.name}</h3>
      
      {/* Plan Description */}
      <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 min-h-[2.5rem] sm:min-h-12">{plan.description}</p>

      {/* Pricing */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
        <div className="flex items-baseline flex-wrap">
          <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">${price}</span>
          <span className="text-gray-500 ml-2 text-base sm:text-lg">
            / {billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
        {billingCycle === 'yearly' && (
          <p className="text-xs sm:text-sm text-teal-600 font-medium mt-2">
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
            <strong className="text-gray-900">{plan.max_users ?? 'Unlimited'}</strong> users
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
        <div className="flex items-center text-xs sm:text-sm">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 sm:mr-3 shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-gray-700 break-words">
            <strong className="text-gray-900">{plan.max_api_calls_per_month ? plan.max_api_calls_per_month.toLocaleString() : 'Unlimited'}</strong> API calls/month
          </span>
        </div>
      </div>

      {/* Features */}
      {allFeatures.length > 0 && (
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
            {allFeatures.map((feature, index) => (
              <li key={index} className="flex items-start text-xs sm:text-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 mr-2 sm:mr-3 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Select Button */}
      {onSelect && (
        <button
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading}
          className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all transform sm:hover:scale-105 ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed hover:scale-100'
              : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            defaultButtonText
          )}
        </button>
      )}
    </div>
  );
}
