'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileSettingsLayout from '@/components/profile/ProfileSettingsLayout';
import ProfileView from '@/components/profile/ProfileView';
import ProfileViewSkeleton from '@/components/profile/ProfileViewSkeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">
              View and manage your personal information
            </p>
          </div>

          {/* Profile with Sidebar Layout */}
          <ProfileSettingsLayout>
            {isLoading ? <ProfileViewSkeleton /> : <ProfileView />}
          </ProfileSettingsLayout>
        </div>
      </div>
    </DashboardLayout>
  );
}
