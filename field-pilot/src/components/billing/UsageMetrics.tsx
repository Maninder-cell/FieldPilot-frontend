'use client';

import React from 'react';
import Link from 'next/link';
import { UsageSummary } from '@/types/billing';
import { UsageMetric } from './UsageMetric';

interface UsageMetricsProps {
  usage: UsageSummary | null;
  showUpgradePrompt?: boolean;
}

export function UsageMetrics({ usage, showUpgradePrompt = true }: UsageMetricsProps) {
  if (!usage) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resource Usage</h2>
        <p className="text-gray-600">No usage data available</p>
      </div>
    );
  }

  const hasExceededLimits = 
    usage.users.percentage >= 100 ||
    usage.equipment.percentage >= 100 ||
    usage.storage.percentage >= 100;

  const hasWarnings =
    usage.users.percentage >= 80 ||
    usage.equipment.percentage >= 80 ||
    usage.storage.percentage >= 80;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Resource Usage</h2>
        {showUpgradePrompt && (hasExceededLimits || hasWarnings) && (
          <Link
            href="/billing/plans"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Upgrade Plan →
          </Link>
        )}
      </div>

      {/* Exceeded Limits Alert */}
      {hasExceededLimits && showUpgradePrompt && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900">Usage Limits Exceeded</p>
              <p className="text-sm text-red-700 mt-1">
                You've exceeded one or more resource limits. Please upgrade your plan to continue using all features.
              </p>
              <Link
                href="/billing/plans"
                className="inline-block mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
              >
                View upgrade options
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Users */}
        <UsageMetric
          name="Users"
          metric={usage.users}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        {/* Equipment */}
        <UsageMetric
          name="Equipment"
          metric={usage.equipment}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />

        {/* Storage */}
        <UsageMetric
          name="Storage"
          metric={usage.storage}
          unit=" GB"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          }
        />
      </div>

      {/* Help Text */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Usage is updated in real-time. Need more resources?{' '}
          <Link href="/billing/plans" className="text-blue-600 hover:underline">
            Compare plans
          </Link>
        </p>
      </div>
    </div>
  );
}
