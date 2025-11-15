'use client';

import React, { useState } from 'react';
import { SubscriptionPlan } from '@/types/billing';
import { useBilling } from '@/contexts/BillingContext';

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
  const { upgradeDowngrade, selectedBillingCycle } = useBilling();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeBillingCycle, setChangeBillingCycle] = useState(false);

  if (!isOpen) return null;

  const isUpgrade = parseFloat(newPlan.price_monthly) > parseFloat(currentPlan.price_monthly);
  const actionText = isUpgrade ? 'Upgrade' : 'Downgrade';

  const currentPrice = currentBillingCycle === 'monthly' 
    ? currentPlan.price_monthly 
    : currentPlan.price_yearly;
  
  const newPrice = (changeBillingCycle ? selectedBillingCycle : currentBillingCycle) === 'monthly'
    ? newPlan.price_monthly
    : newPlan.price_yearly;

  const finalBillingCycle = changeBillingCycle ? selectedBillingCycle : currentBillingCycle;

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isUpgrade ? 'bg-blue-100' : 'bg-yellow-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                <svg className={`h-6 w-6 ${isUpgrade ? 'text-blue-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isUpgrade ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M7 13l5 5m0 0l5-5m-5 5V6"} />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {actionText} Subscription
                </h3>
                <div className="mt-4 space-y-4">
                  {/* Current Plan */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm text-gray-600 mb-1">Current Plan</div>
                    <div className="font-semibold text-gray-900">{currentPlan.name}</div>
                    <div className="text-sm text-gray-600">
                      ${currentPrice}/{currentBillingCycle === 'monthly' ? 'month' : 'year'}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* New Plan */}
                  <div className={`rounded-md p-3 ${isUpgrade ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="text-sm text-gray-600 mb-1">New Plan</div>
                    <div className="font-semibold text-gray-900">{newPlan.name}</div>
                    <div className="text-sm text-gray-600">
                      ${newPrice}/{finalBillingCycle === 'monthly' ? 'month' : 'year'}
                    </div>
                  </div>

                  {/* Billing Cycle Option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="change-cycle"
                      checked={changeBillingCycle}
                      onChange={(e) => setChangeBillingCycle(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="change-cycle" className="ml-2 block text-sm text-gray-700">
                      Also change billing cycle to {selectedBillingCycle}
                    </label>
                  </div>

                  {/* Proration Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Proration Applied</p>
                        <p className="mt-1">
                          {isUpgrade 
                            ? 'You will be charged a prorated amount for the remainder of your billing period.'
                            : 'You will receive a credit for the unused portion of your current plan.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                isUpgrade ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-600 hover:bg-yellow-700'
              } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isUpgrade ? 'focus:ring-blue-500' : 'focus:ring-yellow-500'
              } sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? 'Processing...' : `Confirm ${actionText}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
