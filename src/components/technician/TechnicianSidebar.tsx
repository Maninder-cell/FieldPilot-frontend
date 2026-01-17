'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    Clock,
    BarChart3,
    User,
    Settings,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LogoutModal from '@/components/modals/LogoutModal';

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/technician/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/technician/tasks', icon: ClipboardList },
    { name: 'Time Tracking', href: '/technician/time-tracking', icon: Clock },
    { name: 'Work Hours', href: '/technician/work-hours', icon: BarChart3 },
    { name: 'Profile', href: '/technician/profile', icon: User },
    { name: 'Settings', href: '/technician/settings', icon: Settings },
];

interface TechnicianSidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function TechnicianSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: TechnicianSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
            setIsLogoutModalOpen(false);
        }
    };

    const isActive = (href: string) => {
        return pathname === href || pathname?.startsWith(href + '/');
    };

    if (!user) return null;

    return (
        <>
            <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo - Only visible on desktop */}
                <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-200">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">FP</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">FieldPilot</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                            ${active
                                                ? 'bg-emerald-50 text-emerald-700'
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
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-3 px-3 py-2">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-700 font-semibold text-sm">
                                {user?.full_name
                                    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                    : 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">Technician</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogoutClick}
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
