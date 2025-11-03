'use client';

import React from 'react';
import { getPasswordStrength } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);
  const maxScore = 6;
  const percentage = (score / maxScore) * 100;

  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  const textColorClasses = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-medium ${textColorClasses[color as keyof typeof textColorClasses]}`}>
          {label}
        </span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Password should contain:</p>
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          <li className={password.length >= 8 ? 'text-green-600' : ''}>
            At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
            One uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
            One lowercase letter
          </li>
          <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
            One number
          </li>
        </ul>
      </div>
    </div>
  );
}
