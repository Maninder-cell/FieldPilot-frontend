'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  const handleSuccess = () => {
    // Get redirect destination from query params or default to dashboard
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    router.push(redirectTo);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome back to Field Pilot
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <LoginForm onSuccess={handleSuccess} />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/register"
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
