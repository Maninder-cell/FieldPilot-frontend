'use client';

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useBilling } from '@/contexts/BillingContext';
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
  const { completeStep, tenant } = useOnboarding();
  const { createNewSubscription, selectedBillingCycle, plans, loadPlans, subscription, loadSubscription } = useBilling();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  
  // Store plan selection in local state as fallback
  const [localPlanSlug, setLocalPlanSlug] = useState<string | null>(null);
  const [localPlanId, setLocalPlanId] = useState<string | null>(null);
  const [localBillingCycle, setLocalBillingCycle] = useState<'monthly' | 'yearly'>(selectedBillingCycle);

  // Load plan data from localStorage on mount
  useEffect(() => {
    const storedPlanSlug = localStorage.getItem('onboarding_plan_slug');
    const storedPlanId = localStorage.getItem('onboarding_plan_id');
    const storedBillingCycle = localStorage.getItem('onboarding_billing_cycle') as 'monthly' | 'yearly';
    
    if (storedPlanSlug) {
      setLocalPlanSlug(storedPlanSlug);
    }
    if (storedPlanId) {
      setLocalPlanId(storedPlanId);
    }
    if (storedBillingCycle) {
      setLocalBillingCycle(storedBillingCycle);
    }
    
    // Mark as initialized after loading from localStorage
    setIsInitialized(true);
  }, []);

  // Get selected plan from step 2 data or localStorage as fallback
  const selectedPlanSlug = tenant?.step_data?.plan_slug || localPlanSlug;
  const selectedPlanId = tenant?.step_data?.plan_id || localPlanId;
  const savedBillingCycle = tenant?.step_data?.billing_cycle || localBillingCycle || selectedBillingCycle;

  // Check if subscription already exists
  useEffect(() => {
    const checkExistingSubscription = async () => {
      try {
        setIsCheckingSubscription(true);
        await loadSubscription();
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsCheckingSubscription(false);
      }
    };
    
    checkExistingSubscription();
  }, [loadSubscription]);

  // Load plans if not already loaded
  useEffect(() => {
    if (plans.length === 0) {
      loadPlans();
    }
  }, [plans.length, loadPlans]);

  // Find the selected plan details
  const selectedPlan = plans.find(p => p.id === selectedPlanId || p.slug === selectedPlanSlug);

  const handlePaymentSuccess = async (paymentMethodId?: string) => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Validate payment method ID is provided
      if (!paymentMethodId) {
        setApiError('Payment method is required to continue');
        setIsSubmitting(false);
        return;
      }
      
      // Validate plan is selected
      if (!selectedPlanSlug) {
        setApiError('No plan selected. Please go back and select a plan.');
        setIsSubmitting(false);
        return;
      }
      
      // Create subscription with payment method using billing API
      await createNewSubscription(selectedPlanSlug, savedBillingCycle, paymentMethodId);
      
      // Complete step 3 with payment setup data (including plan info for persistence)
      await completeStep(3, { 
        plan_id: selectedPlanId,
        plan_slug: selectedPlanSlug,
        billing_cycle: savedBillingCycle,
        payment_completed: true,
        payment_method_added: true,
        payment_method_id: paymentMethodId,
        subscription_created: true
      });
      
      // Don't clear localStorage yet - keep it until onboarding is complete
      // This allows users to go back if needed
      
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

  const handleSkipPayment = async () => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Validate plan is selected
      if (!selectedPlanSlug) {
        setApiError('No plan selected. Please go back and select a plan.');
        setIsSubmitting(false);
        return;
      }
      
      // Create subscription without payment method (trial mode)
      await createNewSubscription(selectedPlanSlug, savedBillingCycle);
      
      // Complete step 3 without payment method (including plan info for persistence)
      await completeStep(3, { 
        plan_id: selectedPlanId,
        plan_slug: selectedPlanSlug,
        billing_cycle: savedBillingCycle,
        payment_completed: false,
        payment_method_added: false,
        subscription_created: true,
        trial_mode: true
      });
      
      // Don't clear localStorage yet - keep it until onboarding is complete
      // This allows users to go back if needed
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;
      setApiError(apiError.message || 'Failed to start trial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug info - show what data we have
  const debugInfo = {
    tenantStepData: tenant?.step_data,
    localPlanSlug,
    localBillingCycle,
    selectedPlanSlug,
    selectedPlanId,
    savedBillingCycle,
    selectedPlan: selectedPlan?.name,
    plansLoaded: plans.length,
  };

  // Show debug info in development
  useEffect(() => {
    console.log('PaymentSetupForm Debug:', debugInfo);
  }, [selectedPlanSlug, selectedPlanId, selectedPlan]);

  // Show loading state while initializing, checking subscription, or plans are loading
  if (!isInitialized || isCheckingSubscription || plans.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600">Loading payment setup...</p>
        </div>
      </div>
    );
  }

  // If subscription already exists, show success message and allow to continue
  if (subscription && subscription.is_active) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">Subscription Already Active</h3>
              <p className="text-sm text-green-800 mb-4">
                You already have an active subscription to the <strong>{subscription.plan.name}</strong> plan.
              </p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Plan:</p>
                    <p className="font-semibold text-gray-900">{subscription.plan.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Billing Cycle:</p>
                    <p className="font-semibold text-gray-900 capitalize">{subscription.billing_cycle}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-semibold text-green-600 capitalize">{subscription.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {subscription.is_trial ? 'Trial Ends:' : 'Next Billing:'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    // Complete step 3 with existing subscription info
                    await completeStep(3, { 
                      subscription_already_exists: true,
                      subscription_id: subscription.id,
                      plan_slug: subscription.plan.slug,
                      billing_cycle: subscription.billing_cycle,
                    });
                    if (onSuccess) {
                      onSuccess();
                    }
                  } catch (error) {
                    const apiError = error as OnboardingApiError;
                    setApiError(apiError.message || 'Failed to continue. Please try again.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Next Step →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no plan is selected after initialization
  if (!selectedPlanSlug && isInitialized) {
    return (
      <div className="space-y-6">
        <Alert 
          type="error" 
          message="No plan selected. Please go back to Step 2 and select a plan." 
        />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Debug Information:</h3>
          <pre className="text-xs text-yellow-800 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Subscription</h2>
        <p className="text-gray-600">
          Add your payment method to activate your subscription. You won't be charged during the trial period.
        </p>
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-5">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">{selectedPlan.name} Plan</div>
              <div className="text-sm text-gray-600 mt-1">
                {savedBillingCycle === 'monthly' ? 'Monthly' : 'Yearly'} billing
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-teal-600">
                ${savedBillingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                per {savedBillingCycle === 'monthly' ? 'month' : 'year'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trial Information */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="w-6 h-6 text-teal-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-teal-900 mb-2">Your 14-Day Free Trial</h3>
            <p className="text-sm text-teal-800 mb-2">
              Start your free trial today. Payment method is required but you won't be charged during the trial period.
            </p>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• No charges during trial period</li>
              <li>• Cancel anytime before trial ends</li>
              <li>• Full access to all features</li>
              <li>• Secure payment processing via Stripe</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 rounded-full p-3">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Add Payment Method
            </h3>
            <p className="text-sm text-gray-600">
              Required to activate your subscription
            </p>
          </div>
        </div>
        
        <StripeProvider>
          <PaymentMethodForm
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={undefined}
            showCancel={false}
            isProcessing={isSubmitting}
          />
        </StripeProvider>
      </div>

      {/* Security Notice */}
      <div className="flex items-start bg-gray-50 rounded-lg p-4">
        <Shield className="w-5 h-5 text-gray-600 mr-3 mt-0.5 shrink-0" />
        <div className="text-sm text-gray-700">
          <strong>Secure Payment Processing:</strong> All payment information is processed securely through Stripe. 
          We never store your credit card details on our servers.
        </div>
      </div>

      {/* Skip Payment Option */}
      {onSkip && (
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSkipPayment}
            disabled={isSubmitting}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now and start free trial →
          </button>
        </div>
      )}
    </div>
  );
}
