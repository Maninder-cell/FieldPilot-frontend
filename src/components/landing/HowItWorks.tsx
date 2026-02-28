'use client';

import { useEffect, useRef, useState } from 'react';
import { UserPlus, Settings, Rocket } from 'lucide-react';

const steps = [
    {
        icon: <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: 'Sign Up in Seconds',
        description: 'Create your account and invite your team. No credit card required to start your 14-day free trial.',
        color: 'from-emerald-500 to-emerald-600',
        lightColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
    },
    {
        icon: <Settings className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: 'Setup Your Equipment',
        description: 'Add your equipment, locations, and team members. Import existing data or start fresh — it only takes minutes.',
        color: 'from-cyan-500 to-cyan-600',
        lightColor: 'bg-cyan-50',
        textColor: 'text-cyan-600',
    },
    {
        icon: <Rocket className="w-6 h-6 sm:w-7 sm:h-7" />,
        title: 'Start Operations',
        description: 'Create work orders, track field activities, and generate reports. Watch your productivity soar from day one.',
        color: 'from-violet-500 to-violet-600',
        lightColor: 'bg-violet-50',
        textColor: 'text-violet-600',
    },
];

export default function HowItWorks() {
    const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-step-index') || '0');
                        setVisibleSteps((prev) => new Set(prev).add(index));
                        observerRef.current?.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
        );

        const cards = document.querySelectorAll('[data-step-card]');
        cards.forEach((card) => observerRef.current?.observe(card));

        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    return (
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white relative">
            {/* Top gradient transition from features section */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16 md:mb-20 max-w-3xl mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 mb-4 sm:mb-6">
                        <span className="text-xs sm:text-sm font-medium text-violet-600">How It Works</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-5 leading-tight">
                        Get Started in 3 Simple Steps
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
                        Go from sign-up to full field operations in minutes, not months.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden lg:block absolute top-[88px] left-[16.5%] right-[16.5%] h-[2px]">
                        <div className="w-full h-full bg-gradient-to-r from-emerald-200 via-cyan-200 to-violet-200" />
                        <div
                            className="absolute inset-0 h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 transition-all duration-1000"
                            style={{
                                clipPath: `inset(0 ${100 - Math.min(100, visibleSteps.size * 50)}% 0 0)`,
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                data-step-card
                                data-step-index={index}
                                className={`relative text-center transition-all duration-700 ${visibleSteps.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                            >
                                {/* Step number + icon */}
                                <div className="relative inline-flex flex-col items-center mb-6 sm:mb-8">
                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                                        {step.icon}
                                    </div>
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full ${step.lightColor} flex items-center justify-center`}>
                                        <span className={`text-xs sm:text-sm font-bold ${step.textColor}`}>{index + 1}</span>
                                    </div>
                                </div>

                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
                                <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom gradient transition to pricing */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-gray-900/5 to-gray-900/20" />
        </section>
    );
}
