'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CompanyInfoView from '@/components/onboarding/CompanyInfoView';
import CompanyInfoEditForm from '@/components/onboarding/CompanyInfoEditForm';
import CompanyInfoSkeleton from '@/components/onboarding/CompanyInfoSkeleton';
import CompanyInfoEditFormSkeleton from '@/components/onboarding/CompanyInfoEditFormSkeleton';

function CompanySettingsContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { members, loadMembers, isLoading: onboardingLoading } = useOnboarding();
  const [isEditing, setIsEditing] = useState(false);
  
  // Get user's role from tenant membership (not from user object)
  const currentUserMembership = members.find(m => m.user.id === user?.id);
  const userRole = currentUserMembership?.role;

  // Load members to get user's role
  useEffect(() => {
    if (user && members.length === 0 && !onboardingLoading) {
      loadMembers().catch(console.error);
    }
  }, [user, members.length, onboardingLoading, loadMembers]);

  useEffect(() => {
    // Wait for user and members to load before checking permissions
    if (authLoading || onboardingLoading) return;
    if (!user) return;
    
    // Only check permissions after members are loaded
    if (members.length === 0) return;
    
    // Check if user has permission (owner or admin) from tenant membership
    if (userRole && userRole !== 'owner' && userRole !== 'admin') {
      // Redirect to dashboard if not authorized
      router.push('/dashboard');
      return;
    }
  }, [user, userRole, authLoading, onboardingLoading, members.length, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Show loading state while checking permissions or loading members
  if (authLoading || onboardingLoading || members.length === 0 || !userRole) {
    return (
      <DashboardLayout>
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
              <p className="mt-2 text-gray-600">
                Manage your company information and preferences
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <CompanyInfoSkeleton />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show permission denied if not owner/admin (check tenant membership role, not user.role)
  if (userRole !== 'owner' && userRole !== 'admin') {
    // Don't render anything, the redirect will happen in useEffect
    return null;
  }

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your company information and preferences
            </p>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
            {isEditing ? (
              <CompanyInfoEditForm
                onSuccess={handleSaveSuccess}
                onCancel={handleCancel}
              />
            ) : (
              <CompanyInfoView onEdit={handleEdit} />
            )}
          </div>

          {/* Additional Settings Sections */}
          <div className="space-y-4">
            <Link
              href="/company/settings/wage"
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wage & Working Hours</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Configure default working hours and wage rates for your company
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CompanySettingsPage() {
  return (
    <ProtectedRoute>
      <CompanySettingsContent />
    </ProtectedRoute>
  );
}
