'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CompanyInfoView from '@/components/onboarding/CompanyInfoView';
import CompanyInfoEditForm from '@/components/onboarding/CompanyInfoEditForm';

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
    
    // Check if user has permission (owner or admin) from tenant membership
    if (userRole && userRole !== 'owner' && userRole !== 'admin') {
      // Redirect to dashboard if not authorized
      router.push('/dashboard');
      return;
    }
  }, [user, userRole, authLoading, onboardingLoading, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Show loading state while checking permissions
  if (authLoading || onboardingLoading || !userRole) {
    return (
      <DashboardLayout>
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show permission denied if not owner/admin (check tenant membership role, not user.role)
  if (userRole !== 'owner' && userRole !== 'admin') {
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
