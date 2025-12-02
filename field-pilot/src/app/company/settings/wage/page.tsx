'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WageSettingsForm from '@/components/company/WageSettingsForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function WageSettingsContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { members, loadMembers, isLoading: onboardingLoading } = useOnboarding();
  
  // Get user's role from tenant membership
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
    
    // Check if user has permission (owner or admin)
    if (userRole && userRole !== 'owner' && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, userRole, authLoading, onboardingLoading, members.length, router]);

  // Show loading state while checking permissions
  if (authLoading || onboardingLoading || members.length === 0 || !userRole) {
    return (
      <DashboardLayout>
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show permission denied if not owner/admin
  if (userRole !== 'owner' && userRole !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/company/settings"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company Settings
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Wage & Working Hours</h1>
            <p className="mt-2 text-gray-600">
              Configure default working hours and wage rates for your company
            </p>
          </div>

          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <WageSettingsForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function WageSettingsPage() {
  return (
    <ProtectedRoute>
      <WageSettingsContent />
    </ProtectedRoute>
  );
}
