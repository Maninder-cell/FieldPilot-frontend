'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // RAF-throttled cursor glow
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      rafRef.current = 0;
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #031d1a 50%, #0a1628 100%)',
      }}
    >
      {/* Cursor-following glow */}
      <div
        className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none transition-all duration-500 ease-out opacity-0 sm:opacity-100"
        style={{
          left: mousePos.x - 250,
          top: mousePos.y - 250,
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Animated floating orbs — GPU optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ contain: 'strict' }}>
        <div className="absolute top-1/3 left-1/6 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-emerald-500/10 blur-[50px] sm:blur-[80px] animate-float" />
        <div className="absolute bottom-1/3 right-1/6 w-[200px] sm:w-[250px] h-[200px] sm:h-[250px] rounded-full bg-cyan-500/10 blur-[40px] sm:blur-[60px] animate-float-reverse" />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Floating mini UI element (desktop only) */}
      <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
        <div className="w-64 h-48 rounded-xl border border-white/20 p-4">
          <div className="flex gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
            <div className="w-3 h-3 rounded-full bg-cyan-400/50" />
            <div className="w-3 h-3 rounded-full bg-violet-400/50" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-white/20 rounded" />
            <div className="h-3 w-3/4 bg-white/15 rounded" />
            <div className="h-3 w-1/2 bg-white/10 rounded" />
          </div>
          <div className="mt-4 h-16 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg" />
        </div>
      </div>

      <div
        className={`relative z-10 max-w-3xl mx-auto px-4 sm:px-6 md:px-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          <span className="text-xs sm:text-sm font-medium text-emerald-300">Get Started Today</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Ready to Transform Your<br className="hidden sm:block" />
          <span className="text-shimmer"> Field Operations?</span>
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
          Join thousands of teams already using FieldRino to streamline their operations.
          Start your free 14-day trial today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl hover:shadow-[0_0_50px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto pulse-ring"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="text-xs sm:text-sm text-gray-500">
            No credit card required · 14-day free trial
          </span>
        </div>
      </div>
    </section>
  );
}
