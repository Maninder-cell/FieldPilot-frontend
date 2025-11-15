import React from 'react';
import { PaymentStatus } from '@/types/billing';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: string }> = {
  succeeded: {
    label: 'Succeeded',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  pending: {
    label: 'Pending',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '⏱',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '✕',
  },
  canceled: {
    label: 'Canceled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '○',
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '↩',
  },
};

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
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
