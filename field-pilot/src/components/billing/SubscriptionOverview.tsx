'use client';

import React from 'react';
import Link from 'next/link';
import { Subscription } from '@/types/billing';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';

interface SubscriptionOverviewProps {
  subscription: Subscription | null;
  onUpgrade?: () => void;
  onChangeBillingCycle?: () => void;
  onCancel?: () => void;
}

export function SubscriptionOverview({
  subscription,
  onUpgrade,
  onChangeBillingCycle,
  onCancel,
}: SubscriptionOverviewProps) {
  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">Choose a plan to get started with FieldRino</p>
          <Link
            href="/billing/plans"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const price = subscription.billing_cycle === 'monthly'
    ? subscription.plan.price_monthly
    : subscription.plan.price_yearly;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{subscription.plan.name}</h2>
            <SubscriptionStatusBadge status={subscription.status} />
          </div>
          <p className="text-gray-600">{subscription.plan.description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">${price}</div>
          <div className="text-sm text-gray-500">
            per {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
          </div>
        </div>
      </div>

      {/* Trial Information */}
      {subscription.is_trial && subscription.trial_end && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-teal-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-teal-900">Trial Period Active</p>
              <p className="text-sm text-teal-700">
                Your trial ends on {formatDate(subscription.trial_end)}. Add a payment method to continue after trial.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Notice */}
      {subscription.cancel_at_period_end && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-900">Subscription Ending</p>
              <p className="text-sm text-yellow-700">
                Your subscription will be canceled on {formatDate(
                  subscription.is_trial 
                    ? subscription.trial_end! 
                    : (subscription.current_period_end || subscription.trial_end!)
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600 mb-1">Billing Cycle</div>
          <div className="text-lg font-semibold text-gray-900 capitalize">
            {subscription.billing_cycle}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600 mb-1">
            {subscription.is_trial ? 'Trial Ends' : 'Next Renewal'}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {subscription.cancel_at_period_end 
              ? 'N/A' 
              : formatDate(
                  subscription.is_trial 
                    ? subscription.trial_end! 
                    : (subscription.current_period_end || subscription.trial_end!)
                )}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600 mb-1">
            {subscription.is_trial ? 'Days Left in Trial' : 'Days Until Renewal'}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {subscription.cancel_at_period_end ? 'N/A' : `${subscription.days_until_renewal} days`}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Upgrade Plan
          </button>
        )}
        {onChangeBillingCycle && !subscription.cancel_at_period_end && (
          <button
            onClick={onChangeBillingCycle}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Change Billing Cycle
          </button>
        )}
        {onCancel && !subscription.cancel_at_period_end && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            Cancel Subscription
          </button>
        )}
        {subscription.cancel_at_period_end && (
          <Link
            href="/billing/subscription"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Reactivate Subscription
          </Link>
        )}
      </div>
    </div>
  );
}
