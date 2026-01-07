'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileSettingsLayout from '@/components/profile/ProfileSettingsLayout';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import ChangePasswordSkeleton from '@/components/profile/ChangePasswordSkeleton';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/settings/change-password');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = () => {
    // Optionally redirect to profile or settings page
    // router.push('/profile');
  };

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            <p className="mt-2 text-gray-600">
              Update your password to keep your account secure
            </p>
          </div>

          {/* Change Password with Sidebar Layout */}
          <ProfileSettingsLayout>
            {isLoading ? (
              <ChangePasswordSkeleton />
            ) : (
            <div className="space-y-6">
              {/* Form Card */}
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-8">
                  <ChangePasswordForm onSuccess={handleSuccess} />
                </div>
              </div>

              {/* Help Text */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-800">
                      Password Requirements
                    </h3>
                    <div className="mt-2 text-sm text-emerald-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>At least 8 characters long</li>
                        <li>Contains at least one uppercase letter</li>
                        <li>Contains at least one lowercase letter</li>
                        <li>Contains at least one number</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </ProfileSettingsLayout>
        </div>
      </div>
    </DashboardLayout>
  );
}
