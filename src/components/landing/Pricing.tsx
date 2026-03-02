'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SubscriptionPlan } from '@/types/landing';
import { getSubscriptionPlans } from '@/lib/api';
import { Check, Zap } from 'lucide-react';

const defaultPlans: any[] = [
  {
    id: 1,
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for small teams getting started',
    price_monthly: '29',
    price_yearly: '290',
    features: [
      'Up to 10 team members',
      'Basic reporting',
      'Email support',
      '5GB storage',
    ],
    is_active: true,
  },
  {
    id: 2,
    name: 'Professional',
    slug: 'professional',
    description: 'For growing teams with advanced needs',
    price_monthly: '79',
    price_yearly: '790',
    features: [
      'Up to 50 team members',
      'Advanced reporting',
      'Priority support',
      '50GB storage',
      'Custom integrations',
    ],
    is_active: true,
  },
  {
    id: 3,
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations',
    price_monthly: '199',
    price_yearly: '1990',
    features: [
      'Unlimited team members',
      'Custom reporting',
      '24/7 phone support',
      'Unlimited storage',
      'Dedicated account manager',
      'Custom SLA',
    ],
    is_active: true,
  },
];

const defaultFeaturesBySlug: Record<string, string[]> = {
  starter: ['Up to 10 team members', 'Basic reporting', 'Email support', '5GB storage'],
  professional: ['Up to 50 team members', 'Advanced reporting', 'Priority support', '50GB storage', 'Custom integrations'],
  enterprise: ['Unlimited team members', 'Custom reporting', '24/7 phone support', 'Unlimited storage', 'Dedicated account manager', 'Custom SLA'],
};

const getFeatures = (plan: any): string[] => {
  if (!plan.features) return [];
  if (Array.isArray(plan.features)) return plan.features;
  if (typeof plan.features === 'string') {
    try {
      const parsed = JSON.parse(plan.features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatPrice = (price: string) => {
  const num = parseFloat(price);
  return Number.isInteger(num) ? num.toString() : num.toFixed(0);
};

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<any[]>(defaultPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await getSubscriptionPlans();
        if (data && data.length > 0) {
          const normalizedPlans = data.map(plan => {
            const features = getFeatures(plan);
            const finalFeatures = features.length > 0
              ? features
              : (defaultFeaturesBySlug[plan.slug] || []);
            return { ...plan, features: finalFeatures };
          });
          setPlans(normalizedPlans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const getPrice = (plan: SubscriptionPlan) => {
    const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
    return formatPrice(price);
  };

  const popularPlanSlug = 'professional';

  return (
    <section id="pricing" className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden gradient-mesh-dark">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium text-emerald-300">Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-5 leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed">
            Choose the perfect plan for your team. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1 p-1 sm:p-1.5 rounded-full bg-white/5 border border-white/10">
            <button
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 ${billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-gray-400 hover:text-white'
                }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 ${billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-gray-400 hover:text-white'
                }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 bg-emerald-500 text-white rounded-full font-semibold">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm sm:text-base">Loading plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular = plan.slug === popularPlanSlug;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 ${isPopular
                      ? 'bg-gradient-to-b from-white/[0.12] to-white/[0.04] border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] md:scale-105'
                      : 'bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2">
                      <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg shadow-emerald-500/25 whitespace-nowrap">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">{plan.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline mb-6 sm:mb-8">
                    <span className="text-base sm:text-xl font-bold text-gray-300 mr-0.5 sm:mr-1">$</span>
                    <span className="text-4xl sm:text-5xl font-bold text-white leading-none">{getPrice(plan)}</span>
                    <span className="text-xs sm:text-sm text-gray-500 ml-1.5 sm:ml-2">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>

                  <ul className="mb-6 sm:mb-8 grow space-y-2.5 sm:space-y-3.5">
                    {getFeatures(plan).length > 0 ? (
                      getFeatures(plan).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-300">
                          <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 ${isPopular ? 'bg-emerald-500/20' : 'bg-white/10'
                            }`}>
                            <Check className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isPopular ? 'text-emerald-400' : 'text-gray-400'}`} />
                          </div>
                          {feature}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No features listed</li>
                    )}
                  </ul>

                  <Link
                    href="/register"
                    className={`flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 mt-auto ${isPopular
                        ? 'text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
                        : 'text-white bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20'
                      }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom gradient fade to testimonials */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-gray-50/50" />
    </section>
  );
}
