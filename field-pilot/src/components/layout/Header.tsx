'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo - Fixed to left */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">FR</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">FieldRino</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-gray-900">
              {user.full_name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
