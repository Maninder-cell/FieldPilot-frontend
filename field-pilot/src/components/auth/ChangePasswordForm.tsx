'use client';

import React, { useState } from 'react';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { changePassword } from '@/lib/auth-api';
import { getAccessToken } from '@/lib/token-utils';
import {
  validateCurrentPassword,
  validateNewPassword,
  validateNewPasswordConfirm,
  mapApiErrorsToFields,
  getPasswordErrorMessage,
} from '@/lib/validation';
import { ApiError } from '@/types/auth';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export default function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
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
      case 'current_password':
        error = validateCurrentPassword(formData.current_password);
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
    const fields = ['current_password', 'new_password', 'new_password_confirm'];
    fields.forEach(validateField);
    
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    
    const hasErrors = fields.some(field => {
      let error: string | null = null;
      
      switch (field) {
        case 'current_password':
          error = validateCurrentPassword(formData.current_password);
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

    const accessToken = getAccessToken();
    if (!accessToken) {
      setApiError('You must be logged in to change your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(formData, accessToken);
      
      setSuccessMessage('Password changed successfully!');
      
      // Clear form
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });
      setTouched({});
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
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
        label="Current Password"
        name="current_password"
        type="password"
        value={formData.current_password}
        onChange={(value) => handleChange('current_password', value)}
        onBlur={() => handleBlur('current_password')}
        error={touched.current_password ? errors.current_password : undefined}
        placeholder="Enter your current password"
        required
        disabled={isSubmitting}
        autoComplete="current-password"
        autoFocus
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Changing Password...' : 'Change Password'}
      </Button>
    </form>
  );
}
