'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    User,
    Settings,
    LogOut,
    Building2,
    ChevronRight,
} from 'lucide-react';
import LogoutModal from '@/components/modals/LogoutModal';

interface CustomerSidebarProps {
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function CustomerSidebar({ setIsMobileMenuOpen }: CustomerSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { tenant } = useOnboarding();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
        { name: 'Service Requests', href: '/customer/requests', icon: ClipboardList },
        { name: 'My Equipment', href: '/customer/equipment', icon: Package },
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

    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
    };

    if (!user) return null;

    return (
        <>
            <div className="h-full flex flex-col overflow-hidden">
                {/* Organization Info */}
                {tenant && (
                    <div className="px-4 py-4 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Organization</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{tenant.name}</p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-2">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={handleNavClick}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${isActive
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 text-emerald-400" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="border-t border-gray-200 p-3 space-y-1 shrink-0">
                    <Link
                        href="/customer/profile"
                        onClick={handleNavClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            pathname === '/customer/profile' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <User className="w-5 h-5 text-gray-500" />
                        Profile
                    </Link>

                    <Link
                        href="/customer/settings"
                        onClick={handleNavClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            pathname === '/customer/settings' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Settings className="w-5 h-5 text-gray-500" />
                        Settings
                    </Link>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
