// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  yearly_discount_percentage: number;
  max_users: number;
  max_equipment: number;
  max_storage_gb: number;
  max_api_calls_per_month: number;
  features: Record<string, boolean>;
  is_active: boolean;
}

// Subscription Types
export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  is_active: boolean;
  is_trial: boolean;
  days_until_renewal: number;
  next_renewal_date: string | null; // Shows trial_end if in trial, otherwise current_period_end
  next_payment_amount: number; // Amount to be charged on next renewal (from Stripe, includes prorations)
  has_proration_credit: boolean; // True if there's a credit from downgrade/upgrade
  current_users_count: number;
  current_equipment_count: number;
  current_storage_gb: string;
  usage_limits_exceeded: string[];
  created_at: string;
}

export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete' 
  | 'incomplete_expired';

// Invoice Types
export interface Invoice {
  id: string;
  number: string; // Invoice number like "IV8YRT6T-0002"
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: InvoiceStatus;
  created: string;
  due_date: string | null;
  paid_at: string | null;
  invoice_pdf: string; // PDF download URL
  period_start: string;
  period_end: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

// Payment Types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_method_details: PaymentMethodDetails;
  status: PaymentStatus;
  failure_code: string | null;
  failure_message: string | null;
  created: string;
  receipt_url: string;
}

export interface PaymentMethodDetails {
  type: PaymentMethodType;
  brand?: string; // e.g., "Visa", "Mastercard"
  last4?: string; // Last 4 digits of card
  exp_month?: number;
  exp_year?: number;
}

export type PaymentMethodType = 'card' | 'bank_transfer' | 'ach' | 'wire';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

// Usage Types
export interface UsageSummary {
  users: UsageMetric;
  equipment: UsageMetric;
  storage: UsageMetric;
}

export interface UsageMetric {
  current: number;
  limit: number;
  percentage: number;
}

// Billing Overview Types
export interface BillingOverview {
  subscription: Subscription | null;
  current_invoice: Invoice | null;
  recent_payments: Payment[];
  usage_summary: UsageSummary;
}

// Request Types
export interface CreateSubscriptionRequest {
  plan_slug: string;
  billing_cycle: 'monthly' | 'yearly';
  payment_method_id?: string;
}

export interface UpdateSubscriptionRequest {
  plan_slug?: string;
  billing_cycle?: 'monthly' | 'yearly';
  cancel_at_period_end?: boolean;
}

export interface CancelSubscriptionRequest {
  cancel_immediately?: boolean;
  reason?: string;
}

export interface AddPaymentMethodRequest {
  payment_method_id: string;
  set_as_default?: boolean;
}

// Stripe Types
export interface SetupIntentResponse {
  client_secret: string;
  customer_id: string;
}

// API Response Types
export interface BillingApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
  };
}

export interface BillingApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta: {
    timestamp: string;
  };
}
