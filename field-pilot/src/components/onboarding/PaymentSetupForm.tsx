'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useBilling } from '@/contexts/BillingContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { CreditCard, Shield } from 'lucide-react';
import { OnboardingApiError } from '@/types/onboarding';
import { PaymentMethodForm } from '@/components/billing/PaymentMethodForm';
import { StripeProvider } from '@/components/billing/StripeProvider';

interface PaymentSetupFormProps {
  onSuccess?: () => void;
  onSkip?: () => void;
}

export default function PaymentSetupForm({ onSuccess, onSkip }: PaymentSetupFormProps) {
  const { completeStep, isLoading: contextLoading, tenant } = useOnboarding();
  const { createNewSubscription, selectedBillingCycle } = useBilling();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Get selected plan from step 2 data
  const selectedPlanSlug = (tenant?.onboarding_step ?? 0) >= 2 
    ? (tenant as any).step_data?.plan_slug 
    : null;

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Create subscription without payment method (trial mode)
      if (selectedPlanSlug) {
        await createNewSubscription(selectedPlanSlug, selectedBillingCycle);
      }
      
      // Complete step 3 without payment setup
      await completeStep(3, { skipped: true });
      
      if (onSkip) {
        onSkip();
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;
      setApiError(apiError.message || 'Failed to skip payment setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Create subscription with payment method
      if (selectedPlanSlug) {
        await createNewSubscription(selectedPlanSlug, selectedBillingCycle);
      }
      
      // Complete step 3 with payment setup
      await completeStep(3, { payment_completed: true });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;
      setApiError(apiError.message || 'Failed to complete payment setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setApiError(error);
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Payment Setup</h2>
        <p className="text-gray-600">
          Add your payment method to continue after your trial ends. You won't be charged during the trial period.
        </p>
      </div>

      {/* Trial Information */}
      {tenant && tenant.is_trial_active && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-teal-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-teal-900 mb-2">Your 14-Day Free Trial</h3>
              <p className="text-sm text-teal-800 mb-2">
                Your trial is active until {new Date(tenant.trial_ends_at).toLocaleDateString()}. 
                You can add payment details now or skip and add them later.
              </p>
              <ul className="text-sm text-teal-800 space-y-1">
                <li>• No charges during trial period</li>
                <li>• Cancel anytime before trial ends</li>
                <li>• Full access to all features</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {!showPaymentForm ? (
        <div className="border-2 border-gray-200 rounded-lg p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-blue-100 rounded-full p-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add Payment Method
              </h3>
              <p className="text-gray-600">
                Securely add your payment details to continue after your trial ends.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setShowPaymentForm(true)}
              disabled={isSubmitting || contextLoading}
            >
              Add Payment Method
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <StripeProvider>
            <PaymentMethodForm
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setShowPaymentForm(false)}
              showCancel={true}
            />
          </StripeProvider>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start bg-gray-50 rounded-lg p-4">
        <Shield className="w-5 h-5 text-gray-600 mr-3 mt-0.5 shrink-0" />
        <div className="text-sm text-gray-700">
          <strong>Secure Payment Processing:</strong> All payment information is processed securely through Stripe. 
          We never store your credit card details on our servers.
        </div>
      </div>

      {/* Action Buttons */}
      {!showPaymentForm && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleSkip}
            loading={isSubmitting || contextLoading}
            disabled={isSubmitting || contextLoading}
          >
            Skip for Now
          </Button>
        </div>
      )}

      <p className="text-xs text-center text-gray-500">
        You can add payment details later from your account settings
      </p>
    </div>
  );
}
