import React from 'react';
import { UsageMetric as UsageMetricType } from '@/types/billing';

interface UsageMetricProps {
  name: string;
  metric: UsageMetricType;
  icon: React.ReactNode;
  unit?: string;
}

export function UsageMetric({ name, metric, icon, unit = '' }: UsageMetricProps) {
  // Handle undefined or null metric
  if (!metric) {
    return (
      <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 mb-3">
          <div className="text-gray-400">{icon}</div>
          <h3 className="font-medium text-gray-500">{name}</h3>
        </div>
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  const { current, limit, percentage } = metric;
  
  // Determine color based on usage percentage
  const getColorClasses = () => {
    if (percentage >= 100) {
      return {
        bar: 'bg-red-500',
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    } else if (percentage >= 80) {
      return {
        bar: 'bg-yellow-500',
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
      };
    } else {
      return {
        bar: 'bg-green-500',
        text: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    }
  };

  const colors = getColorClasses();
  const isExceeded = percentage >= 100;
  const isWarning = percentage >= 80 && percentage < 100;

  return (
    <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-gray-600">{icon}</div>
          <h3 className="font-medium text-gray-900">{name}</h3>
        </div>
        {(isExceeded || isWarning) && (
          <div className="flex items-center">
            {isExceeded ? (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Usage Numbers */}
      <div className="mb-2">
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-bold ${colors.text}`}>
            {current}{unit}
          </span>
          <span className="text-sm text-gray-600">
            of {limit}{unit}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${colors.bar} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-2 text-right">
        <span className={`text-sm font-medium ${colors.text}`}>
          {percentage.toFixed(1)}% used
        </span>
      </div>

      {/* Warning Messages */}
      {isExceeded && (
        <div className="mt-3 text-sm text-red-700">
          <p className="font-medium">Limit exceeded!</p>
          <p>Consider upgrading your plan to increase limits.</p>
        </div>
      )}
      {isWarning && !isExceeded && (
        <div className="mt-3 text-sm text-yellow-700">
          <p>Approaching limit. Consider upgrading soon.</p>
        </div>
      )}
    </div>
  );
}
