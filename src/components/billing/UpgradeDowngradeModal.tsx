'use client';

import React, { useState } from 'react';
import { SubscriptionPlan } from '@/types/billing';
import { useBilling } from '@/contexts/BillingContext';
import { Modal } from '@/components/ui/Modal';

interface UpgradeDowngradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  currentBillingCycle: 'monthly' | 'yearly';
  onSuccess?: () => void;
}

export function UpgradeDowngradeModal({
  isOpen,
  onClose,
  currentPlan,
  newPlan,
  currentBillingCycle,
  onSuccess,
}: UpgradeDowngradeModalProps) {
  const { upgradeDowngrade } = useBilling();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeBillingCycle, setChangeBillingCycle] = useState(false);
  // Default to user's current billing cycle, allow toggling to the opposite
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>(currentBillingCycle);

  const isUpgrade = parseFloat(newPlan.price_monthly) > parseFloat(currentPlan.price_monthly);
  const actionText = isUpgrade ? 'Upgrade' : 'Downgrade';

  const currentPrice = currentBillingCycle === 'monthly' 
    ? currentPlan.price_monthly 
    : currentPlan.price_yearly;
  
  const newPrice = (changeBillingCycle ? selectedBillingCycle : currentBillingCycle) === 'monthly'
    ? newPlan.price_monthly
    : newPlan.price_yearly;

  const finalBillingCycle = changeBillingCycle ? selectedBillingCycle : currentBillingCycle;
  
  // Toggle billing cycle when checkbox changes
  const handleBillingCycleToggle = (checked: boolean) => {
    setChangeBillingCycle(checked);
    if (checked) {
      // Toggle to opposite of current cycle
      setSelectedBillingCycle(currentBillingCycle === 'monthly' ? 'yearly' : 'monthly');
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await upgradeDowngrade(newPlan.slug, changeBillingCycle ? finalBillingCycle : undefined);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={!isProcessing ? onClose : () => {}} size="lg" showCloseButton={!isProcessing}>
      <div className="px-6 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full mr-4 ${
              isUpgrade ? 'bg-gradient-to-br from-primary-light to-secondary-light' : 'bg-gradient-to-br from-yellow-100 to-orange-100'
            }`}>
              <svg className={`h-6 w-6 ${isUpgrade ? 'text-primary' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isUpgrade ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M7 13l5 5m0 0l5-5m-5 5V6"} />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {actionText} Your Plan
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isUpgrade ? 'Get more features and resources' : 'Adjust your subscription'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Plan Comparison */}
          <div className="space-y-4">
            {/* Current Plan */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Plan</div>
                  <div className="text-lg font-bold text-gray-900">{currentPlan.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">${currentPrice}</div>
                  <div className="text-xs text-gray-600">per {currentBillingCycle === 'monthly' ? 'month' : 'year'}</div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className={`p-2 rounded-full ${isUpgrade ? 'bg-primary-light' : 'bg-yellow-100'}`}>
                <svg className={`w-5 h-5 ${isUpgrade ? 'text-primary' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* New Plan */}
            <div className={`rounded-lg p-4 border-2 ${
              isUpgrade 
                ? 'bg-gradient-to-r from-primary-light to-secondary-light border-primary' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-semibold">New Plan</div>
                  <div className="text-lg font-bold text-gray-900">{newPlan.name}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isUpgrade ? 'text-primary' : 'text-yellow-600'}`}>
                    ${newPrice}
                  </div>
                  <div className="text-xs text-gray-600">per {finalBillingCycle === 'monthly' ? 'month' : 'year'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Cycle Option */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                id="change-cycle"
                checked={changeBillingCycle}
                onChange={(e) => handleBillingCycleToggle(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-semibold text-gray-900">
                  Change billing cycle to {currentBillingCycle === 'monthly' ? 'yearly' : 'monthly'}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {currentBillingCycle === 'monthly' 
                    ? 'Save 17% with annual billing' 
                    : 'Switch to monthly billing'}
                </div>
              </div>
            </label>
          </div>

          {/* Proration Notice */}
          <div className="bg-gradient-to-r from-secondary-light to-primary-light border border-secondary rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-secondary mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-900">
                <p className="font-semibold mb-1">Automatic Proration</p>
                <p>
                  {isUpgrade 
                    ? 'You\'ll be charged a prorated amount for the remainder of your billing period. Changes take effect immediately.'
                    : 'You\'ll receive a credit for the unused portion of your current plan applied to your next invoice.'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg ${
              isUpgrade 
                ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover focus:ring-primary' 
                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 focus:ring-yellow-500'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Confirm ${actionText}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
