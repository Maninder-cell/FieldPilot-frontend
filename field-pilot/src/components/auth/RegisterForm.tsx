'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { useScrollToError } from '@/hooks/useScrollToSection';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validatePhone,
  validateRequired,
  mapApiErrorsToFields,
  getErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface RegisterFormProps {
  onSuccess?: (email: string) => void;
  initialEmail?: string;
}

export default function RegisterForm({ onSuccess, initialEmail }: RegisterFormProps) {
  const { register } = useAuth();
  const scrollToError = useScrollToError();
  
  const [formData, setFormData] = useState({
    email: initialEmail || '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
    validateField(field);
  };

  const validateField = (field: string) => {
    let error: string | null = null;

    switch (field) {
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'password_confirm':
        error = validatePasswordConfirm(formData.password, formData.password_confirm);
        break;
      case 'first_name':
        error = validateRequired(formData.first_name, 'First name');
        break;
      case 'last_name':
        error = validateRequired(formData.last_name, 'Last name');
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone'];
    
    // Collect errors
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      let error: string | null = null;
      
      switch (field) {
        case 'email':
          error = validateEmail(formData.email);
          break;
        case 'password':
          error = validatePassword(formData.password);
          break;
        case 'password_confirm':
          error = validatePasswordConfirm(formData.password, formData.password_confirm);
          break;
        case 'first_name':
          error = validateRequired(formData.first_name, 'First name');
          break;
        case 'last_name':
          error = validateRequired(formData.last_name, 'Last name');
          break;
        case 'phone':
          error = validatePhone(formData.phone);
          break;
      }
      
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    
    // Scroll to first error if validation fails
    if (Object.keys(newErrors).length > 0) {
      scrollToError(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      
      // Call success callback with email
      if (onSuccess) {
        onSuccess(formData.email);
      }
    } catch (error) {
      const apiErr = error as ApiError;
      
      // Map API errors to form fields
      const fieldErrors = mapApiErrorsToFields(apiErr);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        scrollToError(fieldErrors);
      }
      
      // Set general error message
      setApiError(getErrorMessage(apiErr));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {apiError && (
        <Alert
          type="error"
          message={apiError}
          onClose={() => setApiError(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="first_name"
          type="text"
          value={formData.first_name}
          onChange={(value) => handleChange('first_name', value)}
          onBlur={() => handleBlur('first_name')}
          error={touched.first_name ? errors.first_name : undefined}
          placeholder="John"
          required
          disabled={isSubmitting}
          autoComplete="given-name"
        />

        <FormInput
          label="Last Name"
          name="last_name"
          type="text"
          value={formData.last_name}
          onChange={(value) => handleChange('last_name', value)}
          onBlur={() => handleBlur('last_name')}
          error={touched.last_name ? errors.last_name : undefined}
          placeholder="Doe"
          required
          disabled={isSubmitting}
          autoComplete="family-name"
        />
      </div>

      <FormInput
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={(value) => handleChange('email', value)}
        onBlur={() => handleBlur('email')}
        error={touched.email ? errors.email : undefined}
        placeholder="john.doe@example.com"
        required
        disabled={isSubmitting}
        autoComplete="email"
      />

      <FormInput
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={(value) => handleChange('phone', value)}
        onBlur={() => handleBlur('phone')}
        error={touched.phone ? errors.phone : undefined}
        placeholder="+1234567890"
        disabled={isSubmitting}
        autoComplete="tel"
      />

      <div>
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(value) => handleChange('password', value)}
          onBlur={() => handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          placeholder="Enter your password"
          required
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      <FormInput
        label="Confirm Password"
        name="password_confirm"
        type="password"
        value={formData.password_confirm}
        onChange={(value) => handleChange('password_confirm', value)}
        onBlur={() => handleBlur('password_confirm')}
        error={touched.password_confirm ? errors.password_confirm : undefined}
        placeholder="Confirm your password"
        required
        disabled={isSubmitting}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
