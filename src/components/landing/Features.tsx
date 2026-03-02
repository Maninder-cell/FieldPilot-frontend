'use client';

import { useEffect, useRef, useState } from 'react';
import { FeaturesProps } from '@/types/landing';

export default function Features({ title, subtitle, features }: FeaturesProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => new Set(prev).add(index));
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    const cards = document.querySelectorAll('[data-feature-card]');
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Bento grid layout: first card is 2-col span on desktop
  const getCardSize = (index: number) => {
    if (index === 0) return 'sm:col-span-2 lg:col-span-2';
    return '';
  };

  const accentColors = [
    { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'hover:border-emerald-200', icon: 'bg-emerald-50 text-emerald-600', shadow: 'hover:shadow-emerald-100/50' },
    { bg: 'from-cyan-500/10 to-cyan-500/5', border: 'hover:border-cyan-200', icon: 'bg-cyan-50 text-cyan-600', shadow: 'hover:shadow-cyan-100/50' },
    { bg: 'from-violet-500/10 to-violet-500/5', border: 'hover:border-violet-200', icon: 'bg-violet-50 text-violet-600', shadow: 'hover:shadow-violet-100/50' },
    { bg: 'from-amber-500/10 to-amber-500/5', border: 'hover:border-amber-200', icon: 'bg-amber-50 text-amber-600', shadow: 'hover:shadow-amber-100/50' },
    { bg: 'from-rose-500/10 to-rose-500/5', border: 'hover:border-rose-200', icon: 'bg-rose-50 text-rose-600', shadow: 'hover:shadow-rose-100/50' },
    { bg: 'from-indigo-500/10 to-indigo-500/5', border: 'hover:border-indigo-200', icon: 'bg-indigo-50 text-indigo-600', shadow: 'hover:shadow-indigo-100/50' },
  ];

  // Mini visual illustrations for each feature card
  const miniIllustrations: Record<number, React.ReactNode> = {
    0: (
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-[0.06] pointer-events-none">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor">
          <rect x="10" y="40" width="25" height="70" rx="4" />
          <rect x="45" y="20" width="25" height="90" rx="4" />
          <rect x="80" y="55" width="25" height="55" rx="4" />
        </svg>
      </div>
    ),
    1: (
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-[0.06] pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
          <rect x="10" y="10" width="35" height="10" rx="2" />
          <rect x="10" y="30" width="80" height="6" rx="2" />
          <rect x="10" y="45" width="60" height="6" rx="2" />
          <rect x="10" y="60" width="70" height="6" rx="2" />
          <circle cx="80" cy="80" r="15" opacity="0.5" />
        </svg>
      </div>
    ),
  };

  return (
    <section id="features" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50/50 relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm font-medium text-emerald-600">Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-5 leading-tight">{title}</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">{subtitle}</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, index) => {
            const colors = accentColors[index % accentColors.length];
            return (
              <div
                key={index}
                data-feature-card
                data-index={index}
                className={`group relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${colors.border} ${colors.shadow} ${getCardSize(index)} overflow-hidden ${visibleCards.has(index) ? 'animate-slide-up' : 'opacity-0'
                  }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Mini illustration overlay */}
                {miniIllustrations[index]}

                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center ${colors.icon} rounded-xl sm:rounded-2xl mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  {feature.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{feature.description}</p>

                {/* Decorative gradient on hover */}
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
