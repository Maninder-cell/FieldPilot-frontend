'use client';

import { ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Mobile menu button */}
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
        <span className="ml-3 font-bold text-gray-900">Field Pilot</span>
      </div>

      {/* Header - Full Width, Fixed */}
      <Header />

      {/* Main Content Area with Sidebar - Fills remaining space, starts below header */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Mobile overlay with backdrop blur */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 mt-16"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Fixed below header, scrollable */}
        <aside
          className={`
            w-64 shrink-0 overflow-y-auto bg-white border-r border-gray-200
            fixed lg:relative top-16 lg:top-0 bottom-0 left-0 z-40
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <Sidebar/>
        </aside>

        {/* Main content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}
