// Billing API Client for FieldRino

import {
  SubscriptionPlan,
  Subscription,
  Invoice,
  Payment,
  BillingOverview,
  SetupIntentResponse,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
  AddPaymentMethodRequest,
  BillingApiResponse,
  BillingApiError,
} from '@/types/billing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Generic fetch wrapper with error handling for billing endpoints
 */
async function fetchBillingAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle backend error structure
      const error: BillingApiError = {
        success: false,
        error: {
          code: data.error?.code || 'ERROR',
          message: data.error?.message || data.message || 'An error occurred',
          details: data.error?.details || data.details,
        },
        meta: data.meta || { timestamp: new Date().toISOString() },
      };
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw BillingApiError as-is
    if ((error as BillingApiError).success === false) {
      throw error;
    }
    
    // Handle network errors
    throw {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
      },
      meta: { timestamp: new Date().toISOString() },
    } as BillingApiError;
  }
}

/**
 * Get all subscription plans
 * GET /api/v1/billing/plans/
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await fetchBillingAPI<BillingApiResponse<SubscriptionPlan[]>>('/billing/plans/');
  return response.data;
}

/**
 * Get current subscription
 * GET /api/v1/billing/subscription/
 */
export async function getCurrentSubscription(accessToken: string): Promise<Subscription | null> {
  const response = await fetchBillingAPI<BillingApiResponse<Subscription | null>>('/billing/subscription/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Create a new subscription
 * POST /api/v1/billing/subscription/create/
 */
export async function createSubscription(
  data: CreateSubscriptionRequest,
  accessToken: string
): Promise<Subscription> {
  const response = await fetchBillingAPI<BillingApiResponse<Subscription>>('/billing/subscription/create/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Update existing subscription
 * PUT /api/v1/billing/subscription/update/
 */
export async function updateSubscription(
  data: UpdateSubscriptionRequest,
  accessToken: string
): Promise<Subscription> {
  const response = await fetchBillingAPI<BillingApiResponse<Subscription>>('/billing/subscription/update/', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Cancel subscription
 * POST /api/v1/billing/subscription/cancel/
 */
export async function cancelSubscription(
  data: CancelSubscriptionRequest,
  accessToken: string
): Promise<Subscription> {
  const response = await fetchBillingAPI<BillingApiResponse<Subscription>>('/billing/subscription/cancel/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Get billing overview
 * GET /api/v1/billing/overview/
 */
export async function getBillingOverview(accessToken: string): Promise<BillingOverview> {
  const response = await fetchBillingAPI<BillingApiResponse<BillingOverview>>('/billing/overview/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Get invoices with pagination
 * GET /api/v1/billing/invoices/
 */
export async function getInvoices(
  accessToken: string,
  page?: number,
  pageSize?: number
): Promise<Invoice[]> {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('page_size', pageSize.toString());
  
  const queryString = params.toString();
  const endpoint = `/billing/invoices/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetchBillingAPI<BillingApiResponse<Invoice[]>>(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Get payments with pagination
 * GET /api/v1/billing/payments/
 */
export async function getPayments(
  accessToken: string,
  page?: number,
  pageSize?: number
): Promise<Payment[]> {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('page_size', pageSize.toString());
  
  const queryString = params.toString();
  const endpoint = `/billing/payments/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetchBillingAPI<BillingApiResponse<Payment[]>>(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Create Stripe setup intent
 * POST /api/v1/billing/setup-intent/
 */
export async function createSetupIntent(accessToken: string): Promise<SetupIntentResponse> {
  const response = await fetchBillingAPI<BillingApiResponse<SetupIntentResponse>>('/billing/setup-intent/', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Add payment method
 * POST /api/v1/billing/payment-method/add/
 */
export async function addPaymentMethod(
  data: AddPaymentMethodRequest,
  accessToken: string
): Promise<void> {
  await fetchBillingAPI<BillingApiResponse<null>>('/billing/payment-method/add/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Get payment methods
 * GET /api/v1/billing/payment-methods/
 */
export async function getPaymentMethods(accessToken: string): Promise<any[]> {
  const response = await fetchBillingAPI<BillingApiResponse<any[]>>('/billing/payment-methods/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * Set default payment method
 * POST /api/v1/billing/payment-methods/set-default/
 */
export async function setDefaultPaymentMethod(
  paymentMethodId: string,
  accessToken: string
): Promise<void> {
  await fetchBillingAPI<BillingApiResponse<null>>('/billing/payment-methods/set-default/', {
    method: 'POST',
    body: JSON.stringify({ payment_method_id: paymentMethodId }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Remove payment method
 * DELETE /api/v1/billing/payment-methods/{payment_method_id}/
 */
export async function removePaymentMethod(
  paymentMethodId: string,
  accessToken: string
): Promise<void> {
  await fetchBillingAPI<BillingApiResponse<null>>(`/billing/payment-methods/${paymentMethodId}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
