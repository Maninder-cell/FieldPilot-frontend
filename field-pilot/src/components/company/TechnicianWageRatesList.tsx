'use client';

import React, { useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/token-utils';
import { getTenantMembers } from '@/lib/onboarding-api';
import { TenantMember, TechnicianWageRate } from '@/types/onboarding';
import { DollarSign, Calendar, User, Plus, Edit2, History, Loader2, AlertCircle } from 'lucide-react';

interface TechnicianWageRatesListProps {
  onCreateRate?: () => void;
  onEditRate?: (rate: TechnicianWageRate) => void;
}

export default function TechnicianWageRatesList({ onCreateRate, onEditRate }: TechnicianWageRatesListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<TenantMember[]>([]);
  const [rates, setRates] = useState<TechnicianWageRate[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated');

      // Load technicians
      const members = await getTenantMembers(token);
      const techMembers = members.filter(m => m.role === 'technician');
      setTechnicians(techMembers);

      // Load wage rates
      const { getTechnicianWageRates } = await import('@/lib/onboarding-api');
      const wageRates = await getTechnicianWageRates(token);
      setRates(wageRates);

    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (technicians.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No technicians found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add technicians to your team to set their wage rates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Technician Wage Rates</h3>
          <p className="mt-1 text-sm text-gray-600">
            Set individual wage rates for each technician
          </p>
        </div>
        <button
          onClick={onCreateRate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rate
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How it works</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Set individual rates for each technician</li>
                <li>Track rate history with effective dates</li>
                <li>Automatically use correct rates in reports</li>
                <li>Schedule future rate changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technicians List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technician
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Rate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effective From
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {technicians.map((tech) => {
              const techRate = rates.find(r => r.technician === tech.user.id && r.is_active);
              
              return (
                <tr key={tech.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-medium text-sm">
                            {tech.user.first_name[0]}{tech.user.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tech.user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tech.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {techRate ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(techRate.normal_hourly_rate)} / hr
                        </div>
                        <div className="text-xs text-gray-500">
                          OT: {formatCurrency(techRate.overtime_hourly_rate)} / hr
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        Using company default
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {techRate ? formatDate(techRate.effective_from) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => techRate && onEditRate?.(techRate)}
                      disabled={!techRate}
                      className="text-emerald-600 hover:text-emerald-900 disabled:text-gray-400 disabled:cursor-not-allowed mr-4"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      disabled
                      className="text-gray-400 cursor-not-allowed"
                      title="Coming soon"
                    >
                      <History className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
