'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SubscriptionPlan } from '@/types/landing';
import { getSubscriptionPlans } from '@/lib/api';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await getSubscriptionPlans();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  };

  const popularPlanSlug = 'professional';

  return (
    <section id="pricing" className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Choose the perfect plan for your team. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center gap-2 mb-16 bg-gray-200 p-1 rounded-lg w-fit mx-auto">
          <button
            className={`flex items-center gap-2 px-6 py-2 text-base font-medium rounded-md transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-2 text-base font-medium rounded-md transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <span className="text-xs px-2 py-1 bg-primary text-white rounded-full font-semibold">Save 17%</span>
          </button>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading pricing plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 ${
                  plan.slug === popularPlanSlug
                    ? 'border-2 border-primary shadow-lg hover:shadow-2xl'
                    : 'border-2 border-gray-200 hover:shadow-xl'
                }`}
              >
                {plan.slug === popularPlanSlug && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold px-6 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-base text-gray-600 leading-normal">{plan.description}</p>
                </div>

                <div className="flex items-baseline mb-8">
                  <span className="text-2xl font-bold text-gray-900 mr-1">$</span>
                  <span className="text-5xl font-bold text-gray-900 leading-none transition-all">{getPrice(plan)}</span>
                  <span className="text-base text-gray-500 ml-1">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                <ul className="mb-8 flex-grow space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-base text-gray-600 leading-normal">
                      <svg className="flex-shrink-0 w-5 h-5 text-primary mt-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16.667 5L7.5 14.167 3.333 10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`flex items-center justify-center w-full px-8 py-4 text-base font-semibold rounded-lg transition-all mt-auto ${
                    plan.slug === popularPlanSlug
                      ? 'text-white bg-primary border border-primary hover:bg-primary-hover shadow-sm hover:shadow-md hover:-translate-y-0.5'
                      : 'text-primary bg-transparent border-2 border-primary hover:bg-gray-50 hover:-translate-y-0.5'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
