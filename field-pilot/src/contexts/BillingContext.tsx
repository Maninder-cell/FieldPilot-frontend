'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  Subscription,
  SubscriptionPlan,
  Invoice,
  Payment,
  BillingOverview,
  SetupIntentResponse,
  BillingApiError,
} from '@/types/billing';
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getBillingOverview,
  getInvoices,
  getPayments,
  createSetupIntent,
  addPaymentMethod,
} from '@/lib/billing-api';
import { getAccessToken } from '@/lib/token-utils';

interface BillingContextType {
  // State
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  invoices: Invoice[];
  payments: Payment[];
  billingOverview: BillingOverview | null;
  isLoading: boolean;
  error: string | null;
  selectedBillingCycle: 'monthly' | 'yearly';
  
  // Subscription Management
  loadSubscription: () => Promise<void>;
  createNewSubscription: (planSlug: string, billingCycle: 'monthly' | 'yearly', paymentMethodId?: string) => Promise<void>;
  upgradeDowngrade: (planSlug: string, billingCycle?: 'monthly' | 'yearly') => Promise<void>;
  cancelCurrentSubscription: (immediately: boolean, reason?: string) => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  
  // Plan Management
  loadPlans: () => Promise<void>;
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  
  // Payment Methods
  setupPaymentMethod: () => Promise<SetupIntentResponse>;
  savePaymentMethod: (paymentMethodId: string, setAsDefault: boolean) => Promise<void>;
  
  // Billing Data
  loadBillingOverview: () => Promise<void>;
  loadInvoices: (page?: number) => Promise<void>;
  loadPayments: (page?: number) => Promise<void>;
  
  // Utility
  refreshBillingData: () => Promise<void>;
  clearError: () => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [billingOverview, setBillingOverview] = useState<BillingOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Load subscription on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSubscription();
    }
  }, [isAuthenticated]);

  const handleError = (err: unknown) => {
    if ((err as BillingApiError).error) {
      const billingError = err as BillingApiError;
      setError(billingError.error.message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Subscription Management
  const loadSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const data = await getCurrentSubscription(accessToken);
      setSubscription(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSubscription = useCallback(async (
    planSlug: string,
    billingCycle: 'monthly' | 'yearly',
    paymentMethodId?: string
  ) => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const data = await createSubscription(
        { plan_slug: planSlug, billing_cycle: billingCycle, payment_method_id: paymentMethodId },
        accessToken
      );
      setSubscription(data);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upgradeDowngrade = useCallback(async (
    planSlug: string,
    billingCycle?: 'monthly' | 'yearly'
  ) => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const data = await updateSubscription(
        { plan_slug: planSlug, billing_cycle: billingCycle },
        accessToken
      );
      setSubscription(data);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelCurrentSubscription = useCallback(async (
    immediately: boolean,
    reason?: string
  ) => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const data = await cancelSubscription(
        { cancel_immediately: immediately, reason },
        accessToken
      );
      setSubscription(data);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reactivateSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const data = await updateSubscription(
        { cancel_at_period_end: false },
        accessToken
      );
      setSubscription(data);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Plan Management
  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setBillingCycle = useCallback((cycle: 'monthly' | 'yearly') => {
    setSelectedBillingCycle(cycle);
    // Store preference in localStorage
    localStorage.setItem('preferred_billing_cycle', cycle);
  }, []);

  // Payment Methods
  const setupPaymentMethod = useCallback(async (): Promise<SetupIntentResponse> => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const data = await createSetupIntent(accessToken);
      return data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePaymentMethod = useCallback(async (
    paymentMethodId: string,
    setAsDefault: boolean
  ) => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      await addPaymentMethod(
        { payment_method_id: paymentMethodId, set_as_default: setAsDefault },
        accessToken
      );
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Billing Data
  const loadBillingOverview = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const data = await getBillingOverview(accessToken);
      setBillingOverview(data);
      setSubscription(data.subscription);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async (page?: number) => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const data = await getInvoices(accessToken, page);
      setInvoices(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPayments = useCallback(async (page?: number) => {
    try {
      setIsLoading(true);
      clearError();
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const data = await getPayments(accessToken, page);
      setPayments(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility
  const refreshBillingData = useCallback(async () => {
    await Promise.all([
      loadSubscription(),
      loadBillingOverview(),
    ]);
  }, [loadSubscription, loadBillingOverview]);

  // Load preferred billing cycle from localStorage
  useEffect(() => {
    const savedCycle = localStorage.getItem('preferred_billing_cycle');
    if (savedCycle === 'monthly' || savedCycle === 'yearly') {
      setSelectedBillingCycle(savedCycle);
    }
  }, []);

  const value: BillingContextType = {
    subscription,
    plans,
    invoices,
    payments,
    billingOverview,
    isLoading,
    error,
    selectedBillingCycle,
    loadSubscription,
    createNewSubscription,
    upgradeDowngrade,
    cancelCurrentSubscription,
    reactivateSubscription,
    loadPlans,
    setBillingCycle,
    setupPaymentMethod,
    savePaymentMethod,
    loadBillingOverview,
    loadInvoices,
    loadPayments,
    refreshBillingData,
    clearError,
  };

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
