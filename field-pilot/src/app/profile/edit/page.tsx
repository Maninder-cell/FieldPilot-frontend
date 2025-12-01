'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileSettingsLayout from '@/components/profile/ProfileSettingsLayout';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileFormSkeleton from '@/components/profile/ProfileFormSkeleton';

export default function ProfileEditPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile/edit');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = () => {
    router.push('/profile');
  };

  const handleCancel = () => {
    router.push('/profile');
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-2 text-gray-600">
              Update your personal information and preferences
            </p>
          </div>

          {/* Profile Edit with Sidebar Layout */}
          <ProfileSettingsLayout>
            {isLoading ? (
              <ProfileFormSkeleton />
            ) : (
              <ProfileForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
          </ProfileSettingsLayout>
        </div>
      </div>
    </DashboardLayout>
  );
}
