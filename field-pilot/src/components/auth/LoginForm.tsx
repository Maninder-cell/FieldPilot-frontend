'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  validateEmail,
  validateRequired,
  mapApiErrorsToFields,
  getErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const { login } = useAuth();
  
  // Get remembered email from localStorage
  const rememberedEmail = typeof window !== 'undefined' 
    ? localStorage.getItem('remembered_email') || '' 
    : '';
  
  const [formData, setFormData] = useState({
    email: rememberedEmail,
    password: '',
    remember_me: !!rememberedEmail,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | boolean) => {
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
        error = validateRequired(formData.password, 'Password');
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
    const fields = ['email', 'password'];
    fields.forEach(validateField);
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    
    // Check if there are any errors
    const hasErrors = fields.some(field => {
      let error: string | null = null;
      
      switch (field) {
        case 'email':
          error = validateEmail(formData.email);
          break;
        case 'password':
          error = validateRequired(formData.password, 'Password');
          break;
      }
      
      return error !== null;
    });
    
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password, formData.remember_me);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiErr = error as ApiError;
      
      // Map API errors to form fields
      const fieldErrors = mapApiErrorsToFields(apiErr);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
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
        autoFocus
      />

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
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember_me"
            name="remember_me"
            type="checkbox"
            checked={formData.remember_me}
            onChange={(e) => handleChange('remember_me', e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="remember_me"
            className="ml-2 block text-sm text-gray-700 cursor-pointer"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a
            href="/forgot-password"
            className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
