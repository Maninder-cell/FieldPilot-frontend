'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import StepIndicator from './StepIndicator';
import CompanyInfoForm from './CompanyInfoForm';
import PlanSelectionForm from './PlanSelectionForm';
import PaymentSetupForm from './PaymentSetupForm';
import TeamInvitationForm from './TeamInvitationForm';
import OnboardingComplete from './OnboardingComplete';

export default function OnboardingWizard() {
  const router = useRouter();
  const { currentStep, tenant, isLoading, goToStep } = useOnboarding();

  useEffect(() => {
    // Redirect to dashboard if onboarding is already completed
    if (tenant && tenant.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [tenant, router]);

  const handleStepSuccess = () => {
    // The context will automatically update currentStep when completeStep is called
    // No need to manually navigate
  };

  // Show loading only during initial load
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Field Pilot
        </h1>
        <p className="text-gray-600">
          Let's get your workspace set up in just a few steps
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={5} />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mt-8">
          {currentStep === 1 && (
            <CompanyInfoForm onSuccess={handleStepSuccess} />
          )}
          
          {currentStep === 2 && (
            <PlanSelectionForm onSuccess={handleStepSuccess} />
          )}
          
          {currentStep === 3 && (
            <PaymentSetupForm onSuccess={handleStepSuccess} />
          )}
          
          {currentStep === 4 && (
            <TeamInvitationForm onSuccess={handleStepSuccess} />
          )}
          
          {currentStep === 5 && (
            <OnboardingComplete onComplete={() => router.push('/dashboard')} />
          )}
        </div>

        {/* Navigation Helper (for steps 2-4) */}
        {currentStep > 1 && currentStep < 5 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => goToStep(currentStep - 1)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              disabled={isLoading}
            >
              ← Back to previous step
            </button>
          </div>
        )}

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help? Contact us at{' '}
          <a href="mailto:support@fieldpilot.com" className="text-teal-600 hover:text-teal-700">
            support@fieldpilot.com
          </a>
        </p>
      </div>
    </div>
  );
}
