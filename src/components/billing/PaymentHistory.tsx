'use client';

import React from 'react';
import { Payment } from '@/types/billing';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentHistoryProps {
  payments: Payment[];
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  hasMore?: boolean;
}

export function PaymentHistory({
  payments,
  isLoading = false,
  onPageChange,
  currentPage = 1,
  hasMore = false,
}: PaymentHistoryProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getPaymentMethodLabel = (details: Payment['payment_method_details']) => {
    if (details.type === 'card' && details.brand && details.last4) {
      return `${details.brand} •••• ${details.last4}`;
    }
    const labels: Record<string, string> = {
      card: 'Credit Card',
      bank_transfer: 'Bank Transfer',
      ach: 'ACH',
      wire: 'Wire Transfer',
    };
    return labels[details.type] || details.type;
  };

  if (isLoading && payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments</h3>
          <p className="text-gray-600">You don't have any payment history yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(payment.created)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getPaymentMethodLabel(payment.payment_method_details)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PaymentStatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4">
                  {payment.status === 'failed' && payment.failure_message && (
                    <div className="text-sm text-red-600">
                      <div className="font-medium">Failed</div>
                      <div className="text-xs">{payment.failure_message}</div>
                    </div>
                  )}
                  {payment.status === 'succeeded' && payment.receipt_url && (
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-teal-600 hover:text-teal-900"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Receipt
                    </a>
                  )}
                  {payment.status === 'pending' && (
                    <div className="text-sm text-teal-600">Processing...</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {payments.map((payment) => (
          <div key={payment.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(payment.amount, payment.currency)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(payment.created)}
                </div>
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {getPaymentMethodLabel(payment.payment_method_details)}
            </div>
            {payment.status === 'failed' && payment.failure_message && (
              <div className="text-sm text-red-600 mt-2">
                <div className="font-medium">Failed</div>
                <div className="text-xs">{payment.failure_message}</div>
              </div>
            )}
            {payment.status === 'succeeded' && payment.receipt_url && (
              <a
                href={payment.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-teal-600 hover:text-teal-900 mt-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Receipt
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {onPageChange && (currentPage > 1 || hasMore) && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {currentPage}</span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasMore || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
