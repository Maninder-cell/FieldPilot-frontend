'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { HeroProps } from '@/types/landing';
import { ArrowRight, Play, Sparkles, ChevronDown } from 'lucide-react';

export default function Hero({
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
}: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // CountUp hook
  const CountUp = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            let start = 0;
            const duration = 2000;
            const step = (timestamp: number) => {
              if (!start) start = timestamp;
              const progress = Math.min((timestamp - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * end));
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        },
        { threshold: 0.5 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [end]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center pt-16 sm:pt-20 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #030712 0%, #0a1628 30%, #031d1a 60%, #030712 100%)',
      }}
    >
      {/* Animated floating orbs — GPU optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ contain: 'strict' }}>
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-emerald-500/15 blur-[60px] sm:blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-cyan-500/15 blur-[50px] sm:blur-[70px] animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-violet-500/10 blur-[40px] sm:blur-[60px] animate-float-slow" />
      </div>

      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20 items-center">
          {/* Text Content */}
          <div
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 sm:mb-8">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium text-emerald-300">
                The #1 Field Service Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] mb-4 sm:mb-6">
              <span className="text-white">{headline.split(' ').slice(0, 2).join(' ')} </span>
              <span className="text-shimmer">{headline.split(' ').slice(2).join(' ')}</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed mb-8 sm:mb-10 max-w-xl">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-14">
              <Link
                href={primaryCTA.href}
                className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {primaryCTA.text}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white/90 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white fill-white ml-0.5" />
                </div>
                {secondaryCTA.text}
              </Link>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
              {[
                { value: 10000, suffix: '+', label: 'Active Users' },
                { value: 4.9, suffix: '/5', label: 'Rating' },
                { value: 99.9, suffix: '%', label: 'Uptime' },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                    {stat.value === 4.9 || stat.value === 99.9 ? (
                      <span>{stat.value}{stat.suffix}</span>
                    ) : (
                      <CountUp end={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="text-[11px] sm:text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Mockup — also visible on tablet */}
          <div
            className={`hidden md:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
          >
            <div className="perspective-tilt">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                {/* Browser chrome bar */}
                <div className="bg-gray-900/80 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-2 sm:mx-4">
                    <div className="bg-gray-800/60 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-gray-400 text-center max-w-xs mx-auto">
                      app.fieldrino.com/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard content mockup */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {[
                      { label: 'Active Jobs', value: '24', color: 'from-emerald-500/20 to-emerald-500/5', accent: 'text-emerald-400' },
                      { label: 'Technicians', value: '12', color: 'from-cyan-500/20 to-cyan-500/5', accent: 'text-cyan-400' },
                      { label: 'Completed', value: '156', color: 'from-violet-500/20 to-violet-500/5', accent: 'text-violet-400' },
                    ].map((stat, i) => (
                      <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-white/5`}>
                        <p className="text-[9px] sm:text-[11px] text-gray-400 mb-0.5 sm:mb-1">{stat.label}</p>
                        <p className={`text-lg sm:text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart placeholder */}
                  <div className="bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5 mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Revenue Overview</p>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
                        <span className="text-[8px] sm:text-[10px] text-gray-500">This month</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-0.5 sm:gap-1 h-14 sm:h-20">
                      {[40, 65, 45, 75, 55, 85, 60, 90, 70, 95, 80, 65].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-emerald-500/60 to-emerald-400/20 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Tasks list */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {[
                      { title: 'HVAC Repair - Unit #247', status: 'In Progress', statusColor: 'bg-yellow-400' },
                      { title: 'Equipment Inspection', status: 'Completed', statusColor: 'bg-emerald-400' },
                      { title: 'Generator Maintenance', status: 'Scheduled', statusColor: 'bg-cyan-400' },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-800/30 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border border-white/5">
                        <span className="text-[10px] sm:text-xs text-gray-300 truncate mr-2">{task.title}</span>
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                          <div className={`w-1.5 h-1.5 rounded-full ${task.statusColor}`} />
                          <span className="text-[8px] sm:text-[10px] text-gray-500">{task.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-down indicator */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 animate-scroll-bounce">
        <ChevronDown className="w-6 h-6 text-white/40" />
      </div>

      {/* Smooth gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
    </section>
  );
}
