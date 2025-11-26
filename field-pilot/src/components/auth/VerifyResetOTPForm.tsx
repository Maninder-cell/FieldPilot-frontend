'use client';

import React, { useState, useEffect } from 'react';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { verifyResetOTP, resendOTP } from '@/lib/auth-api';
import {
  validateOTP,
  mapApiErrorsToFields,
  getErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface VerifyResetOTPFormProps {
  email: string;
  onSuccess?: (resetToken: string) => void;
}

export default function VerifyResetOTPForm({ email, onSuccess }: VerifyResetOTPFormProps) {
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (value: string) => {
    setOtp(value);

    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    if (apiError) setApiError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleBlur = () => {
    setTouched(prev => ({ ...prev, otp: true }));
    validateField();
  };

  const validateField = () => {
    const error = validateOTP(otp);

    if (error) {
      setErrors(prev => ({ ...prev, otp: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.otp;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    validateField();
    setTouched({ otp: true });

    const error = validateOTP(otp);
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
      const response = await verifyResetOTP({
        email,
        otp_code: otp
      });

      setSuccessMessage('OTP verified successfully! Redirecting...');

      setTimeout(() => {
        if (onSuccess && response.reset_token) {
          onSuccess(response.reset_token);
        }
      }, 1500);
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

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setApiError(null);
    setSuccessMessage(null);
    setErrors({}); // Clear all field errors

    try {
      await resendOTP({
        email,
        purpose: 'password_reset',
      });

      setSuccessMessage('New verification code sent! Please check your email.');
      setResendCooldown(60);
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

      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          We sent a verification code to <strong>{email}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          The code will expire in 10 minutes
        </p>
      </div>

      <FormInput
        label="Verification Code"
        name="otp"
        type="text"
        value={otp}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.otp ? errors.otp : undefined}
        placeholder="Enter 6-digit code"
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
          {isSubmitting ? 'Verifying...' : 'Verify Code'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="md"
          fullWidth
          loading={isResending}
          disabled={isResending || resendCooldown > 0}
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
