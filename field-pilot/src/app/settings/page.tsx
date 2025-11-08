'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Lock, Bell, Shield, Globe } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/settings');
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (!isAuthenticated) {
    return null;
  }

  const settingsCategories = [
    {
      title: 'Security',
      description: 'Manage your password and security settings',
      icon: Lock,
      items: [
        {
          name: 'Change Password',
          description: 'Update your password to keep your account secure',
          href: '/settings/change-password',
        },
      ],
    },
    {
      title: 'Notifications',
      description: 'Configure how you receive notifications',
      icon: Bell,
      items: [
        {
          name: 'Notification Preferences',
          description: 'Manage email, SMS, and push notifications',
          href: '/profile/edit',
          badge: 'In Profile',
        },
      ],
    },
    {
      title: 'Privacy',
      description: 'Control your privacy and data settings',
      icon: Shield,
      items: [
        {
          name: 'Privacy Settings',
          description: 'Coming soon',
          href: '#',
          disabled: true,
        },
      ],
    },
    {
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Globe,
      items: [
        {
          name: 'Language & Region',
          description: 'Set your timezone and language preferences',
          href: '/profile/edit',
          badge: 'In Profile',
        },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Settings Categories */}
          <div className="space-y-6">
            {settingsCategories.map((category) => {
              const Icon = category.icon;
              
              return (
                <div
                  key={category.title}
                  className="bg-white shadow-sm rounded-lg border border-gray-200"
                >
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {category.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          block px-6 py-4 transition-colors
                          ${(item as any).disabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:bg-gray-50'
                          }
                        `}
                        onClick={(e) => (item as any).disabled && e.preventDefault()}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-medium text-gray-900">
                                {item.name}
                              </h4>
                              {(item as any).badge && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded">
                                  {(item as any).badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.description}
                            </p>
                          </div>
                          {!(item as any).disabled && (
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
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
