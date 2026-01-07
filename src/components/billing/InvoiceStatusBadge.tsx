import React from 'react';
import { InvoiceStatus } from '@/types/billing';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: string }> = {
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  open: {
    label: 'Open',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '○',
  },
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '◐',
  },
  void: {
    label: 'Void',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '✕',
  },
  uncollectible: {
    label: 'Uncollectible',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '!',
  },
};

export function InvoiceStatusBadge({ status, className = '' }: InvoiceStatusBadgeProps) {
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
