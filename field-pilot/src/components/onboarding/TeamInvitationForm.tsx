'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import RoleBadge from './RoleBadge';
import { UserPlus, X, Mail } from 'lucide-react';
import { ROLE_OPTIONS, MemberRole, InviteMemberRequest } from '@/types/onboarding';
import { validateEmail, validateRequired } from '@/lib/validation';
import { OnboardingApiError } from '@/types/onboarding';

interface PendingInvite extends InviteMemberRequest {
  id: string;
}

interface TeamInvitationFormProps {
  onSuccess?: () => void;
}

export default function TeamInvitationForm({ onSuccess }: TeamInvitationFormProps) {
  const { inviteTeamMember, completeStep, isLoading: contextLoading } = useOnboarding();
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'employee' as MemberRole,
    first_name: '',
    last_name: '',
  });
  
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
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
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.email = validateRequired(formData.email, 'Email') || validateEmail(formData.email) || '';
    newErrors.role = validateRequired(formData.role, 'Role') || '';

    setErrors(newErrors);
    setTouched({
      email: true,
      role: true,
    });

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleAddInvite = () => {
    if (!validateForm()) {
      return;
    }

    // Check for duplicate email
    if (pendingInvites.some(invite => invite.email === formData.email)) {
      setApiError('This email has already been added to the invitation list');
      return;
    }

    // Add to pending invites
    const newInvite: PendingInvite = {
      ...formData,
      id: Date.now().toString(),
    };

    setPendingInvites(prev => [...prev, newInvite]);
    
    // Reset form
    setFormData({
      email: '',
      role: 'employee',
      first_name: '',
      last_name: '',
    });
    setErrors({});
    setTouched({});
    setSuccessMessage('Invitation added! Add more or click "Send Invitations" to proceed.');
  };

  const handleRemoveInvite = (id: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== id));
  };

  const handleSendInvitations = async () => {
    if (pendingInvites.length === 0) {
      setApiError('Please add at least one team member to invite');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // Send all invitations
      for (const invite of pendingInvites) {
        const { id, ...inviteData } = invite;
        await inviteTeamMember(inviteData);
      }

      // Complete step 4
      await completeStep(4, { invited_count: pendingInvites.length });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;
      setApiError(apiError.message || 'Failed to send invitations. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await completeStep(4, { skipped: true });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const apiError = error as OnboardingApiError;
      setApiError(apiError.message || 'Failed to skip step. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
      )}
      
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Invite Your Team</h2>
        <p className="text-gray-600">
          Invite team members to collaborate. You can always add more members later from your team settings.
        </p>
      </div>

      {/* Invitation Form */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Add Team Member
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            {touched.role && errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name (Optional)"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={(value) => handleChange('first_name', value)}
            placeholder="John"
          />

          <FormInput
            label="Last Name (Optional)"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={(value) => handleChange('last_name', value)}
            placeholder="Doe"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleAddInvite}
          disabled={isSubmitting || contextLoading}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add to List
        </Button>
      </div>

      {/* Pending Invitations List */}
      {pendingInvites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Invitations ({pendingInvites.length})
          </h3>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-100 rounded-full p-2">
                    <Mail className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {invite.first_name || invite.last_name
                        ? `${invite.first_name} ${invite.last_name}`.trim()
                        : invite.email}
                    </p>
                    <p className="text-sm text-gray-600">{invite.email}</p>
                  </div>
                  <RoleBadge role={invite.role} size="sm" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInvite(invite.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  disabled={isSubmitting || contextLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleSkip}
          loading={isSubmitting && pendingInvites.length === 0}
          disabled={isSubmitting || contextLoading}
        >
          Skip for Now
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSendInvitations}
          loading={isSubmitting && pendingInvites.length > 0}
          disabled={pendingInvites.length === 0 || isSubmitting || contextLoading}
        >
          Send Invitations & Continue
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        You can invite more team members later from your team management page
      </p>
    </div>
  );
}
