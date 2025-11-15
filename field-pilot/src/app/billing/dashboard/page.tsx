'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BillingDashboard } from '@/components/billing/BillingDashboard';

export default function BillingDashboardPage() {
  return (
    <ProtectedRoute>
      <BillingDashboard />
    </ProtectedRoute>
  );
}
