'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useBilling } from '@/contexts/BillingContext';
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Lock,
  Building,
  Users,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import LogoutModal from '@/components/modals/LogoutModal';
import TrialStatusBadge from '@/components/onboarding/TrialStatusBadge';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { tenant, members } = useOnboarding();
  const { subscription } = useBilling();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  // Check if user is owner or admin from tenant membership
  const currentUserMembership = members.find(m => m.user.id === user?.id);
  const isOwnerOrAdmin = currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'admin';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Change Password',
      href: '/settings/change-password',
      icon: Lock,
    },
  ];

  // Company management links (only for owner/admin)
  const companyNavigation = isOwnerOrAdmin ? [
    {
      name: 'Company Settings',
      href: '/company/settings',
      icon: Building,
    },
    {
      name: 'Team Management',
      href: '/company/team',
      icon: Users,
    },
  ] : [];

  // Billing navigation (only for owner/admin)
  const billingNavigation = isOwnerOrAdmin ? [
    {
      name: 'Billing',
      href: '/billing/dashboard',
      icon: CreditCard,
      badge: subscription?.is_trial && subscription?.days_until_renewal <= 3 ? 'Trial Ending' : null,
    },
  ] : [];

  // Check if trial is ending soon (3 days or less)
  const showTrialWarning = subscription?.is_trial && subscription?.days_until_renewal <= 3;

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Trial Status Badge */}
        {tenant && tenant.is_trial_active && (
          <div className="p-4 border-b border-gray-200">
            <TrialStatusBadge
              trialEndsAt={tenant.trial_ends_at}
              isTrialActive={tenant.is_trial_active}
              size="sm"
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${active
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Company Management Section */}
          {companyNavigation.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-200"></div>
              <div className="mb-2 px-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company
                </p>
              </div>
              <ul className="space-y-1">
                {companyNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                          ${active
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {/* Billing Section */}
          {billingNavigation.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-200"></div>
              <div className="mb-2 px-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Billing
                </p>
              </div>
              <ul className="space-y-1">
                {billingNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                          ${active
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        {item.badge && showTrialWarning && (
                          <span className="flex items-center gap-1 text-xs font-medium text-orange-600">
                            <AlertCircle className="w-3 h-3" />
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Modal - Rendered at document body level */}
      {typeof document !== 'undefined' && createPortal(
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          isLoading={isLoggingOut}
        />,
        document.body
      )}
    </>
  );
}
