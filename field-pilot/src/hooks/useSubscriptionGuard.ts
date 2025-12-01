'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '@/contexts/BillingContext';

/**
 * Hook to check if user has an active subscription
 * Returns subscription status and helper functions
 */
export function useSubscriptionStatus() {
  const { subscription, isLoading } = useBilling();

  const hasActiveSubscription = subscription !== null && subscription.is_active;
  const isTrialing = subscription?.is_trial || false;
  const isCanceled = subscription?.cancel_at_period_end || false;

  return {
    hasActiveSubscription,
    isTrialing,
    isCanceled,
    subscription,
    isLoading,
  };
}

/**
 * Hook to guard routes that require an active subscription
 * Redirects to plans page if no active subscription
 */
export function useSubscriptionGuard(options?: {
  redirectTo?: string;
  allowTrial?: boolean;
}) {
  const router = useRouter();
  const { subscription, isLoading } = useBilling();
  const redirectTo = options?.redirectTo || '/billing/plans';
  const allowTrial = options?.allowTrial !== false; // Default to true

  useEffect(() => {
    if (isLoading) return;

    const hasAccess = subscription !== null && 
      subscription.is_active && 
      (allowTrial || !subscription.is_trial);

    if (!hasAccess) {
      router.push(redirectTo);
    }
  }, [subscription, isLoading, router, redirectTo, allowTrial]);

  return {
    hasAccess: subscription !== null && subscription.is_active,
    isLoading,
  };
}
