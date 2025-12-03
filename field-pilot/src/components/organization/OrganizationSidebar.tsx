'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { 
  LayoutDashboard, 
  Home, 
  Building2, 
  Wrench, 
  MapPin, 
  LogOut,
  ArrowLeft
} from 'lucide-react';
import LogoutModal from '@/components/modals/LogoutModal';

export default function OrganizationSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { tenant } = useOnboarding();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/organization/dashboard', icon: LayoutDashboard },
    { name: 'Facilities', href: '/organization/facilities', icon: Home },
    { name: 'Buildings', href: '/organization/buildings', icon: Building2 },
    { name: 'Equipment', href: '/organization/equipment', icon: Wrench },
    { name: 'Locations', href: '/organization/locations', icon: MapPin },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleBackToMain = () => {
    router.push('/dashboard');
  };

  if (!user) return null;

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Organization Portal Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-900">Organization Portal</h2>
          </div>
          {tenant && (
            <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-600 font-medium">Organization</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{tenant.name}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={handleBackToMain}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Main Portal
          </button>
          
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
