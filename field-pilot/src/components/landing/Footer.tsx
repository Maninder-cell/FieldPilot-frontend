import Link from 'next/link';
import { FooterProps } from '@/types/landing';

export default function Footer({ sections, socialLinks }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Company Info */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Field Pilot Logo">
                <rect width="40" height="40" rx="8" fill="#059669" />
                <path d="M12 14h16M12 20h16M12 26h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xl font-bold text-white">Field Pilot</span>
            </div>
            <p className="text-base text-gray-400 leading-relaxed max-w-xs">
              Streamline your field operations with powerful equipment tracking and work order management.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-lg text-gray-400 hover:bg-emerald-600 hover:text-white hover:-translate-y-1 transition-all"
                  aria-label={link.platform}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-white mb-2">{section.title}</h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-800 text-center md:text-left">
          <p className="text-sm text-gray-500">
            © {currentYear} Field Pilot. All rights reserved.
          </p>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
