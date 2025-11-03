'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    // Redirect to login page after successful verification
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Verify your email
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification code to your email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <VerifyEmailForm email={email} onSuccess={handleSuccess} />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already verified?
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
