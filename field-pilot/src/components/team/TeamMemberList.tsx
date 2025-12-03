'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { TenantMember } from '@/types/onboarding';
import Button from '@/components/ui/Button';
import RoleBadge from '../onboarding/RoleBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TeamMemberListSkeleton } from './TeamMemberListSkeleton';
import { UserPlus, Mail, Briefcase, Calendar, User as UserIcon, MoreVertical, Shield, Trash2, Eye, XCircle } from 'lucide-react';

interface TeamMemberListProps {
  onInvite?: () => void;
  onMemberUpdate?: () => void;
}

export default function TeamMemberList({ onInvite, onMemberUpdate }: TeamMemberListProps) {
  const { user } = useAuth();
  const { members, loadMembers, updateMemberRole, removeMember, isLoading } = useOnboarding();
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [viewingMember, setViewingMember] = useState<TenantMember | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Find current user's member record to get their tenant-specific role
  const currentUserMember = members.find(m => m.user.id === user?.id);
  const userTenantRole = currentUserMember?.role;
  
  // Check if user has permission to manage team (owner, admin, or manager)
  const canManageTeam = userTenantRole === 'owner' || userTenantRole === 'admin' || userTenantRole === 'manager';
  const isOwner = userTenantRole === 'owner';

  useEffect(() => {
    if (!hasLoaded) {
      handleLoadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRole) return;

    setActionLoading(true);
    try {
      await updateMemberRole(selectedMember.id, newRole);
      setShowRoleModal(false);
      setSelectedMember(null);
      setNewRole('');
      // Data is automatically refreshed by the context
      if (onMemberUpdate) onMemberUpdate();
    } catch (error: any) {
      console.error('Error updating role:', error);
      alert(error.message || 'Failed to update member role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setActionLoading(true);
    try {
      await removeMember(selectedMember.id);
      setShowRemoveModal(false);
      setSelectedMember(null);
      // Data is automatically refreshed by the context
      if (onMemberUpdate) onMemberUpdate();
    } catch (error: any) {
      console.error('Error removing member:', error);
      alert(error.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (member: TenantMember) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setShowRoleModal(true);
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const openRemoveModal = (member: TenantMember) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const openProfileModal = (member: TenantMember) => {
    setViewingMember(member);
    setShowProfileModal(true);
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  if (isLoadingMembers && !hasLoaded) {
    return <TeamMemberListSkeleton />;
  }

  if (members.length === 0 && hasLoaded) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
        <p className="text-gray-600 mb-6">
          Start building your team by inviting members
        </p>
        {canManageTeam && onInvite && (
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
        {canManageTeam && onInvite && (
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
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-x-auto">
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => {
              const isCurrentUser = member.user.id === user?.id;
              const canModify = canManageTeam && !isCurrentUser && member.role !== 'owner';
              
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
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
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {member.user.full_name}
                          {isCurrentUser && (
                            <span className="text-xs text-teal-600 font-medium">(You)</span>
                          )}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuPosition({
                                top: rect.bottom + window.scrollY + 8,
                                right: window.innerWidth - rect.right - window.scrollX
                              });
                              setOpenMenuId(openMenuId === member.id ? null : member.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {openMenuId === member.id && menuPosition && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setMenuPosition(null);
                                }}
                              />
                              <div 
                                className="fixed z-50 w-56 rounded-lg shadow-xl bg-white ring-1 ring-gray-200 overflow-hidden"
                                style={{
                                  top: `${menuPosition.top}px`,
                                  right: `${menuPosition.right}px`
                                }}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => openProfileModal(member)}
                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  >
                                    <Eye className="w-4 h-4 mr-3" />
                                    View Profile
                                  </button>
                                  {canModify && (
                                    <>
                                      <div className="border-t border-gray-100"></div>
                                      <button
                                        onClick={() => openRoleModal(member)}
                                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                                      >
                                        <Shield className="w-4 h-4 mr-3" />
                                        Change Role
                                      </button>
                                      <div className="border-t border-gray-100"></div>
                                      <button
                                        onClick={() => openRemoveModal(member)}
                                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4 mr-3" />
                                        Remove Member
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {members.map((member) => {
          const isCurrentUser = member.user.id === user?.id;
          const canModify = canManageTeam && !isCurrentUser && member.role !== 'owner';
          
          return (
            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center flex-1">
                  <div className="shrink-0">
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
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {member.user.full_name}
                      {isCurrentUser && (
                        <span className="text-xs text-teal-600 font-medium">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={member.role} size="sm" />
                  <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({
                            top: rect.bottom + window.scrollY + 8,
                            right: window.innerWidth - rect.right - window.scrollX
                          });
                          setOpenMenuId(openMenuId === member.id ? null : member.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {openMenuId === member.id && menuPosition && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => {
                              setOpenMenuId(null);
                              setMenuPosition(null);
                            }}
                          />
                          <div 
                            className="fixed z-50 w-48 rounded-lg shadow-xl bg-white ring-1 ring-gray-200 overflow-hidden"
                            style={{
                              top: `${menuPosition.top}px`,
                              right: `${menuPosition.right}px`
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => openProfileModal(member)}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </button>
                              {canModify && (
                                <>
                                  <div className="border-t border-gray-100"></div>
                                  <button
                                    onClick={() => openRoleModal(member)}
                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Change Role
                                  </button>
                                  <div className="border-t border-gray-100"></div>
                                  <button
                                    onClick={() => openRemoveModal(member)}
                                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Member
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                </div>
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
          );
        })}
      </div>

      {/* Change Role Modal - Custom Implementation */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-100 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => {
              setShowRoleModal(false);
              setSelectedMember(null);
              setNewRole('');
            }}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-101">
              {/* Header with gradient */}
              <div className="bg-linear-to-r from-teal-500 to-blue-500 px-6 py-4">
                <div className="flex items-center">
                  <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white bg-opacity-20">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-white">Change Member Role</h3>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-5">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Update the role for <strong className="text-gray-900">{selectedMember.user.full_name}</strong>
                  </p>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Select New Role
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 bg-white"
                      >
                        <option value="employee">Employee - Standard team member</option>
                        <option value="manager">Manager - Can manage team members</option>
                        <option value="admin">Admin - Full administrative access</option>
                        {isOwner && <option value="owner">Owner - Complete control</option>}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-linear-to-r from-teal-600 to-teal-700 text-base font-medium text-white hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Role'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedMember(null);
                    setNewRole('');
                  }}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && viewingMember && (
        <div className="fixed inset-0 z-100 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowProfileModal(false);
              setViewingMember(null);
            }}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full z-101">
              {/* Header */}
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {viewingMember.user.avatar_url ? (
                      <img
                        className="h-20 w-20 rounded-full border-4 border-emerald-100 object-cover shadow-lg"
                        src={viewingMember.user.avatar_url}
                        alt={viewingMember.user.full_name}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-200 shadow-lg">
                        <span className="text-emerald-600 font-bold text-2xl">
                          {viewingMember.user.first_name[0]}{viewingMember.user.last_name[0]}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">{viewingMember.user.full_name}</h3>
                      <p className="text-emerald-700 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {viewingMember.user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      setViewingMember(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-5 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-emerald-600" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                        <p className="mt-1 text-base text-gray-900 font-medium">{viewingMember.user.full_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-base text-gray-900">{viewingMember.user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-base text-gray-900">{viewingMember.user.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                        <p className="mt-1 text-base text-gray-900 font-mono">{viewingMember.user.employee_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-emerald-600" />
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Tenant Role</label>
                        <p className="mt-1">
                          <RoleBadge role={viewingMember.role} size="md" />
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">System Role</label>
                        <p className="mt-1 text-base text-gray-900 capitalize">{viewingMember.user.role}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Department</label>
                        <p className="mt-1 text-base text-gray-900">{viewingMember.user.department || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Job Title</label>
                        <p className="mt-1 text-base text-gray-900">{viewingMember.user.job_title || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Joined Company</label>
                        <p className="mt-1 text-base text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(viewingMember.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Account Created</label>
                        <p className="mt-1 text-base text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(viewingMember.user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                      Account Status
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          viewingMember.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {viewingMember.is_active ? '✓ Active Member' : '✗ Inactive Member'}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          viewingMember.user.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {viewingMember.user.is_verified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                        </span>
                        {viewingMember.user.two_factor_enabled && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            🔒 2FA Enabled
                          </span>
                        )}
                      </div>
                      {viewingMember.user.last_login_at && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-500">Last Login</label>
                          <p className="mt-1 text-base text-gray-900">
                            {new Date(viewingMember.user.last_login_at).toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setViewingMember(null);
                  }}
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && selectedMember && (
        <ConfirmModal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handleRemoveMember}
          title="Remove Team Member"
          message={`Are you sure you want to remove ${selectedMember.user.full_name} from the team? They will lose access to the system.`}
          confirmText="Remove Member"
          cancelText="Cancel"
          variant="danger"
          isProcessing={actionLoading}
        />
      )}
    </div>
  );
}
