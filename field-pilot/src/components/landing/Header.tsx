'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['hero', 'features', 'pricing', 'testimonials'];
      const scrollPosition = window.scrollY + 100;

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
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo/fieldrino.png" 
              alt="FieldRino" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" aria-label="Main navigation">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className={`relative py-2 text-base font-medium transition-colors ${
                      activeSection === link.href
                        ? 'text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600'
                        : 'text-gray-700 hover:text-emerald-600'
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 text-base font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                  <span>{user.full_name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                <Link href="/login" className="px-6 py-2.5 text-base font-medium text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition-all">
                  Login
                </Link>
                <Link href="/register" className="px-6 py-2.5 text-base font-medium text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex items-center justify-center w-11 h-11"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="flex flex-col gap-1.5 w-6">
              <span className={`block w-full h-0.5 bg-gray-900 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-gray-900 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-gray-900 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 border-t border-gray-200' : 'max-h-0'}`}>
          <nav aria-label="Mobile navigation">
            <ul className="py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className={`block w-full text-left px-4 py-3 text-lg font-medium transition-all ${
                      activeSection === link.href
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 px-4 py-4 border-t border-gray-200">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="w-full px-6 py-3 text-center text-base font-medium text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition-all">
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await logout();
                    }}
                    className="w-full px-6 py-3 text-center text-base font-medium text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full px-6 py-3 text-center text-base font-medium text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition-all">
                    Login
                  </Link>
                  <Link href="/register" className="w-full px-6 py-3 text-center text-base font-medium text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-all">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
