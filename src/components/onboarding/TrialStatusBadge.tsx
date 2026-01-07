'use client';

import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface TrialStatusBadgeProps {
  trialEndsAt: string;
  isTrialActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    icon: 'w-5 h-5',
  },
};

export default function TrialStatusBadge({
  trialEndsAt,
  isTrialActive,
  size = 'md',
}: TrialStatusBadgeProps) {
  const sizeConfig = SIZE_CONFIG[size];

  // Calculate days remaining
  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(trialEndsAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  if (!isTrialActive) {
    return (
      <span
        className={`
          inline-flex items-center gap-1 rounded-full border font-medium
          bg-red-100 text-red-700 border-red-200
          ${sizeConfig.padding} ${sizeConfig.text}
        `}
      >
        <XCircle className={sizeConfig.icon} />
        <span>Trial Expired</span>
      </span>
    );
  }

  // Show different colors based on days remaining
  const getColorClasses = () => {
    if (daysRemaining <= 3) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const Icon = daysRemaining <= 3 ? Clock : CheckCircle;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${getColorClasses()}
        ${sizeConfig.padding} ${sizeConfig.text}
      `}
    >
      <Icon className={sizeConfig.icon} />
      <span>
        Trial Active - {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
      </span>
    </span>
  );
}
