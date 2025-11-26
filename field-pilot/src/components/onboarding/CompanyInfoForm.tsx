'use client';

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { COMPANY_SIZE_OPTIONS } from '@/types/onboarding';
import {
  validateEmail,
  validateRequired,
  mapApiErrorsToFields,
  getErrorMessage,
} from '@/lib/validation';
import { OnboardingApiError } from '@/types/onboarding';

interface CompanyInfoFormProps {
  onSuccess?: () => void;
}

export default function CompanyInfoForm({ onSuccess }: CompanyInfoFormProps) {
  const { tenant, createCompany, updateCompany, completeStep, isLoading } = useOnboarding();

  const [formData, setFormData] = useState({
    name: '',
    company_email: '',
    company_phone: '',
    company_size: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pre-fill form with existing company data if available
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        company_email: tenant.company_email || '',
        company_phone: tenant.company_phone || '',
        company_size: tenant.company_size || '',
        industry: tenant.industry || '',
        website: tenant.website || '',
        address: tenant.address || '',
        city: tenant.city || '',
        state: tenant.state || '',
        zip_code: tenant.zip_code || '',
        country: tenant.country || '',
      });
    }
  }, [tenant]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateField = (field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'name':
        error = validateRequired(value, 'Company name') || '';
        break;
      case 'company_email':
        error = validateRequired(value, 'Company email') || validateEmail(value) || '';
        break;
      case 'website':
        if (value) {
          // Basic URL validation
          try {
            new URL(value);
          } catch {
            error = 'Please enter a valid URL';
          }
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    newErrors.name = validateRequired(formData.name, 'Company name') || '';
    newErrors.company_email = validateRequired(formData.company_email, 'Company email') || validateEmail(formData.company_email) || '';

    // Optional fields with validation
    if (formData.website) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      company_email: true,
      website: true,
    });

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty optional fields and ensure required fields are present
      const submitData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          submitData[key] = value;
        }
      });

      // Check if company already exists
      if (tenant) {
        // Update existing company
        await updateCompany(submitData);
      } else {
        // Create new company
        await createCompany(submitData);
      }

      // Mark step 1 as complete and advance to step 2
      await completeStep(1);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;

      // Map API errors to form fields
      if (apiError.details) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(apiError.details).forEach(([field, messages]) => {
          fieldErrors[field] = messages[0];
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }

      // Set general error message
      setApiError(apiError.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
        <p className="text-gray-600">
          Let's start by setting up your company profile. This information will be used throughout the platform.
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <FormInput
          label="Company Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={(value) => handleChange('name', value)}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : ''}
          required
          placeholder="Acme Corporation"
        />

        <FormInput
          label="Company Email"
          name="company_email"
          type="email"
          value={formData.company_email}
          onChange={(value) => handleChange('company_email', value)}
          onBlur={() => handleBlur('company_email')}
          error={touched.company_email ? errors.company_email : ''}
          required
          placeholder="contact@acme.com"
        />

        <FormInput
          label="Company Phone"
          name="company_phone"
          type="tel"
          value={formData.company_phone}
          onChange={(value) => handleChange('company_phone', value)}
          onBlur={() => handleBlur('company_phone')}
          error={touched.company_phone ? errors.company_phone : ''}
          placeholder="+1 (555) 123-4567"
        />

        <div>
          <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-1">
            Company Size
          </label>
          <select
            id="company_size"
            name="company_size"
            value={formData.company_size}
            onChange={(e) => handleChange('company_size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select company size</option>
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <FormInput
          label="Industry"
          name="industry"
          type="text"
          value={formData.industry}
          onChange={(value) => handleChange('industry', value)}
          onBlur={() => handleBlur('industry')}
          error={touched.industry ? errors.industry : ''}
          placeholder="Manufacturing, Technology, Healthcare, etc."
        />

        <FormInput
          label="Website"
          name="website"
          type="text"
          value={formData.website}
          onChange={(value) => handleChange('website', value)}
          onBlur={() => handleBlur('website')}
          error={touched.website ? errors.website : ''}
          placeholder="https://www.acme.com"
        />
      </div>

      {/* Optional Address Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Address (Optional)</h3>

        <FormInput
          label="Street Address"
          name="address"
          type="text"
          value={formData.address}
          onChange={(value) => handleChange('address', value)}
          placeholder="123 Main Street"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="City"
            name="city"
            type="text"
            value={formData.city}
            onChange={(value) => handleChange('city', value)}
            placeholder="New York"
          />

          <FormInput
            label="State/Province"
            name="state"
            type="text"
            value={formData.state}
            onChange={(value) => handleChange('state', value)}
            placeholder="NY"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="ZIP/Postal Code"
            name="zip_code"
            type="text"
            value={formData.zip_code}
            onChange={(value) => handleChange('zip_code', value)}
            placeholder="10001"
          />

          <FormInput
            label="Country"
            name="country"
            type="text"
            value={formData.country}
            onChange={(value) => handleChange('country', value)}
            placeholder="United States"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting || isLoading}
        disabled={isSubmitting || isLoading}
      >
        Continue to Plan Selection
      </Button>
    </form>
  );
}
