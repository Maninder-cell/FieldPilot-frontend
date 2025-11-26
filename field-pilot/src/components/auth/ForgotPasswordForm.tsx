'use client';

import React, { useState } from 'react';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { forgotPassword } from '@/lib/auth-api';
import {
  validateEmail,
  mapApiErrorsToFields,
  getErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setEmail(value);

    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }

    if (apiError) setApiError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    validateField();
  };

  const validateField = () => {
    const error = validateEmail(email);

    if (error) {
      setErrors(prev => ({ ...prev, email: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    validateField();
    setTouched({ email: true });

    const error = validateEmail(email);
    return error === null;
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
      await forgotPassword({ email });

      setSuccessMessage('If the email exists, a password reset code has been sent. Please check your email.');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(email);
        }
      }, 2000);
    } catch (error) {
      const apiErr = error as ApiError;

      const fieldErrors = mapApiErrorsToFields(apiErr);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }

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

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
        />
      )}

      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <FormInput
        label="Email Address"
        name="email"
        type="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email ? errors.email : undefined}
        placeholder="john.doe@example.com"
        required
        disabled={isSubmitting}
        autoComplete="email"
        autoFocus
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Verification Code'}
      </Button>
    </form>
  );
}
