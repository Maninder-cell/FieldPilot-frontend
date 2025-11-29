'use client';

import React, { useState, useEffect } from 'react';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { useScrollToError } from '@/hooks/useScrollToSection';
import { resetPassword } from '@/lib/auth-api';
import {
  validateNewPassword,
  validateNewPasswordConfirm,
  mapApiErrorsToFields,
  getPasswordErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const scrollToError = useScrollToError();
  const [formData, setFormData] = useState({
    email: '',
    reset_token: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get email and reset token from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('reset_email') || '';
      const reset_token = sessionStorage.getItem('reset_token') || '';

      if (email && reset_token) {
        setFormData(prev => ({ ...prev, email, reset_token }));
      } else {
        // Redirect to forgot password if no token
        setApiError('Invalid or expired reset session. Please start the password reset process again.');
      }
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (apiError) setApiError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    let error: string | null = null;

    switch (field) {
      case 'new_password':
        error = validateNewPassword(formData.new_password);
        break;
      case 'new_password_confirm':
        error = validateNewPasswordConfirm(formData.new_password, formData.new_password_confirm);
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
    const fields = ['new_password', 'new_password_confirm'];
    
    // Collect errors
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      let error: string | null = null;

      switch (field) {
        case 'new_password':
          error = validateNewPassword(formData.new_password);
          break;
        case 'new_password_confirm':
          error = validateNewPasswordConfirm(formData.new_password, formData.new_password_confirm);
          break;
      }

      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

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
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    if (!formData.email || !formData.reset_token) {
      setApiError('Invalid or expired reset session. Please start the password reset process again.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(formData);

      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('reset_token');
        sessionStorage.removeItem('reset_email');
      }

      setSuccessMessage('Password reset successful! Redirecting to login...');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (error) {
      const apiErr = error as ApiError;

      const fieldErrors = mapApiErrorsToFields(apiErr);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        scrollToError(fieldErrors);
      }

      setApiError(getPasswordErrorMessage(apiErr));
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

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
        />
      )}

      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          Enter your new password below
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Your reset token will expire in 15 minutes
        </p>
      </div>

      <div>
        <FormInput
          label="New Password"
          name="new_password"
          type="password"
          value={formData.new_password}
          onChange={(value) => handleChange('new_password', value)}
          onBlur={() => handleBlur('new_password')}
          error={touched.new_password ? errors.new_password : undefined}
          placeholder="Enter your new password"
          required
          disabled={isSubmitting}
          autoComplete="new-password"
          autoFocus
        />
        <PasswordStrengthIndicator password={formData.new_password} />
      </div>

      <FormInput
        label="Confirm New Password"
        name="new_password_confirm"
        type="password"
        value={formData.new_password_confirm}
        onChange={(value) => handleChange('new_password_confirm', value)}
        onBlur={() => handleBlur('new_password_confirm')}
        error={touched.new_password_confirm ? errors.new_password_confirm : undefined}
        placeholder="Confirm your new password"
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
        disabled={isSubmitting || !formData.email || !formData.reset_token}
      >
        {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
      </Button>
    </form>
  );
}
