'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useScrollToError } from '@/hooks/useScrollToSection';
import { ROLE_OPTIONS, MemberRole } from '@/types/onboarding';
import { validateEmail, validateRequired } from '@/lib/validation';
import { OnboardingApiError } from '@/types/onboarding';
import { X } from 'lucide-react';

interface InviteMemberFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function InviteMemberForm({ onSuccess, onClose }: InviteMemberFormProps) {
  const { inviteTeamMember, isLoading: contextLoading } = useOnboarding();
  const scrollToError = useScrollToError();
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'employee' as MemberRole,
    first_name: '',
    last_name: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
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
      case 'email':
        error = validateRequired(value, 'Email') || validateEmail(value) || '';
        break;
      case 'role':
        error = validateRequired(value, 'Role') || '';
        break;
      case 'first_name':
        if (value && value.trim().length > 0) {
          if (value.trim().length < 2) {
            error = 'First name must be at least 2 characters';
          } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            error = 'First name can only contain letters, spaces, hyphens, and apostrophes';
          }
        }
        break;
      case 'last_name':
        if (value && value.trim().length > 0) {
          if (value.trim().length < 2) {
            error = 'Last name must be at least 2 characters';
          } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            error = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
          }
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.email = validateRequired(formData.email, 'Email') || validateEmail(formData.email) || '';
    newErrors.role = validateRequired(formData.role, 'Role') || '';
    
    // Validate first name if provided
    if (formData.first_name && formData.first_name.trim().length > 0) {
      if (formData.first_name.trim().length < 2) {
        newErrors.first_name = 'First name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.first_name)) {
        newErrors.first_name = 'First name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }
    
    // Validate last name if provided
    if (formData.last_name && formData.last_name.trim().length > 0) {
      if (formData.last_name.trim().length < 2) {
        newErrors.last_name = 'Last name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.last_name)) {
        newErrors.last_name = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }

    setErrors(newErrors);
    setTouched({
      email: true,
      role: true,
      first_name: true,
      last_name: true,
    });

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    // Scroll to first error if validation fails
    if (hasErrors) {
      scrollToError(newErrors);
    }

    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await inviteTeamMember(formData);
      setSuccessMessage(`Invitation sent to ${formData.email} successfully!`);
      
      // Reset form
      setFormData({
        email: '',
        role: 'employee',
        first_name: '',
        last_name: '',
      });
      setErrors({});
      setTouched({});

      // Close modal after short delay
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;
      
      if (apiError.details) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(apiError.details).forEach(([field, messages]) => {
          fieldErrors[field] = messages[0];
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        scrollToError(fieldErrors);
      }
      
      setApiError(apiError.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Invite Team Member</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}
      
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(value) => handleChange('email', value)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : ''}
          required
          placeholder="colleague@example.com"
        />

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 bg-white"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {touched.role && errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {ROLE_OPTIONS.find(opt => opt.value === formData.role)?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name (Optional)"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={(value) => handleChange('first_name', value)}
            onBlur={() => handleBlur('first_name')}
            error={touched.first_name ? errors.first_name : ''}
            placeholder="John"
          />

          <FormInput
            label="Last Name (Optional)"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={(value) => handleChange('last_name', value)}
            onBlur={() => handleBlur('last_name')}
            error={touched.last_name ? errors.last_name : ''}
            placeholder="Doe"
          />
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-800">
            <strong>Note:</strong> If the user already has an account, they'll be added immediately. 
            Otherwise, they'll receive an invitation email to join.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting || contextLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting || contextLoading}
            disabled={isSubmitting || contextLoading}
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </div>
  );
}
