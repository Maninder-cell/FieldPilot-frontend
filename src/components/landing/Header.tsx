'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, LogOut, User, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const rafRef = useRef<number>(0);

  // RAF-throttled scroll handler — runs at most once per frame
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const sections = ['hero', 'features', 'pricing', 'testimonials'];
      const scrollPosition = scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'Pricing', href: 'pricing' },
    { label: 'Testimonials', href: 'testimonials' },
    { label: 'Contact', href: 'contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/logo/fieldrino.png"
                alt="FieldRino"
                className="h-10 sm:h-11 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:block" aria-label="Main navigation">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className={`relative px-4 py-2 text-[15px] font-medium rounded-full transition-all duration-300 ${activeSection === link.href
                        ? `${isScrolled ? 'text-emerald-600 bg-emerald-50' : 'text-white bg-white/15'}`
                        : `${isScrolled ? 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`
                        }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* CTA Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all ${isScrolled ? 'text-gray-700 hover:bg-gray-50' : 'text-white/90 hover:bg-white/10'
                      }`}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <span>{user.full_name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-slide-up">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            await logout();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${isScrolled
                      ? 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`md:hidden flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl animate-fade-in-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <nav className="p-6" aria-label="Mobile navigation">
              <ul className="space-y-1 mb-8">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className={`flex items-center w-full px-4 py-3.5 text-base font-medium rounded-xl transition-all ${activeSection === link.href
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                        }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="space-y-3 pt-6 border-t border-gray-100">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-emerald-600 border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await logout();
                      }}
                      className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center w-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl hover:shadow-lg transition-all"
                    >
                      Start Free Trial
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
