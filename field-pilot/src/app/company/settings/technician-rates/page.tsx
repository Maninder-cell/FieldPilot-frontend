'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { TechnicianWageRate, isAdminRole } from '@/types/onboarding';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TechnicianWageRatesList from '@/components/company/TechnicianWageRatesList';
import TechnicianWageRateForm from '@/components/company/TechnicianWageRateForm';
import { ArrowLeft } from 'lucide-react';

function TechnicianRatesContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { members, loadMembers, isLoading: onboardingLoading } = useOnboarding();
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<TechnicianWageRate | undefined>();
  
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
    if (userRole && !isAdminRole(userRole)) {
      router.push('/dashboard');
      return;
    }
  }, [user, userRole, authLoading, onboardingLoading, members.length, router]);

  const handleCreateRate = () => {
    setEditingRate(undefined);
    setShowForm(true);
  };

  const handleEditRate = (rate: TechnicianWageRate) => {
    setEditingRate(rate);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRate(undefined);
    // Reload list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRate(undefined);
  };

  // Show loading state while checking permissions
  if (authLoading || onboardingLoading || members.length === 0 || !userRole) {
    return (
      <DashboardLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
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
  if (!isAdminRole(userRole)) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/company/settings/wage"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wage Settings
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Technician Wage Rates</h1>
            <p className="mt-2 text-gray-600">
              Manage individual wage rates for each technician
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            {showForm ? (
              <TechnicianWageRateForm
                rate={editingRate}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            ) : (
              <TechnicianWageRatesList
                onCreateRate={handleCreateRate}
                onEditRate={handleEditRate}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TechnicianRatesPage() {
  return (
    <ProtectedRoute>
      <TechnicianRatesContent />
    </ProtectedRoute>
  );
}
