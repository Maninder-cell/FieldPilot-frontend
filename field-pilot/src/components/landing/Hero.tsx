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
    <section id="hero" className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="animate-[fadeInUp_0.8s_ease-out]">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {headline}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
              {subheadline}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                href={primaryCTA.href} 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary border border-primary rounded-lg hover:bg-primary-hover shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-w-[160px]"
              >
                {primaryCTA.text}
              </Link>
              <Link 
                href={secondaryCTA.href} 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary bg-transparent border-2 border-primary rounded-lg hover:bg-gray-50 hover:-translate-y-0.5 transition-all min-w-[160px]"
              >
                {secondaryCTA.text}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-lg">
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-primary mb-1">10,000+</div>
                <div className="text-sm text-gray-500 font-medium">Active Users</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-primary mb-1">4.9/5</div>
                <div className="text-sm text-gray-500 font-medium">Customer Rating</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
                <div className="text-sm text-gray-500 font-medium">Uptime</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:order-last order-first animate-[fadeInRight_0.8s_ease-out_0.2s_both]">
            <div className="relative w-full aspect-[6/5] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-light to-secondary-light group">
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
