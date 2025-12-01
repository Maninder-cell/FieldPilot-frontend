'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Settings } from 'lucide-react';

interface ProfileSettingsLayoutProps {
  children: React.ReactNode;
}

export default function ProfileSettingsLayout({ children }: ProfileSettingsLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'View and edit your profile',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account settings',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/profile') {
      return pathname === '/profile' || pathname === '/profile/edit';
    }
    if (href === '/settings') {
      return pathname === '/settings';
    }
    return pathname === href;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="lg:w-64 shrink-0">
        <nav className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Account
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-start gap-3 px-4 py-3 transition-colors
                      ${active
                        ? 'bg-emerald-50 border-l-4 border-emerald-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 mt-0.5 shrink-0 ${
                        active ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          active ? 'text-emerald-900' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
