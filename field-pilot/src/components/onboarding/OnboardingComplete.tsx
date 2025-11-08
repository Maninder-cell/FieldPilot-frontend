'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { CheckCircle, Sparkles, ArrowRight, Users, CreditCard, Building } from 'lucide-react';
import { OnboardingApiError } from '@/types/onboarding';

interface OnboardingCompleteProps {
  onComplete?: () => void;
}

export default function OnboardingComplete({ onComplete }: OnboardingCompleteProps) {
  const router = useRouter();
  const { completeStep, tenant, isLoading: contextLoading } = useOnboarding();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    
    // Auto-complete step 5 only once
    const completeOnboarding = async () => {
      try {
        setIsSubmitting(true);
        await completeStep(5);
      } catch (error) {
        const apiError = error as OnboardingApiError;
        setApiError(apiError.message || 'Failed to complete onboarding. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };
    
    completeOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccessWorkspace = () => {
    if (onComplete) {
      onComplete();
    } else {
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="space-y-8">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      {/* Success Animation */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className={`bg-green-100 rounded-full p-6 ${showConfetti ? 'animate-bounce' : ''}`}>
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            {showConfetti && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            🎉 Congratulations!
          </h2>
          <p className="text-xl text-gray-600">
            Your workspace is ready to go
          </p>
        </div>
      </div>

      {/* Company Info Card */}
      {tenant && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Building className="w-6 h-6 text-teal-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                <p className="text-sm text-gray-600">{tenant.company_email}</p>
              </div>
            </div>

            {tenant.domain && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Your Workspace URL:</p>
                <p className="font-mono text-teal-600 font-medium break-all">
                  {tenant.access_url || `http://${tenant.domain}`}
                </p>
              </div>
            )}

            {tenant.is_trial_active && (
              <div className="flex items-start bg-white rounded-lg p-4">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">14-Day Free Trial Active</p>
                  <p className="text-sm text-gray-600">
                    Trial ends on {new Date(tenant.trial_ends_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="bg-teal-100 rounded-full p-2 w-fit">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <h4 className="font-medium text-gray-900">Invite Your Team</h4>
            <p className="text-sm text-gray-600">
              Add team members and assign roles to collaborate effectively
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="bg-purple-100 rounded-full p-2 w-fit">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Set Up Your Profile</h4>
            <p className="text-sm text-gray-600">
              Complete your company profile and customize your workspace
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="bg-green-100 rounded-full p-2 w-fit">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Explore Features</h4>
            <p className="text-sm text-gray-600">
              Discover all the tools available to streamline your operations
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Tips */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-gray-900">Quick Start Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
            <span>Access your dashboard to see an overview of your workspace</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
            <span>Visit team settings to invite more members anytime</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
            <span>Check out the help center for guides and tutorials</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
            <span>Remember: You have full access during your trial period</span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleAccessWorkspace}
        loading={isSubmitting || contextLoading}
        disabled={isSubmitting || contextLoading}
      >
        Access Your Workspace
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-xs text-center text-gray-500">
        Need help? Contact our support team anytime at support@fieldpilot.com
      </p>
    </div>
  );
}
