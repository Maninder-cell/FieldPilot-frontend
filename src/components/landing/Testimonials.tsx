'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Operations Manager',
    company: 'BuildCo',
    content: 'FieldRino has transformed how we manage our equipment. The real-time tracking and maintenance alerts have saved us thousands in repair costs.',
    rating: 5,
    avatar: '👩‍💼',
    companyIcon: (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="10" width="8" height="16" rx="1" fill="#6366f1" opacity="0.6" />
        <rect x="12" y="4" width="8" height="22" rx="1" fill="#8b5cf6" opacity="0.7" />
        <rect x="22" y="14" width="4" height="12" rx="1" fill="#a78bfa" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'Michael Chen',
    role: 'Field Supervisor',
    company: 'TechServices Inc',
    content: 'The mobile app is a game-changer. Our technicians can update work orders on-site, and I can track everything from my office. Highly recommended!',
    rating: 5,
    avatar: '👨‍🔧',
    companyIcon: (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#10b981" strokeWidth="2" fill="none" />
        <path d="M10 14l3 3 5-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Emily Rodriguez',
    role: 'CEO',
    company: 'GreenScape Solutions',
    content: "We've seen a 40% increase in productivity since implementing FieldRino. The analytics help us make data-driven decisions every day.",
    rating: 5,
    avatar: '👩‍💻',
    companyIcon: (
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C10 4 6 10 6 16c0 4 3 8 8 8s8-4 8-8c0-6-4-12-8-12z" fill="#22c55e" opacity="0.5" />
        <path d="M14 10v10M10 16h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const trustStats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '98%', label: 'Customer Satisfaction' },
];

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="testimonials" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-50/50 relative">
      {/* Top transition from pricing */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-100/ to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm font-medium text-amber-600">Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-5 leading-tight">
            Trusted by Field Service Teams Worldwide
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
            See what our customers have to say about FieldRino and how it&apos;s transformed their operations.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-14">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-7 border border-gray-200/80 hover:border-gray-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${isVisible ? 'animate-slide-up' : 'opacity-0'
                }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote icon */}
              <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400/30 mb-3 sm:mb-4" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3 sm:mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5 sm:mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 sm:pt-5 border-t border-gray-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-base sm:text-lg">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-[15px] font-semibold text-gray-900">{t.name}</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{t.role}</p>
                    <span className="text-gray-300">·</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {t.companyIcon}
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">{t.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats Bar */}
        <div className={`rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 sm:p-8 md:p-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '0.6s' }}>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
            {trustStats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1">{stat.value}</div>
                <div className="text-[11px] sm:text-sm text-emerald-100/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
