'use client';

// Styled SVG logo-like icons for each brand
const companies = [
    {
        name: 'BuildCo',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="10" width="8" height="16" rx="1" fill="#6366f1" opacity="0.8" />
                <rect x="12" y="4" width="8" height="22" rx="1" fill="#8b5cf6" opacity="0.9" />
                <rect x="22" y="14" width="4" height="12" rx="1" fill="#a78bfa" opacity="0.7" />
            </svg>
        ),
    },
    {
        name: 'TechServ',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="10" stroke="#10b981" strokeWidth="2" fill="none" />
                <path d="M10 14l3 3 5-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        name: 'GreenScape',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4C10 4 6 10 6 16c0 4 3 8 8 8s8-4 8-8c0-6-4-12-8-12z" fill="#22c55e" opacity="0.7" />
                <path d="M14 10v10M10 16h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: 'ProMaint',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M7 7h6v6H7zM15 7h6v6h-6zM7 15h6v6H7z" fill="#f59e0b" opacity="0.8" />
                <path d="M15 15h6v6h-6z" fill="#f59e0b" opacity="0.4" />
            </svg>
        ),
    },
    {
        name: 'FieldForce',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 20L14 4l10 16H4z" fill="#06b6d4" opacity="0.7" />
                <path d="M10 20l4-8 4 8" fill="#0891b2" opacity="0.5" />
            </svg>
        ),
    },
    {
        name: 'ServiceHub',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="5" fill="#ec4899" opacity="0.8" />
                <circle cx="14" cy="14" r="10" stroke="#ec4899" strokeWidth="1.5" opacity="0.4" fill="none" />
            </svg>
        ),
    },
    {
        name: 'OptiTrack',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="8" width="22" height="12" rx="6" fill="#3b82f6" opacity="0.7" />
                <circle cx="10" cy="14" r="3" fill="white" opacity="0.9" />
            </svg>
        ),
    },
    {
        name: 'WorkFlow+',
        logo: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 14h8M16 14h8M14 4v8M14 16v8" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        ),
    },
];

export default function TrustedBy() {
    return (
        <section className="py-10 sm:py-14 md:py-16 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                <p className="text-center text-[11px] sm:text-xs md:text-sm font-medium text-gray-400 uppercase tracking-[0.15em] sm:tracking-widest mb-8 sm:mb-10">
                    Trusted by 500+ companies worldwide
                </p>
                <div className="relative overflow-hidden">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />

                    {/* Scrolling ticker */}
                    <div className="animate-ticker flex items-center gap-8 sm:gap-12 md:gap-16 whitespace-nowrap">
                        {[...companies, ...companies].map((company, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 flex items-center gap-2 sm:gap-2.5 opacity-50 hover:opacity-100 transition-all duration-300 cursor-default"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                                    {company.logo}
                                </div>
                                <span className="text-sm sm:text-base font-semibold text-gray-600">{company.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
