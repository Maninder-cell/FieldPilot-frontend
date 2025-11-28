'use client';

import React, { useState } from 'react';
import { useBilling } from '@/contexts/BillingContext';
import { Modal } from '@/components/ui/Modal';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: CancelSubscriptionModalProps) {
  const { cancelCurrentSubscription, subscription } = useBilling();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [reason, setReason] = useState('');

  if (!subscription) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await cancelCurrentSubscription(cancelImmediately, reason || undefined);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
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
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mr-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Cancel Subscription
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                We're sorry to see you go
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Current Plan Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Plan</div>
                <div className="text-lg font-bold text-gray-900">{subscription.plan.name}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${subscription.billing_cycle === 'monthly' ? subscription.plan.price_monthly : subscription.plan.price_yearly}
                </div>
                <div className="text-xs text-gray-600">
                  per {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Options */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-3 block">When would you like to cancel?</label>
            <div className="space-y-3">
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !cancelImmediately ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="cancel-option"
                  checked={!cancelImmediately}
                  onChange={() => setCancelImmediately(false)}
                  className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    Cancel at period end (Recommended)
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Keep access until {formatDate(
                      subscription.is_trial 
                        ? subscription.trial_end! 
                        : (subscription.current_period_end || subscription.trial_end!)
                    )}
                  </div>
                </div>
              </label>

              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                cancelImmediately ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="cancel-option"
                  checked={cancelImmediately}
                  onChange={() => setCancelImmediately(true)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    Cancel immediately
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Lose access right away (no refund)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="cancel-reason" className="block text-sm font-semibold text-gray-900 mb-2">
              Help us improve (optional)
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us why you're canceling..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Impact Notice */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-yellow-900">
                <p className="font-semibold mb-2">What happens after cancellation:</p>
                <ul className="space-y-1.5">
                  {cancelImmediately ? (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Immediate loss of access to all features</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>No refund for remaining period</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Data will be retained for 30 days</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Continue using until {formatDate(
                          subscription.is_trial 
                            ? subscription.trial_end! 
                            : (subscription.current_period_end || subscription.trial_end!)
                        )}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>No further charges</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Can reactivate anytime before period ends</span>
                      </li>
                    </>
                  )}
                </ul>
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
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Keep Subscription
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
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
              'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
