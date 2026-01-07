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
  const [selectedReason, setSelectedReason] = useState<string>('');

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
      const feedbackText = selectedReason 
        ? `${selectedReason}${reason ? `: ${reason}` : ''}` 
        : reason || undefined;
      await cancelCurrentSubscription(cancelImmediately, feedbackText);
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

  const cancellationReasons = [
    { value: 'too_expensive', label: 'Too expensive', icon: '💰' },
    { value: 'not_using', label: 'Not using it enough', icon: '⏰' },
    { value: 'missing_features', label: 'Missing features I need', icon: '🔧' },
    { value: 'switching', label: 'Switching to another service', icon: '🔄' },
    { value: 'technical_issues', label: 'Technical issues', icon: '⚠️' },
    { value: 'other', label: 'Other reason', icon: '💭' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={!isProcessing ? onClose : () => {}} size="xl" showCloseButton={!isProcessing}>
      <div className="px-6 py-8 sm:px-10">
        {/* Emotional Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-orange-100 mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            We're Sad to See You Go
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Before you leave, we'd love to understand what went wrong and see if we can help
          </p>
        </div>

        <div className="space-y-6">
          {/* Current Plan Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Current Plan</div>
                <div className="text-xl font-bold text-gray-900">{subscription.plan.name}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${subscription.billing_cycle === 'monthly' ? subscription.plan.price_monthly : subscription.plan.price_yearly}
                </div>
                <div className="text-sm text-gray-600">
                  per {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              What's making you leave? 💔
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cancellationReasons.map((reasonOption) => (
                <button
                  key={reasonOption.value}
                  type="button"
                  onClick={() => setSelectedReason(reasonOption.value)}
                  className={`flex items-center p-4 border-2 rounded-lg text-left transition-all ${
                    selectedReason === reasonOption.value
                      ? 'border-primary bg-primary-light shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <span className="text-2xl mr-3">{reasonOption.icon}</span>
                  <span className={`text-sm font-medium ${
                    selectedReason === reasonOption.value ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {reasonOption.label}
                  </span>
                  {selectedReason === reasonOption.value && (
                    <svg className="w-5 h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Feedback */}
          <div>
            <label htmlFor="cancel-reason" className="block text-base font-bold text-gray-900 mb-2">
              Tell us more (optional)
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Your feedback helps us improve FieldPilot for everyone..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Cancellation Options */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">When would you like to cancel?</label>
            <div className="space-y-3">
              <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                !cancelImmediately ? 'border-primary bg-primary-light shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="cancel-option"
                  checked={!cancelImmediately}
                  onChange={() => setCancelImmediately(false)}
                  className="mt-1 h-5 w-5 text-primary focus:ring-primary border-gray-300"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <span className="text-base font-bold text-gray-900">
                      Cancel at period end
                    </span>
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1.5">
                    Keep access until {formatDate(
                      subscription.is_trial 
                        ? subscription.trial_end! 
                        : (subscription.current_period_end || subscription.trial_end!)
                    )}
                  </div>
                </div>
              </label>

              <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                cancelImmediately ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="cancel-option"
                  checked={cancelImmediately}
                  onChange={() => setCancelImmediately(true)}
                  className="mt-1 h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div className="ml-4 flex-1">
                  <div className="text-base font-bold text-gray-900">
                    Cancel immediately
                  </div>
                  <div className="text-sm text-red-600 mt-1.5 font-medium">
                    ⚠️ Lose access right away (no refund)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Impact Notice */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-base font-bold text-amber-900 mb-3">What happens after cancellation:</p>
                <ul className="space-y-2">
                  {cancelImmediately ? (
                    <>
                      <li className="flex items-start text-sm text-amber-900">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Immediate loss</strong> of access to all features</span>
                      </li>
                      <li className="flex items-start text-sm text-amber-900">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span><strong>No refund</strong> for remaining period</span>
                      </li>
                      <li className="flex items-start text-sm text-amber-900">
                        <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Data retained for <strong>30 days only</strong></span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start text-sm text-amber-900">
                        <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Continue using until <strong>{formatDate(
                          subscription.is_trial 
                            ? subscription.trial_end! 
                            : (subscription.current_period_end || subscription.trial_end!)
                        )}</strong></span>
                      </li>
                      <li className="flex items-start text-sm text-amber-900">
                        <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span><strong>No further charges</strong> after period ends</span>
                      </li>
                      <li className="flex items-start text-sm text-amber-900">
                        <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Can <strong>reactivate anytime</strong> before period ends</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-8 py-4 border-2 border-primary rounded-xl text-base font-bold text-primary bg-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Keep My Subscription
            </span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
