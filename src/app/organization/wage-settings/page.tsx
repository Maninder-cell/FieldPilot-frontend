'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import WageSettingsForm from '@/components/company/WageSettingsForm';
import { DollarSign, Clock } from 'lucide-react';

function WageSettingsContent() {
  return (
    <OrganizationLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wage & Working Hours</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Configure default working hours and wage rates for your company
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <WageSettingsForm />
        </div>
      </div>
    </OrganizationLayout>
  );
}

export default function WageSettingsPage() {
  return (
    <ProtectedRoute>
      <WageSettingsContent />
    </ProtectedRoute>
  );
}
