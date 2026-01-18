'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
    LayoutDashboard,
    ClipboardList,
    Clock,
    BarChart3,
    User,
    Settings,
    LogOut,
    Wrench,
} from 'lucide-react';
import LogoutModal from '@/components/modals/LogoutModal';

interface TechnicianSidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function TechnicianSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: TechnicianSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { tenant } = useOnboarding();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/technician/dashboard', icon: LayoutDashboard },
        { name: 'My Tasks', href: '/technician/tasks', icon: ClipboardList },
        { name: 'Time Tracking', href: '/technician/time-tracking', icon: Clock },
        { name: 'Work Hours', href: '/technician/work-hours', icon: BarChart3 },
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

    if (!user) return null;

    return (
        <>
            <div className="h-full flex flex-col bg-white">
                {/* Technician Portal Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Technician Portal</h2>
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
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${isActive
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
                        onClick={() => router.push('/technician/profile')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <User className="w-5 h-5" />
                        Profile
                    </button>

                    <button
                        onClick={() => router.push('/technician/settings')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
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
