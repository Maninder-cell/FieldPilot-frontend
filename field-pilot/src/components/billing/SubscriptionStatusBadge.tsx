import React from 'react';
import { SubscriptionStatus } from '@/types/billing';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

const statusConfig: Record<SubscriptionStatus, { label: string; color: string; icon: string }> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  trialing: {
    label: 'Trial',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '⏱',
  },
  past_due: {
    label: 'Past Due',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⚠',
  },
  canceled: {
    label: 'Canceled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '✕',
  },
  unpaid: {
    label: 'Unpaid',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '!',
  },
  incomplete: {
    label: 'Incomplete',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '◐',
  },
  incomplete_expired: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '⊗',
  },
};

export function SubscriptionStatusBadge({ status, className = '' }: SubscriptionStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}
