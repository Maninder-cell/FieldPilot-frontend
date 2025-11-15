'use client';

import React from 'react';
import { SubscriptionPlan } from '@/types/billing';

interface PlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  isCurrentPlan?: boolean;
  isRecommended?: boolean;
  onSelect?: () => void;
  buttonText?: string;
  isLoading?: boolean;
}

export function PlanCard({
  plan,
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

  // Convert features object to array
  const features = Object.entries(plan.features)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => {
      // Convert snake_case to Title Case
      return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    });

  const defaultButtonText = isCurrentPlan
    ? 'Current Plan'
    : buttonText || 'Select Plan';

  return (
    <div
      className={`relative bg-white rounded-lg border-2 p-6 flex flex-col ${
        isRecommended
          ? 'border-blue-500 shadow-lg'
          : isCurrentPlan
          ? 'border-green-500'
          : 'border-gray-200 hover:border-gray-300'
      } transition-all`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            CURRENT PLAN
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
      
      {/* Plan Description */}
      <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

      {/* Pricing */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600 ml-2">
            / {billingCycle === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        {billingCycle === 'yearly' && (
          <p className="text-sm text-gray-500 mt-1">
            ${pricePerMonth}/month billed annually
          </p>
        )}
      </div>

      {/* Resource Limits */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center text-sm">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-gray-700">
            <strong>{plan.max_users}</strong> users
          </span>
        </div>
        <div className="flex items-center text-sm">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-gray-700">
            <strong>{plan.max_equipment}</strong> equipment
          </span>
        </div>
        <div className="flex items-center text-sm">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <span className="text-gray-700">
            <strong>{plan.max_storage_gb} GB</strong> storage
          </span>
        </div>
        <div className="flex items-center text-sm">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-700">
            <strong>{plan.max_api_calls_per_month.toLocaleString()}</strong> API calls/month
          </span>
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-6 flex-grow">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Features:</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
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
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : isRecommended
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
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
