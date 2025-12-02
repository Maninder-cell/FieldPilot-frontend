'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTenantSettings, updateTenantSettings } from '@/lib/onboarding-api';
import { getAccessToken } from '@/lib/token-utils';
import { TenantSettings, UpdateTenantSettingsRequest } from '@/types/onboarding';
import { DollarSign, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface WageSettingsFormProps {
  onSuccess?: () => void;
}

export default function WageSettingsForm({ onSuccess }: WageSettingsFormProps) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [formData, setFormData] = useState({
    normal_working_hours_per_day: '8.00',
    default_normal_hourly_rate: '50.00',
    default_overtime_hourly_rate: '75.00',
    overtime_multiplier: '1.50',
    currency: 'USD',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const data = await getTenantSettings(token);
      setSettings(data);
      setFormData({
        normal_working_hours_per_day: data.normal_working_hours_per_day || '8.00',
        default_normal_hourly_rate: data.default_normal_hourly_rate || '50.00',
        default_overtime_hourly_rate: data.default_overtime_hourly_rate || '75.00',
        overtime_multiplier: data.overtime_multiplier || '1.50',
        currency: data.currency || 'USD',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const updateData: UpdateTenantSettingsRequest = {
        normal_working_hours_per_day: parseFloat(formData.normal_working_hours_per_day),
        default_normal_hourly_rate: parseFloat(formData.default_normal_hourly_rate),
        default_overtime_hourly_rate: parseFloat(formData.default_overtime_hourly_rate),
        overtime_multiplier: parseFloat(formData.overtime_multiplier),
        currency: formData.currency,
      };

      await updateTenantSettings(updateData, token);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Wage & Working Hours Settings</h3>
        <p className="mt-1 text-sm text-gray-600">
          Configure default working hours and wage rates for your company. These settings apply to all technicians unless individual rates are set.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Settings updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Working Hours Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <h4 className="text-base font-medium text-gray-900">Working Hours</h4>
        </div>

        <div>
          <label htmlFor="normal_working_hours_per_day" className="block text-sm font-medium text-gray-700">
            Normal Working Hours Per Day
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              id="normal_working_hours_per_day"
              step="0.25"
              min="0"
              max="24"
              value={formData.normal_working_hours_per_day}
              onChange={(e) => handleChange('normal_working_hours_per_day', e.target.value)}
              className="block w-full rounded-md border-gray-300 pr-12 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="8.00"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">hours</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Hours worked beyond this will be considered overtime (e.g., 8 hours for standard workday)
          </p>
        </div>
      </div>

      {/* Wage Rates Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h4 className="text-base font-medium text-gray-900">Default Wage Rates</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="default_normal_hourly_rate" className="block text-sm font-medium text-gray-700">
              Normal Hourly Rate
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{formData.currency === 'USD' ? '$' : formData.currency}</span>
              </div>
              <input
                type="number"
                id="default_normal_hourly_rate"
                step="0.01"
                min="0"
                value={formData.default_normal_hourly_rate}
                onChange={(e) => handleChange('default_normal_hourly_rate', e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 pr-12 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="50.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/hr</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Rate for normal working hours
            </p>
          </div>

          <div>
            <label htmlFor="default_overtime_hourly_rate" className="block text-sm font-medium text-gray-700">
              Overtime Hourly Rate
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{formData.currency === 'USD' ? '$' : formData.currency}</span>
              </div>
              <input
                type="number"
                id="default_overtime_hourly_rate"
                step="0.01"
                min="0"
                value={formData.default_overtime_hourly_rate}
                onChange={(e) => handleChange('default_overtime_hourly_rate', e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 pr-12 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="75.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/hr</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Rate for overtime hours
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="overtime_multiplier" className="block text-sm font-medium text-gray-700">
              Overtime Multiplier
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="overtime_multiplier"
                step="0.01"
                min="1"
                max="3"
                value={formData.overtime_multiplier}
                onChange={(e) => handleChange('overtime_multiplier', e.target.value)}
                className="block w-full rounded-md border-gray-300 pr-8 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="1.50"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">×</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Multiplier for overtime (e.g., 1.5 for time-and-a-half)
            </p>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              required
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Currency for all wage rates
            </p>
          </div>
        </div>
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
                <li>These are default rates used for all technicians</li>
                <li>Individual technician rates can be set separately (coming soon)</li>
                <li>Reports automatically use these rates for cost calculations</li>
                <li>Changes apply to new time logs immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </form>
  );
}
