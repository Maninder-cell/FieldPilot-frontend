'use client';

import React, { useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/token-utils';
import { getTenantMembers, getTenantSettings } from '@/lib/onboarding-api';
import { TenantMember, CreateTechnicianWageRateRequest, TechnicianWageRate } from '@/types/onboarding';
import { DollarSign, Calendar, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface TechnicianWageRateFormProps {
  rate?: TechnicianWageRate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TechnicianWageRateForm({ rate, onSuccess, onCancel }: TechnicianWageRateFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [technicians, setTechnicians] = useState<TenantMember[]>([]);
  const [defaultRates, setDefaultRates] = useState({ normal: '50.00', overtime: '75.00' });
  
  const [formData, setFormData] = useState({
    technician: rate?.technician || '',
    normal_hourly_rate: rate?.normal_hourly_rate || '',
    overtime_hourly_rate: rate?.overtime_hourly_rate || '',
    effective_from: rate?.effective_from || new Date().toISOString().split('T')[0],
    effective_to: rate?.effective_to || '',
    notes: rate?.notes || '',
  });

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
      });

      // Pre-fill with defaults if creating new
      if (!rate) {
        setFormData(prev => ({
          ...prev,
          normal_hourly_rate: settings.default_normal_hourly_rate,
          overtime_hourly_rate: settings.default_overtime_hourly_rate,
        }));
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load data');
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

      const data: CreateTechnicianWageRateRequest = {
        technician: formData.technician,
        normal_hourly_rate: parseFloat(formData.normal_hourly_rate),
        overtime_hourly_rate: parseFloat(formData.overtime_hourly_rate),
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || undefined,
        notes: formData.notes || undefined,
      };
      
      if (rate) {
        // Update existing rate
        const { createTechnicianWageRate, updateTechnicianWageRate } = await import('@/lib/onboarding-api');
        await updateTechnicianWageRate(rate.id, data, token);
      } else {
        // Create new rate
        const { createTechnicianWageRate } = await import('@/lib/onboarding-api');
        await createTechnicianWageRate(data, token);
      }
      
      setSuccess(true);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to save rate');
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {rate ? 'Edit' : 'Add'} Technician Wage Rate
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Set individual wage rates for a technician
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
                Rate saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Technician Selection */}
      <div>
        <label htmlFor="technician" className="block text-sm font-medium text-gray-700">
          Technician *
        </label>
        <select
          id="technician"
          value={formData.technician}
          onChange={(e) => handleChange('technician', e.target.value)}
          disabled={!!rate}
          className="mt-1 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        >
          <option value="">Select a technician</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.user.id}>
              {tech.user.full_name} ({tech.user.email})
            </option>
          ))}
        </select>
        {rate && (
          <p className="mt-1 text-xs text-gray-500">
            Cannot change technician for existing rate
          </p>
        )}
      </div>

      {/* Wage Rates */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h4 className="text-base font-medium text-gray-900">Wage Rates</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="normal_hourly_rate" className="block text-sm font-medium text-gray-700">
              Normal Hourly Rate *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="normal_hourly_rate"
                step="0.01"
                min="0"
                value={formData.normal_hourly_rate}
                onChange={(e) => handleChange('normal_hourly_rate', e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 pr-12 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder={defaultRates.normal}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/hr</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Company default: ${defaultRates.normal}/hr
            </p>
          </div>

          <div>
            <label htmlFor="overtime_hourly_rate" className="block text-sm font-medium text-gray-700">
              Overtime Hourly Rate *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="overtime_hourly_rate"
                step="0.01"
                min="0"
                value={formData.overtime_hourly_rate}
                onChange={(e) => handleChange('overtime_hourly_rate', e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 pr-12 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder={defaultRates.overtime}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/hr</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Company default: ${defaultRates.overtime}/hr
            </p>
          </div>
        </div>
      </div>

      {/* Effective Dates */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h4 className="text-base font-medium text-gray-900">Effective Period</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="effective_from" className="block text-sm font-medium text-gray-700">
              Effective From *
            </label>
            <input
              type="date"
              id="effective_from"
              value={formData.effective_from}
              onChange={(e) => handleChange('effective_from', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              When this rate becomes effective
            </p>
          </div>

          <div>
            <label htmlFor="effective_to" className="block text-sm font-medium text-gray-700">
              Effective To (Optional)
            </label>
            <input
              type="date"
              id="effective_to"
              value={formData.effective_to}
              onChange={(e) => handleChange('effective_to', e.target.value)}
              min={formData.effective_from}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for current rate
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          placeholder="e.g., Annual raise, promotion, etc."
        />
        <p className="mt-1 text-xs text-gray-500">
          Add notes about this rate change
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancel
          </button>
        )}
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
            'Save Rate'
          )}
        </button>
      </div>
    </form>
  );
}
