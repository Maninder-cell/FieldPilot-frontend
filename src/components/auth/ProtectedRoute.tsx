'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireOnboarding = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: onboardingLoading } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    // Check authentication first
    if (requireAuth && !isAuthenticated) {
      // Preserve the intended destination for post-login redirect
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
      return;
    }

    // Only check onboarding status if explicitly required
    if (requireOnboarding === true && isAuthenticated) {
      // Wait for onboarding data to load before making decisions
      if (onboardingLoading) {
        return;
      }

      // No tenant means user needs to create a company
      if (!tenant) {
        router.push('/dashboard');
        return;
      }

      // Tenant exists but onboarding not completed
      if (!tenant.onboarding_completed) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, authLoading, tenant, onboardingLoading, requireAuth, requireOnboarding, redirectTo, pathname, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking onboarding (only if required)
  if (requireOnboarding === true && isAuthenticated && onboardingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
