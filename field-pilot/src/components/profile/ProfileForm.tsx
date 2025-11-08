'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import TagInput from '@/components/ui/TagInput';
import Toggle from '@/components/ui/Toggle';
import { getProfile, updateProfile } from '@/lib/auth-api';
import { getAccessToken } from '@/lib/token-utils';
import {
  validateRequired,
  validatePhone,
  validateDateOfBirth,
  validateZipCode,
  validateEmergencyPhone,
  mapApiErrorsToFields,
  getErrorMessage,
} from '@/lib/validation';
import { UserProfile, UserProfileFormData, ApiError } from '@/types/auth';

interface ProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProfileForm({ onSuccess, onCancel }: ProfileFormProps) {
  const router = useRouter();
  const [originalData, setOriginalData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfileFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    avatar_url: null,
    department: null,
    job_title: null,
    date_of_birth: null,
    address: null,
    city: null,
    state: null,
    zip_code: null,
    country: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relationship: null,
    skills: [],
    certifications: [],
    timezone: 'America/Los_Angeles',
    language: 'en',
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setApiError('You must be logged in to edit your profile.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getProfile(accessToken);
        setOriginalData(data);
        
        // Populate form with existing data
        setFormData({
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          phone: data.user.phone || '',
          avatar_url: data.user.avatar_url || null,
          department: data.user.department || null,
          job_title: data.user.job_title || null,
          date_of_birth: data.date_of_birth,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          country: data.country,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          emergency_contact_relationship: data.emergency_contact_relationship,
          skills: data.skills,
          certifications: data.certifications,
          timezone: data.timezone,
          language: data.language,
          email_notifications: data.email_notifications,
          sms_notifications: data.sms_notifications,
          push_notifications: data.push_notifications,
        });
      } catch (err) {
        const apiErr = err as ApiError;
        setApiError(getErrorMessage(apiErr));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!originalData) return false;
    
    return (
      formData.first_name !== originalData.user.first_name ||
      formData.last_name !== originalData.user.last_name ||
      formData.phone !== (originalData.user.phone || '') ||
      formData.avatar_url !== originalData.user.avatar_url ||
      formData.department !== originalData.user.department ||
      formData.job_title !== originalData.user.job_title ||
      formData.date_of_birth !== originalData.date_of_birth ||
      formData.address !== originalData.address ||
      formData.city !== originalData.city ||
      formData.state !== originalData.state ||
      formData.zip_code !== originalData.zip_code ||
      formData.country !== originalData.country ||
      formData.emergency_contact_name !== originalData.emergency_contact_name ||
      formData.emergency_contact_phone !== originalData.emergency_contact_phone ||
      formData.emergency_contact_relationship !== originalData.emergency_contact_relationship ||
      JSON.stringify(formData.skills) !== JSON.stringify(originalData.skills) ||
      JSON.stringify(formData.certifications) !== JSON.stringify(originalData.certifications) ||
      formData.timezone !== originalData.timezone ||
      formData.language !== originalData.language ||
      formData.email_notifications !== originalData.email_notifications ||
      formData.sms_notifications !== originalData.sms_notifications ||
      formData.push_notifications !== originalData.push_notifications
    );
  }, [formData, originalData]);

  // Get only changed fields
  const getChangedFields = (): Partial<UserProfileFormData> => {
    if (!originalData) return formData;
    
    const changes: Partial<UserProfileFormData> = {};
    
    if (formData.first_name !== originalData.user.first_name) changes.first_name = formData.first_name;
    if (formData.last_name !== originalData.user.last_name) changes.last_name = formData.last_name;
    if (formData.phone !== (originalData.user.phone || '')) changes.phone = formData.phone;
    if (formData.avatar_url !== originalData.user.avatar_url) changes.avatar_url = formData.avatar_url;
    if (formData.department !== originalData.user.department) changes.department = formData.department;
    if (formData.job_title !== originalData.user.job_title) changes.job_title = formData.job_title;
    if (formData.date_of_birth !== originalData.date_of_birth) changes.date_of_birth = formData.date_of_birth;
    if (formData.address !== originalData.address) changes.address = formData.address;
    if (formData.city !== originalData.city) changes.city = formData.city;
    if (formData.state !== originalData.state) changes.state = formData.state;
    if (formData.zip_code !== originalData.zip_code) changes.zip_code = formData.zip_code;
    if (formData.country !== originalData.country) changes.country = formData.country;
    if (formData.emergency_contact_name !== originalData.emergency_contact_name) changes.emergency_contact_name = formData.emergency_contact_name;
    if (formData.emergency_contact_phone !== originalData.emergency_contact_phone) changes.emergency_contact_phone = formData.emergency_contact_phone;
    if (formData.emergency_contact_relationship !== originalData.emergency_contact_relationship) changes.emergency_contact_relationship = formData.emergency_contact_relationship;
    if (JSON.stringify(formData.skills) !== JSON.stringify(originalData.skills)) changes.skills = formData.skills;
    if (JSON.stringify(formData.certifications) !== JSON.stringify(originalData.certifications)) changes.certifications = formData.certifications;
    if (formData.timezone !== originalData.timezone) changes.timezone = formData.timezone;
    if (formData.language !== originalData.language) changes.language = formData.language;
    if (formData.email_notifications !== originalData.email_notifications) changes.email_notifications = formData.email_notifications;
    if (formData.sms_notifications !== originalData.sms_notifications) changes.sms_notifications = formData.sms_notifications;
    if (formData.push_notifications !== originalData.push_notifications) changes.push_notifications = formData.push_notifications;
    
    return changes;
  };

  const handleChange = (field: keyof UserProfileFormData, value: any) => {
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
      case 'first_name':
        error = validateRequired(formData.first_name, 'First name');
        break;
      case 'last_name':
        error = validateRequired(formData.last_name, 'Last name');
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
      case 'date_of_birth':
        error = validateDateOfBirth(formData.date_of_birth || '');
        break;
      case 'zip_code':
        error = validateZipCode(formData.zip_code || '');
        break;
      case 'emergency_contact_phone':
        error = validateEmergencyPhone(formData.emergency_contact_phone || '');
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
    const fields = ['first_name', 'last_name', 'phone', 'date_of_birth', 'zip_code', 'emergency_contact_phone'];
    fields.forEach(validateField);
    
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      setApiError('No changes to save.');
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setApiError('You must be logged in to update your profile.');
      return;
    }

    setIsSubmitting(true);

    try {
      const changedFields = getChangedFields();
      const updatedProfile = await updateProfile(changedFields, accessToken);
      
      setSuccessMessage('Profile updated successfully!');
      setOriginalData(updatedProfile);
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

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

      {/* Personal Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={(value) => handleChange('first_name', value)}
              onBlur={() => handleBlur('first_name')}
              error={touched.first_name ? errors.first_name : undefined}
              required
              disabled={isSubmitting}
            />

            <FormInput
              label="Last Name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={(value) => handleChange('last_name', value)}
              onBlur={() => handleBlur('last_name')}
              error={touched.last_name ? errors.last_name : undefined}
              required
              disabled={isSubmitting}
            />

            <FormInput
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              onBlur={() => handleBlur('phone')}
              error={touched.phone ? errors.phone : undefined}
              disabled={isSubmitting}
            />

            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(value) => handleChange('date_of_birth', value || null)}
              onBlur={() => handleBlur('date_of_birth')}
              error={touched.date_of_birth ? errors.date_of_birth : undefined}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <FormInput
            label="Address"
            name="address"
            type="text"
            value={formData.address || ''}
            onChange={(value) => handleChange('address', value || null)}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="City"
              name="city"
              type="text"
              value={formData.city || ''}
              onChange={(value) => handleChange('city', value || null)}
              disabled={isSubmitting}
            />

            <FormInput
              label="State"
              name="state"
              type="text"
              value={formData.state || ''}
              onChange={(value) => handleChange('state', value || null)}
              disabled={isSubmitting}
            />

            <FormInput
              label="Zip Code"
              name="zip_code"
              type="text"
              value={formData.zip_code || ''}
              onChange={(value) => handleChange('zip_code', value || null)}
              onBlur={() => handleBlur('zip_code')}
              error={touched.zip_code ? errors.zip_code : undefined}
              disabled={isSubmitting}
            />

            <FormInput
              label="Country"
              name="country"
              type="text"
              value={formData.country || ''}
              onChange={(value) => handleChange('country', value || null)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Name"
              name="emergency_contact_name"
              type="text"
              value={formData.emergency_contact_name || ''}
              onChange={(value) => handleChange('emergency_contact_name', value || null)}
              disabled={isSubmitting}
            />

            <FormInput
              label="Phone"
              name="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone || ''}
              onChange={(value) => handleChange('emergency_contact_phone', value || null)}
              onBlur={() => handleBlur('emergency_contact_phone')}
              error={touched.emergency_contact_phone ? errors.emergency_contact_phone : undefined}
              disabled={isSubmitting}
            />

            <FormInput
              label="Relationship"
              name="emergency_contact_relationship"
              type="text"
              value={formData.emergency_contact_relationship || ''}
              onChange={(value) => handleChange('emergency_contact_relationship', value || null)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Department"
              name="department"
              type="text"
              value={formData.department || ''}
              onChange={(value) => handleChange('department', value || null)}
              disabled={isSubmitting}
            />

            <FormInput
              label="Job Title"
              name="job_title"
              type="text"
              value={formData.job_title || ''}
              onChange={(value) => handleChange('job_title', value || null)}
              disabled={isSubmitting}
            />
          </div>

          <TagInput
            label="Skills"
            value={formData.skills}
            onChange={(tags) => handleChange('skills', tags)}
            placeholder="Add a skill"
            disabled={isSubmitting}
          />

          <TagInput
            label="Certifications"
            value={formData.certifications}
            onChange={(tags) => handleChange('certifications', tags)}
            placeholder="Add a certification"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Timezone"
              name="timezone"
              type="text"
              value={formData.timezone}
              onChange={(value) => handleChange('timezone', value)}
              disabled={isSubmitting}
            />

            <FormInput
              label="Language"
              name="language"
              type="text"
              value={formData.language}
              onChange={(value) => handleChange('language', value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Preferences</h4>
            <div className="space-y-2">
              <Toggle
                label="Email Notifications"
                checked={formData.email_notifications}
                onChange={(checked) => handleChange('email_notifications', checked)}
                disabled={isSubmitting}
                description="Receive notifications via email"
              />

              <Toggle
                label="SMS Notifications"
                checked={formData.sms_notifications}
                onChange={(checked) => handleChange('sms_notifications', checked)}
                disabled={isSubmitting}
                description="Receive notifications via SMS"
              />

              <Toggle
                label="Push Notifications"
                checked={formData.push_notifications}
                onChange={(checked) => handleChange('push_notifications', checked)}
                disabled={isSubmitting}
                description="Receive push notifications in the app"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
