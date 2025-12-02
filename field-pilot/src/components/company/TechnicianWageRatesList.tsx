'use client';

import React, { useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/token-utils';
import { getTenantMembers, getTenantSettings } from '@/lib/onboarding-api';
import { TenantMember, TechnicianWageRate } from '@/types/onboarding';
import { User, Edit2, History, Loader2, AlertCircle, X } from 'lucide-react';

interface TechnicianWageRatesListProps {
  onEditRate?: (technician: TenantMember, currentRate?: TechnicianWageRate) => void;
}

export default function TechnicianWageRatesList({ onEditRate }: TechnicianWageRatesListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<TenantMember[]>([]);
  const [rates, setRates] = useState<TechnicianWageRate[]>([]);
  const [defaultRates, setDefaultRates] = useState({ normal: '50.00', overtime: '75.00', currency: 'USD' });
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<TechnicianWageRate[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

      // Load default rates
      const settings = await getTenantSettings(token);
      setDefaultRates({
        normal: settings.default_normal_hourly_rate,
        overtime: settings.default_overtime_hourly_rate,
        currency: settings.currency,
      });

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

  const loadHistory = async (technicianId: string) => {
    try {
      setLoadingHistory(true);
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const { getTechnicianWageRateHistory } = await import('@/lib/onboarding-api');
      const history = await getTechnicianWageRateHistory(technicianId, token);
      setHistoryData(history);
      setShowHistory(technicianId);
    } catch (err: any) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const symbol = defaultRates.currency === 'USD' ? '$' : defaultRates.currency === 'EUR' ? '€' : defaultRates.currency === 'GBP' ? '£' : defaultRates.currency;
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Technician Wage Rates</h3>
        <p className="mt-1 text-sm text-gray-600">
          Manage individual wage rates for each technician
        </p>
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
                <li>Click Edit to set or update a technician's wage rate</li>
                <li>View history to see all past rate changes</li>
                <li>Technicians without custom rates use company defaults</li>
                <li>Rates automatically apply based on effective dates</li>
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
                Normal Rate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overtime Rate
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
              const hasHistory = rates.filter(r => r.technician === tech.user.id).length > 1;
              
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
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(techRate.normal_hourly_rate)} / hr
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(defaultRates.normal)} / hr
                        </div>
                        <div className="text-xs text-gray-400 italic">
                          (default)
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {techRate ? (
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(techRate.overtime_hourly_rate)} / hr
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(defaultRates.overtime)} / hr
                        </div>
                        <div className="text-xs text-gray-400 italic">
                          (default)
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {techRate ? formatDate(techRate.effective_from) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => onEditRate?.(tech, techRate)}
                      className="text-emerald-600 hover:text-emerald-900 inline-flex items-center"
                      title="Edit wage rate"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    {hasHistory && (
                      <button
                        onClick={() => loadHistory(tech.user.id)}
                        disabled={loadingHistory}
                        className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 inline-flex items-center"
                        title="View rate history"
                      >
                        <History className="w-4 h-4 mr-1" />
                        History
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Wage Rate History</h3>
              <button
                onClick={() => setShowHistory(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {historyData.map((rate, index) => (
                    <div
                      key={rate.id}
                      className={`border rounded-lg p-4 ${rate.is_active ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {rate.is_active && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                Current
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDate(rate.effective_from)}
                              {rate.effective_to && ` - ${formatDate(rate.effective_to)}`}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <div className="text-xs text-gray-500">Normal Rate</div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(rate.normal_hourly_rate)} / hr
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Overtime Rate</div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(rate.overtime_hourly_rate)} / hr
                              </div>
                            </div>
                          </div>
                          {rate.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Notes:</span> {rate.notes}
                            </div>
                          )}
                          {rate.created_by_name && (
                            <div className="text-xs text-gray-500 mt-2">
                              Created by {rate.created_by_name} on {formatDate(rate.created_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowHistory(null)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
