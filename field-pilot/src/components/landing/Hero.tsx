'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeroProps } from '@/types/landing';

export default function Hero({
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  heroImage,
}: HeroProps) {
  return (
    <section id="hero" className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="animate-[fadeInUp_0.8s_ease-out]">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {headline}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl">
              {subheadline}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                href={primaryCTA.href} 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all min-w-[160px]"
              >
                {primaryCTA.text}
              </Link>
              <Link 
                href={secondaryCTA.href} 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-600 bg-white border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 hover:-translate-y-0.5 transition-all min-w-[160px]"
              >
                {secondaryCTA.text}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-lg">
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-emerald-600 mb-1">10,000+</div>
                <div className="text-sm text-gray-600 font-medium">Active Users</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-emerald-600 mb-1">4.9/5</div>
                <div className="text-sm text-gray-600 font-medium">Customer Rating</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-emerald-600 mb-1">99.9%</div>
                <div className="text-sm text-gray-600 font-medium">Uptime</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:order-last order-first animate-[fadeInRight_0.8s_ease-out_0.2s_both]">
            <div className="relative w-full aspect-[6/5] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 group">
              <Image
                src={heroImage}
                alt="Field Pilot Dashboard"
                fill
                priority
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
