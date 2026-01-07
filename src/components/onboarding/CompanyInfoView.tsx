'use client';

import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import TrialStatusBadge from './TrialStatusBadge';
import CompanyInfoSkeleton from './CompanyInfoSkeleton';
import { Building, Mail, Phone, Globe, MapPin, Users, Edit, ExternalLink } from 'lucide-react';

interface CompanyInfoViewProps {
  onEdit?: () => void;
}

export default function CompanyInfoView({ onEdit }: CompanyInfoViewProps) {
  const { tenant, isLoading, members } = useOnboarding();
  const { user } = useAuth();

  // Check if user has permission to edit (owner or admin) from tenant membership
  const currentUserMembership = members.find(m => m.user.id === user?.id);
  const canEdit = currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'admin';

  if (isLoading) {
    return <CompanyInfoSkeleton />;
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No company information found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
          <p className="text-gray-600 mt-1">View and manage your company information</p>
        </div>
        {canEdit && onEdit && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Company
          </Button>
        )}
      </div>

      {/* Trial Status */}
      {tenant.is_trial_active && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
          <TrialStatusBadge
            trialEndsAt={tenant.trial_ends_at}
            isTrialActive={tenant.is_trial_active}
            size="md"
          />
        </div>
      )}

      {/* Company Details */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
        {/* Basic Information */}
        <div className="p-6 space-y-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2 text-emerald-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{tenant.company_email}</p>
              </div>
            </div>

            {tenant.company_phone && (
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{tenant.company_phone}</p>
                </div>
              </div>
            )}

            {tenant.website && (
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <a
                    href={tenant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-teal-600 hover:text-teal-700 flex items-center"
                  >
                    {tenant.website}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            )}

            {tenant.company_size && (
              <div className="flex items-start">
                <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Company Size</p>
                  <p className="font-medium text-gray-900">{tenant.company_size} employees</p>
                </div>
              </div>
            )}

            {tenant.industry && (
              <div className="flex items-start">
                <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Industry</p>
                  <p className="font-medium text-gray-900">{tenant.industry}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        {(tenant.address || tenant.city || tenant.state || tenant.zip_code || tenant.country) && (
          <div className="p-6 space-y-4 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Address
            </h3>
            
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                {tenant.address && <p className="text-gray-900">{tenant.address}</p>}
                <p className="text-gray-900">
                  {[tenant.city, tenant.state, tenant.zip_code].filter(Boolean).join(', ')}
                </p>
                {tenant.country && <p className="text-gray-900">{tenant.country}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Workspace Information */}
        <div className="p-6 space-y-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-emerald-600" />
            Workspace
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Subdomain</p>
              <p className="font-mono text-sm font-medium text-gray-900">{tenant.slug}</p>
            </div>

            {tenant.domain && (
              <div>
                <p className="text-sm text-gray-600">Domain</p>
                <p className="font-mono text-sm font-medium text-gray-900">{tenant.domain}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="font-medium text-gray-900">{tenant.member_count} members</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {tenant.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {tenant.access_url && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Workspace URL</p>
              <a
                href={tenant.access_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-teal-600 hover:text-teal-700 break-all flex items-center"
              >
                {tenant.access_url}
                <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="p-6 space-y-3 bg-white">
          <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Created</span>
            <span className="text-gray-900">{new Date(tenant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-2">
            <span className="text-gray-600 font-medium">Last Updated</span>
            <span className="text-gray-900">{new Date(tenant.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
