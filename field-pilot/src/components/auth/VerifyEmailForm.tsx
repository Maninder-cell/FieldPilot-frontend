'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { resendOTP } from '@/lib/auth-api';
import {
  validateEmail,
  validateOTP,
  mapApiErrorsToFields,
  getErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface VerifyEmailFormProps {
  email?: string;
  onSuccess?: () => void;
}

export default function VerifyEmailForm({ email: initialEmail, onSuccess }: VerifyEmailFormProps) {
  const { verifyEmail } = useAuth();
  
  const [formData, setFormData] = useState({
    email: initialEmail || '',
    otp_code: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Resend OTP state
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Update email when prop changes
  useEffect(() => {
    if (initialEmail && initialEmail !== formData.email) {
      setFormData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail, formData.email]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear messages when user makes changes
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
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'otp_code':
        error = validateOTP(formData.otp_code);
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
    const fields = ['email', 'otp_code'];
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
        case 'otp_code':
          error = validateOTP(formData.otp_code);
          break;
      }
      
      return error !== null;
    });
    
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
      await verifyEmail(formData.email, formData.otp_code);
      
      setSuccessMessage('Email verified successfully! Redirecting to login...');
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
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

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !formData.email) return;

    setIsResending(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      await resendOTP({
        email: formData.email,
        purpose: 'email_verification',
      });
      
      setSuccessMessage('Verification code sent! Please check your email.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(getErrorMessage(apiErr));
    } finally {
      setIsResending(false);
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
        disabled={isSubmitting || !!initialEmail}
        autoComplete="email"
      />

      <FormInput
        label="Verification Code"
        name="otp_code"
        type="text"
        value={formData.otp_code}
        onChange={(value) => handleChange('otp_code', value)}
        onBlur={() => handleBlur('otp_code')}
        error={touched.otp_code ? errors.otp_code : undefined}
        placeholder="123456"
        required
        disabled={isSubmitting}
        autoComplete="one-time-code"
        autoFocus
      />

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verifying...' : 'Verify Email'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="md"
          fullWidth
          loading={isResending}
          disabled={isResending || resendCooldown > 0 || !formData.email}
          onClick={handleResendOTP}
        >
          {resendCooldown > 0
            ? `Resend Code (${resendCooldown}s)`
            : isResending
            ? 'Sending...'
            : 'Resend Verification Code'}
        </Button>
      </div>
    </form>
  );
}
