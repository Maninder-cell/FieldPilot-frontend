'use client';

import Link from 'next/link';
import { ArrowRight, Twitter, Linkedin, Github } from 'lucide-react';

// Accept optional props for backwards compatibility with pages that pass them
interface FooterProps {
  sections?: any;
  socialLinks?: any;
}

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Status', href: '#' },
  ],
};

const socialLinks = [
  { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
  { icon: <Linkedin className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
  { icon: <Github className="w-4 h-4" />, href: '#', label: 'GitHub' },
];

export default function Footer(_props?: FooterProps) {
  return (
    <footer className="relative bg-gray-950 border-t border-white/5">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-14">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">≡</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">FieldRino</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6 sm:mb-8 max-w-xs">
              Streamline your field operations with powerful equipment tracking
              and work order management.
            </p>

            {/* Newsletter */}
            <div className="mb-6 sm:mb-8">
              <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium mb-2.5 sm:mb-3">
                Stay Updated
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2 sm:gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-5">
                  {category}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs sm:text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-left">
            © 2026 FieldRino. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-[11px] sm:text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
