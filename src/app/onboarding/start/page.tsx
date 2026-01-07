'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function OnboardingStartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/onboarding/start');
      return;
    }

    // Redirect to dashboard if onboarding is already completed
    if (tenant && tenant.onboarding_completed) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, authLoading, tenant, router]);

  // Show loading state while checking authentication
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <OnboardingWizard />;
}
