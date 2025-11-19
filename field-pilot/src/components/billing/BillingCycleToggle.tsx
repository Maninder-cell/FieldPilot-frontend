'use client';

import React from 'react';

interface BillingCycleToggleProps {
  selectedCycle: 'monthly' | 'yearly';
  onCycleChange: (cycle: 'monthly' | 'yearly') => void;
  yearlyDiscountPercentage?: number;
}

export function BillingCycleToggle({
  selectedCycle,
  onCycleChange,
  yearlyDiscountPercentage = 17,
}: BillingCycleToggleProps) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
      <button
        onClick={() => onCycleChange('monthly')}
        className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
          selectedCycle === 'monthly'
            ? 'bg-white text-gray-900 shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Monthly
      </button>
      
      <button
        onClick={() => onCycleChange('yearly')}
        className={`relative px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
          selectedCycle === 'yearly'
            ? 'bg-white text-gray-900 shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Yearly
        {yearlyDiscountPercentage > 0 && (
          <span className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
            SAVE {Math.round(yearlyDiscountPercentage)}%
          </span>
        )}
      </button>
    </div>
  );
}
