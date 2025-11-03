'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { TestimonialsProps } from '@/types/landing';

export default function Testimonials({ title, subtitle, testimonials }: TestimonialsProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('[data-testimonial-card]');
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 transition-colors ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        viewBox="0 0 20 20"
        fill={index < rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M10 1.667l2.575 5.216 5.758.842-4.166 4.058.983 5.734L10 15.008l-5.15 2.509.983-5.734-4.166-4.058 5.758-.842L10 1.667z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ));
  };

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">{subtitle}</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              data-testimonial-card
              data-index={index}
              className={`bg-gray-50 rounded-xl p-8 flex flex-col gap-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                visibleCards.has(index) ? 'animate-[fadeInUp_0.6s_ease-out_forwards]' : 'opacity-0 translate-y-8'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-1">{renderStars(testimonial.rating)}</div>
              
              <p className="text-base text-gray-600 leading-relaxed italic flex-grow">{testimonial.content}</p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex-shrink-0">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="text-base font-semibold text-gray-900 mb-1">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto p-12 bg-gradient-to-br from-primary-light to-secondary-light rounded-2xl">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-base text-gray-600 font-medium">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-base text-gray-600 font-medium">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-base text-gray-600 font-medium">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
