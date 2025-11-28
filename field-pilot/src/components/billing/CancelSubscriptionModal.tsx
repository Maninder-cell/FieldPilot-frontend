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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cancel Subscription
                </h3>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    We're sorry to see you go. Please let us know how we can improve.
                  </p>

                  {/* Current Plan Info */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm text-gray-600 mb-1">Current Plan</div>
                    <div className="font-semibold text-gray-900">{subscription.plan.name}</div>
                    <div className="text-sm text-gray-600">
                      ${subscription.billing_cycle === 'monthly' ? subscription.plan.price_monthly : subscription.plan.price_yearly}/
                      {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                    </div>
                  </div>

                  {/* Cancellation Options */}
                  <div className="space-y-3">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="cancel-option"
                        checked={!cancelImmediately}
                        onChange={() => setCancelImmediately(false)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          Cancel at period end
                        </div>
                        <div className="text-sm text-gray-600">
                          Keep access until {formatDate(
                            subscription.is_trial 
                              ? subscription.trial_end! 
                              : (subscription.current_period_end || subscription.trial_end!)
                          )}
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="cancel-option"
                        checked={cancelImmediately}
                        onChange={() => setCancelImmediately(true)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          Cancel immediately
                        </div>
                        <div className="text-sm text-gray-600">
                          Lose access right away (no refund)
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Reason */}
                  <div>
                    <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for canceling (optional)
                    </label>
                    <textarea
                      id="cancel-reason"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Help us improve by sharing your feedback..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Impact Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">What happens after cancellation:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          {cancelImmediately ? (
                            <>
                              <li>Immediate loss of access to all features</li>
                              <li>No refund for remaining period</li>
                              <li>Data will be retained for 30 days</li>
                            </>
                          ) : (
                            <>
                              <li>Continue using until {formatDate(
                                subscription.is_trial 
                                  ? subscription.trial_end! 
                                  : (subscription.current_period_end || subscription.trial_end!)
                              )}</li>
                              <li>No further charges</li>
                              <li>Can reactivate anytime before period ends</li>
                            </>
                          )}
                        </ul>
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
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep Subscription
            </button>
          </div>
    </Modal>
  );
}
