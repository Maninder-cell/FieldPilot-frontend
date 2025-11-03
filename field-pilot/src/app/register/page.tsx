'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = (email: string) => {
    // Redirect to email verification page with email parameter
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Field Pilot to manage your equipment and operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <RegisterForm onSuccess={handleSuccess} />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
