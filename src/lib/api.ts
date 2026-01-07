// API Client for FieldRino Backend

import { ApiResponse, SubscriptionPlan } from '@/types/landing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        details: data.details,
        code: data.code,
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Fetch all subscription plans
 * Endpoint: GET /api/billing/plans/
 * Public endpoint - no authentication required
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetchAPI<SubscriptionPlan[]>('/billing/plans/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    // Return fallback static data if API fails
    return getFallbackPlans();
  }
}

/**
 * Fallback subscription plans data
 * Used when API is unavailable
 */
function getFallbackPlans(): SubscriptionPlan[] {
  return [
    {
      id: '1',
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for small teams getting started',
      price_monthly: '29.00',
      price_yearly: '290.00',
      yearly_discount_percentage: 16.67,
      max_users: 5,
      max_equipment: 50,
      max_storage_gb: 10,
      max_api_calls_per_month: 10000,
      features: {
        basic_support: true,
        mobile_app: true,
        custom_reports: false,
        api_access: false,
        priority_support: false,
      },
      is_active: true,
    },
    {
      id: '2',
      name: 'Professional',
      slug: 'professional',
      description: 'For growing teams with advanced needs',
      price_monthly: '79.00',
      price_yearly: '790.00',
      yearly_discount_percentage: 16.67,
      max_users: 20,
      max_equipment: 200,
      max_storage_gb: 50,
      max_api_calls_per_month: 50000,
      features: {
        basic_support: true,
        mobile_app: true,
        custom_reports: true,
        api_access: true,
        priority_support: true,
        advanced_analytics: true,
      },
      is_active: true,
    },
    {
      id: '3',
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large organizations with custom requirements',
      price_monthly: '199.00',
      price_yearly: '1990.00',
      yearly_discount_percentage: 16.67,
      max_users: null,
      max_equipment: null,
      max_storage_gb: 500,
      max_api_calls_per_month: null,
      features: {
        basic_support: true,
        mobile_app: true,
        custom_reports: true,
        api_access: true,
        priority_support: true,
        advanced_analytics: true,
        custom_integrations: true,
        dedicated_support: true,
        sla_guarantee: true,
      },
      is_active: true,
    },
  ];
}
