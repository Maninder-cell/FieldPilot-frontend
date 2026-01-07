'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BillingDashboard } from '@/components/billing/BillingDashboard';

export default function BillingDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <BillingDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
