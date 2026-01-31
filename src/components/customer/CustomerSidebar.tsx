'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    Plus,
    ChevronRight,
    X,
} from 'lucide-react';
import LogoutModal from '@/components/modals/LogoutModal';

interface CustomerSidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function CustomerSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: CustomerSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
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
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-14 lg:h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo/fieldrino.png"
                            alt="FieldRino"
                            className="h-6 lg:h-7 w-auto"
                        />
                        <span className="text-sm font-semibold text-gray-900 hidden lg:block">Customer</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Organization Info */}
                {tenant && (
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Organization</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{tenant.name}</p>
                    </div>
                )}

                {/* Quick Action */}
                <div className="px-4 py-3">
                    <button
                        onClick={() => {
                            router.push('/customer/requests/new');
                            handleNavClick();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Request
                    </button>
                </div>

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
                <div className="border-t border-gray-200 p-3 space-y-1">
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

                {/* User Info */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-emerald-700">
                                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.full_name || 'Customer'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
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
