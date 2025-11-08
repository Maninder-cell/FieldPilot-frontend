'use client';

import React, { useState, useEffect } from 'react';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { resetPassword, resendOTP } from '@/lib/auth-api';
import {
  validateEmail,
  validateOTP,
  validateNewPassword,
  validateNewPasswordConfirm,
  mapApiErrorsToFields,
  getPasswordErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface ResetPasswordFormProps {
  email?: string;
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ email: initialEmail, onSuccess }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    email: initialEmail || '',
    otp_code: '',
    new_password: '',
    new_password_confirm: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (initialEmail && initialEmail !== formData.email) {
      setFormData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail, formData.email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'otp_code':
        error = validateOTP(formData.otp_code);
        break;
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
    const fields = ['email', 'otp_code', 'new_password', 'new_password_confirm'];
    fields.forEach(validateField);
    
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    
    const hasErrors = fields.some(field => {
      let error: string | null = null;
      
      switch (field) {
        case 'email':
          error = validateEmail(formData.email);
          break;
        case 'otp_code':
          error = validateOTP(formData.otp_code);
          break;
        case 'new_password':
          error = validateNewPassword(formData.new_password);
          break;
        case 'new_password_confirm':
          error = validateNewPasswordConfirm(formData.new_password, formData.new_password_confirm);
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
      await resetPassword(formData);
      
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
      }
      
      setApiError(getPasswordErrorMessage(apiErr));
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
        purpose: 'password_reset',
      });
      
      setSuccessMessage('Verification code sent! Please check your email.');
      setResendCooldown(60);
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(getPasswordErrorMessage(apiErr));
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
        autoFocus={!!initialEmail}
      />

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

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
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
