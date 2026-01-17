'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import TechnicianSidebar from './TechnicianSidebar';

interface TechnicianLayoutProps {
    children: React.ReactNode;
}

export default function TechnicianLayout({ children }: TechnicianLayoutProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Mobile Header with Menu Button */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6 text-gray-600" />
                    ) : (
                        <Menu className="w-6 h-6 text-gray-600" />
                    )}
                </button>
                <div className="ml-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">FP</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">FieldPilot</span>
                </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-1 overflow-hidden pt-0 lg:pt-0">
                {/* Mobile overlay with backdrop blur */}
                {isMobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 mt-16"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar - Fixed below header on mobile, always visible on desktop */}
                <aside
                    className={`
                        w-64 shrink-0 overflow-y-auto bg-white border-r border-gray-200
                        fixed lg:relative top-16 lg:top-0 bottom-0 left-0 z-40
                        transform transition-transform duration-300 ease-in-out lg:transform-none
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <TechnicianSidebar
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />
                </aside>

                {/* Main content - Scrollable */}
                <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
