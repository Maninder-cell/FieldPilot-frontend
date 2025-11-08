'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { User, Mail, Phone, Briefcase } from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const { tenant, isLoading } = useOnboarding();

  if (!user) return null;

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show onboarding wizard if no tenant or onboarding not completed
  if (!tenant || !tenant.onboarding_completed) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OnboardingWizard />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.first_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Company Info Card */}
        {tenant && (
          <div className="bg-linear-to-r from-teal-50 to-cyan-50 rounded-lg shadow-sm border border-teal-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Your Company
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Company Name</p>
                <p className="text-base text-gray-900 font-semibold">{tenant.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{tenant.company_email}</p>
              </div>
              {tenant.company_phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">{tenant.company_phone}</p>
                </div>
              )}
              {tenant.industry && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="text-base text-gray-900">{tenant.industry}</p>
                </div>
              )}
              {tenant.is_trial_active && (
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg p-4 border border-teal-300">
                    <p className="text-sm font-medium text-blue-900">
                      🎉 Free Trial Active
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your trial ends on {new Date(tenant.trial_ends_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Your Profile
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Full Name</span>
                </div>
                <p className="text-base text-gray-900">{user.full_name}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Email</span>
              </div>
              <p className="text-base text-gray-900">{user.email}</p>
              {user.is_verified && (
                <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                  Verified
                </span>
              )}
            </div>

            {user.phone && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Phone</span>
                </div>
                <p className="text-base text-gray-900">{user.phone}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Role</span>
              </div>
              <p className="text-base text-gray-900 capitalize">{user.role}</p>
              {user.employee_id && (
                <p className="text-sm text-gray-500 mt-1">
                  Employee ID: {user.employee_id}
                </p>
              )}
            </div>

            {(user.department || user.job_title) && (
              <div className="border-t border-gray-200 pt-4">
                {user.job_title && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-500">Job Title</span>
                    <p className="text-base text-gray-900">{user.job_title}</p>
                  </div>
                )}
                {user.department && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Department</span>
                    <p className="text-base text-gray-900">{user.department}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for future features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Equipment</h4>
            <p className="text-gray-600 text-sm">Track and manage your equipment</p>
            <p className="text-3xl font-bold text-teal-600 mt-4">Coming Soon</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Work Orders</h4>
            <p className="text-gray-600 text-sm">Manage your work orders</p>
            <p className="text-3xl font-bold text-teal-600 mt-4">Coming Soon</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Reports</h4>
            <p className="text-gray-600 text-sm">View analytics and reports</p>
            <p className="text-3xl font-bold text-teal-600 mt-4">Coming Soon</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
