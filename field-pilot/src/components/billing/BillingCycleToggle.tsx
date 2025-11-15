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
    <div className="flex items-center justify-center space-x-3">
      <button
        onClick={() => onCycleChange('monthly')}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          selectedCycle === 'monthly'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Monthly
      </button>
      
      <button
        onClick={() => onCycleChange('yearly')}
        className={`relative px-4 py-2 rounded-md font-medium transition-colors ${
          selectedCycle === 'yearly'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Yearly
        {yearlyDiscountPercentage > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Save {Math.round(yearlyDiscountPercentage)}%
          </span>
        )}
      </button>
    </div>
  );
}
