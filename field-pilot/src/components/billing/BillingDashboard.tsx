'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useBilling } from '@/contexts/BillingContext';
import { SubscriptionOverview } from './SubscriptionOverview';
import { UsageMetrics } from './UsageMetrics';
import { InvoiceList } from './InvoiceList';
import { PaymentHistory } from './PaymentHistory';
import { BillingDashboardSkeleton } from './BillingDashboardSkeleton';

export function BillingDashboard() {
  const { billingOverview, loadBillingOverview, isLoading, error } = useBilling();

  useEffect(() => {
    loadBillingOverview();
  }, [loadBillingOverview]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading billing data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => loadBillingOverview()}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !billingOverview) {
    return <BillingDashboardSkeleton />;
  }

  // Show current invoice if available
  const recentInvoices = billingOverview?.current_invoice 
    ? [billingOverview.current_invoice] 
    : [];
  const recentPayments = billingOverview?.recent_payments?.slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription, view invoices, and track usage
        </p>
      </div>

      {/* Subscription Overview */}
      <div className="mb-8">
        <SubscriptionOverview subscription={billingOverview?.subscription || null} />
      </div>

      {/* Usage Metrics */}
      {billingOverview?.usage_summary && (
        <div className="mb-8">
          <UsageMetrics usage={billingOverview.usage_summary} />
        </div>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Invoices */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
            <Link
              href="/billing/invoices"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View all →
            </Link>
          </div>
          <InvoiceList invoices={recentInvoices} isLoading={isLoading} />
        </div>

        {/* Recent Payments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Payments</h2>
            <Link
              href="/billing/payments"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View all →
            </Link>
          </div>
          <PaymentHistory payments={recentPayments} isLoading={isLoading} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/billing/plans"
            className="flex items-center p-4 bg-white rounded-md border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
          >
            <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Upgrade Plan</span>
          </Link>

          <Link
            href="/billing/payment-methods"
            className="flex items-center p-4 bg-white rounded-md border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
          >
            <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Payment Methods</span>
          </Link>

          <Link
            href="/billing/invoices"
            className="flex items-center p-4 bg-white rounded-md border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
          >
            <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">View Invoices</span>
          </Link>

          <Link
            href="/billing/subscription"
            className="flex items-center p-4 bg-white rounded-md border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
          >
            <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Manage Subscription</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
