'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CompanyInfoView from '@/components/onboarding/CompanyInfoView';
import CompanyInfoEditForm from '@/components/onboarding/CompanyInfoEditForm';

function CompanySettingsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check if user has permission (owner or admin)
    if (user && user.role !== 'owner' && user.role !== 'admin') {
      // Redirect to dashboard if not authorized
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Show permission denied if not owner/admin
  if (user && user.role !== 'owner' && user.role !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            {isEditing ? (
              <CompanyInfoEditForm
                onSuccess={handleSaveSuccess}
                onCancel={handleCancel}
              />
            ) : (
              <CompanyInfoView onEdit={handleEdit} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CompanySettingsPage() {
  return (
    <ProtectedRoute requireOnboarding={true}>
      <CompanySettingsContent />
    </ProtectedRoute>
  );
}
