'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBilling } from '@/contexts/BillingContext';
import { PaymentHistory } from '@/components/billing/PaymentHistory';

export default function PaymentsPage() {
  const { payments, loadPayments, isLoading } = useBilling();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPayments(currentPage);
  }, [currentPage, loadPayments]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="mt-2 text-gray-600">
            View all your payment transactions
          </p>
        </div>

        {/* Payment History */}
        <PaymentHistory
          payments={payments}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          hasMore={payments.length >= 10}
        />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
