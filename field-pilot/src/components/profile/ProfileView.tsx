'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { getProfile } from '@/lib/auth-api';
import { getAccessToken } from '@/lib/token-utils';
import { UserProfile } from '@/types/auth';
import { ApiError } from '@/types/auth';
import { getErrorMessage } from '@/lib/validation';

interface ProfileViewProps {
  onEdit?: () => void;
}

export default function ProfileView({ onEdit }: ProfileViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('You must be logged in to view your profile.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await getProfile(accessToken);
      setProfile(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(getErrorMessage(apiErr));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  if (error) {
    return (
      <div className="py-12">
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
        <div className="mt-4 text-center">
          <Button onClick={fetchProfile} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      router.push('/profile/edit');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <Button onClick={handleEdit} variant="primary">
          Edit Profile
        </Button>
      </div>

      {/* Personal Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-base text-gray-900">{profile.user.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-base text-gray-900">{profile.user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="mt-1 text-base text-gray-900">{profile.user.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="mt-1 text-base text-gray-900">{profile.date_of_birth || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Address</label>
              <p className="mt-1 text-base text-gray-900">{profile.address || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">City</label>
              <p className="mt-1 text-base text-gray-900">{profile.city || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">State</label>
              <p className="mt-1 text-base text-gray-900">{profile.state || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Zip Code</label>
              <p className="mt-1 text-base text-gray-900">{profile.zip_code || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Country</label>
              <p className="mt-1 text-base text-gray-900">{profile.country || 'Not provided'}</p>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-base text-gray-900">{profile.emergency_contact_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="mt-1 text-base text-gray-900">{profile.emergency_contact_phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Relationship</label>
              <p className="mt-1 text-base text-gray-900">{profile.emergency_contact_relationship || 'Not provided'}</p>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-500">Employee ID</label>
              <p className="mt-1 text-base text-gray-900">{profile.user.employee_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1 text-base text-gray-900 capitalize">{profile.user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Department</label>
              <p className="mt-1 text-base text-gray-900">{profile.user.department || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Job Title</label>
              <p className="mt-1 text-base text-gray-900">{profile.user.job_title || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Hire Date</label>
              <p className="mt-1 text-base text-gray-900">{profile.hire_date || 'Not provided'}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Skills</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-md"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-base text-gray-900">No skills added</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Certifications</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.certifications.length > 0 ? (
                profile.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {cert}
                  </span>
                ))
              ) : (
                <p className="text-base text-gray-900">No certifications added</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Timezone</label>
              <p className="mt-1 text-base text-gray-900">{profile.timezone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Language</label>
              <p className="mt-1 text-base text-gray-900">{profile.language}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Notifications</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${profile.email_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {profile.email_notifications ? '✓ Email Enabled' : '✗ Email Disabled'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${profile.sms_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {profile.sms_notifications ? '✓ SMS Enabled' : '✗ SMS Disabled'}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${profile.push_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {profile.push_notifications ? '✓ Push Enabled' : '✗ Push Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
