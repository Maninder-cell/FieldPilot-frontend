'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import Button from '@/components/ui/Button';
import RoleBadge from './RoleBadge';
import { UserPlus, Mail, Briefcase, Calendar, User as UserIcon } from 'lucide-react';

interface MemberListProps {
  onInvite?: () => void;
}

export default function MemberList({ onInvite }: MemberListProps) {
  const { user } = useAuth();
  const { members, loadMembers, isLoading } = useOnboarding();
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Check if user has permission to invite (owner or admin) from tenant membership
  const currentUserMembership = members.find(m => m.user.id === user?.id);
  const canInvite = currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'admin';

  useEffect(() => {
    // Only load if we haven't loaded yet and members array is empty
    if (!hasLoaded && members.length === 0) {
      handleLoadMembers();
    } else if (members.length > 0 && !hasLoaded) {
      setHasLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length, hasLoaded]);

  const handleLoadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      await loadMembers();
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Only show loading spinner if we're actually loading and haven't loaded before
  if (isLoadingMembers && !hasLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
        <p className="text-gray-600 mb-6">
          Start building your team by inviting members
        </p>
        {canInvite && onInvite && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onInvite}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Team Member
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-gray-600 mt-1">{members.length} members in your team</p>
        </div>
        {canInvite && onInvite && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onInvite}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {member.user.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.user.avatar_url}
                          alt={member.user.full_name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-medium text-sm">
                            {member.user.first_name[0]}{member.user.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.user.full_name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={member.role} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {member.user.department || '-'}
                  </div>
                  {member.user.job_title && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {member.user.job_title}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {member.user.avatar_url ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={member.user.avatar_url}
                      alt={member.user.full_name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-teal-600 font-medium">
                        {member.user.first_name[0]}{member.user.last_name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {member.user.full_name}
                  </div>
                  <div className="text-sm text-gray-500">{member.user.email}</div>
                </div>
              </div>
              <RoleBadge role={member.role} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Department</p>
                <p className="text-gray-900">{member.user.department || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Joined</p>
                <p className="text-gray-900">{new Date(member.joined_at).toLocaleDateString()}</p>
              </div>
            </div>

            {member.user.job_title && (
              <div className="text-sm">
                <p className="text-gray-500">Job Title</p>
                <p className="text-gray-900">{member.user.job_title}</p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {member.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
