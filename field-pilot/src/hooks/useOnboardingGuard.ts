import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

/**
 * Hook to guard routes that require completed onboarding
 * Redirects to onboarding wizard if onboarding is incomplete
 */
export function useOnboardingGuard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Wait for auth and onboarding to load
    if (authLoading || onboardingLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user has a tenant
    if (!tenant) {
      // No tenant, redirect to onboarding
      router.push('/onboarding/start');
      return;
    }

    // Check if onboarding is complete
    if (!tenant.onboarding_completed) {
      // Onboarding incomplete, redirect to wizard
      router.push('/onboarding/start');
      return;
    }
  }, [isAuthenticated, authLoading, tenant, onboardingLoading, router]);

  return {
    isLoading: authLoading || onboardingLoading,
    isOnboardingComplete: tenant?.onboarding_completed || false,
    tenant,
  };
}
