'use client';

import { useState, useEffect } from 'react';
import { X, Users, UserPlus, UserMinus, Search, Loader2 } from 'lucide-react';
import { Team, TeamMember } from '@/types/teams';
import { getTeam, addTeamMembers, removeTeamMember, getTechnicians } from '@/lib/teams-api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';

interface TeamMembersModalProps {
    team: Team;
    onClose: () => void;
}

export default function TeamMembersModal({ team: initialTeam, onClose }: TeamMembersModalProps) {
    // Initialize team with empty members array if not present
    const [team, setTeam] = useState<Team>({
        ...initialTeam,
        members: initialTeam.members || []
    });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [availableTechnicians, setAvailableTechnicians] = useState<TeamMember[]>([]);
    const [loadingTechnicians, setLoadingTechnicians] = useState(false);
    const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
    const [loadingTeamDetails, setLoadingTeamDetails] = useState(true);

    // Confirm modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

    // Load team details to get current members
    useEffect(() => {
        loadTeamDetails();
    }, []);

    // Load available technicians
    useEffect(() => {
        loadTechnicians();
    }, [searchQuery]);

    const loadTeamDetails = async () => {
        try {
            setLoadingTeamDetails(true);
            const response = await getTeam(team.id);
            setTeam({
                ...response.data,
                members: response.data.members || []
            });
        } catch (error: any) {
            console.error('Failed to load team details:', error);
            toast.error('Failed to load team details');
        } finally {
            setLoadingTeamDetails(false);
        }
    };

    const loadTechnicians = async () => {
        try {
            setLoadingTechnicians(true);
            const response = await getTechnicians({
                search: searchQuery || undefined,
                page_size: 50,
                team_id: team.id,  // Pass team ID to exclude existing members on backend
            });

            console.log('Technicians API Response:', response);
            console.log('Current Team Members:', team.members);

            // Handle the paginated response structure from backend
            // Response structure: { count, next, previous, results: { success, data: [...], message } }
            let techniciansData: TeamMember[] = [];

            if (response.results && (response.results as any).data) {
                // Paginated response with nested data
                techniciansData = (response.results as any).data;
            } else if (response.data) {
                // Direct data response
                techniciansData = Array.isArray(response.data) ? response.data : [response.data];
            } else if (Array.isArray(response)) {
                // Direct array response
                techniciansData = response;
            }

            console.log('All Technicians (already filtered by backend):', techniciansData);

            // Backend already filters out existing team members when team_id is provided
            // So we can use the data directly without additional client-side filtering
            setAvailableTechnicians(techniciansData);
        } catch (error: any) {
            console.error('Failed to load technicians:', error);

            // Try again without team_id filter as fallback
            if (team.id) {
                try {
                    console.log('Retrying without team_id filter...');
                    const fallbackResponse = await getTechnicians({
                        search: searchQuery || undefined,
                        page_size: 50,
                        // Don't pass team_id
                    });

                    let techniciansData: TeamMember[] = [];
                    if (fallbackResponse.results && (fallbackResponse.results as any).data) {
                        techniciansData = (fallbackResponse.results as any).data;
                    } else if (fallbackResponse.data) {
                        techniciansData = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [fallbackResponse.data];
                    } else if (Array.isArray(fallbackResponse)) {
                        techniciansData = fallbackResponse;
                    }

                    // Do client-side filtering as fallback
                    const currentMembers = team.members || [];
                    const memberIds = currentMembers.map(m => m.id);
                    const memberEmails = currentMembers.map(m => m.email.toLowerCase());

                    const available = techniciansData.filter((tech: TeamMember) => {
                        const isAlreadyMember = memberIds.includes(tech.id) ||
                            memberEmails.includes(tech.email.toLowerCase());
                        return !isAlreadyMember;
                    });

                    setAvailableTechnicians(available);
                    console.log('Fallback successful, using client-side filtering');
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    toast.error('Failed to load technicians');
                    setAvailableTechnicians([]);
                }
            } else {
                toast.error('Failed to load technicians');
                setAvailableTechnicians([]);
            }
        } finally {
            setLoadingTechnicians(false);
        }
    };

    const handleAddMembers = async () => {
        if (selectedTechnicians.length === 0) {
            toast.error('Please select at least one technician');
            return;
        }

        try {
            setLoading(true);
            await addTeamMembers(team.id, { member_ids: selectedTechnicians });
            toast.success(`Added ${selectedTechnicians.length} member(s) to team`);
            setSelectedTechnicians([]);

            // Wait a moment for backend to process
            await new Promise(resolve => setTimeout(resolve, 300));

            // Reload team details first to get updated members list
            await loadTeamDetails();

            // Then reload technicians (which will exclude the newly added members)
            await loadTechnicians();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add members');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = (memberId: string, memberName: string) => {
        setMemberToRemove({ id: memberId, name: memberName });
        setShowConfirmModal(true);
    };

    const confirmRemoveMember = async () => {
        if (!memberToRemove) return;

        try {
            setLoading(true);
            setShowConfirmModal(false);
            await removeTeamMember(team.id, memberToRemove.id);
            toast.success(`Removed ${memberToRemove.name} from team`);

            // Wait a moment for backend to process
            await new Promise(resolve => setTimeout(resolve, 300));

            // Reload team details first to get updated members list
            await loadTeamDetails();

            // Then reload technicians (newly removed member will appear in available list)
            await loadTechnicians();
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove member');
        } finally {
            setLoading(false);
            setMemberToRemove(null);
        }
    };

    const cancelRemoveMember = () => {
        setShowConfirmModal(false);
        setMemberToRemove(null);
    };

    const toggleTechnicianSelection = (techId: string) => {
        setSelectedTechnicians(prev =>
            prev.includes(techId)
                ? prev.filter(id => id !== techId)
                : [...prev, techId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Manage Team Members</h2>
                                <p className="text-sm text-emerald-100 mt-1">{team.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loadingTeamDetails ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
                                <p className="text-sm text-gray-600">Loading team details...</p>
                            </div>
                        ) : (
                            <>
                                {/* Current Members Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Current Members ({(team.members || []).length})
                                        </h3>
                                    </div>

                                    {(team.members || []).length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600">No members in this team yet</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {(team.members || []).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-emerald-700">
                                                                {member.full_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {member.full_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id, member.full_name)}
                                                        disabled={loading}
                                                        className="shrink-0 ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Remove member"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Add Members Section */}
                                <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">Add Members</h3>
                                        {selectedTechnicians.length > 0 && (
                                            <button
                                                onClick={handleAddMembers}
                                                disabled={loading}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <UserPlus className="h-4 w-4" />
                                                )}
                                                Add {selectedTechnicians.length} Selected
                                            </button>
                                        )}
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search technicians..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    {/* Available Technicians */}
                                    {loadingTechnicians ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />
                                            <p className="text-sm text-gray-600 mt-2">Loading technicians...</p>
                                        </div>
                                    ) : availableTechnicians.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600">
                                                {searchQuery ? 'No technicians found' : 'All technicians are already members'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                            {availableTechnicians.map((tech) => (
                                                <div
                                                    key={tech.id}
                                                    onClick={() => toggleTechnicianSelection(tech.id)}
                                                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTechnicians.includes(tech.id)
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : 'border-gray-200 hover:border-emerald-300 bg-white'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTechnicians.includes(tech.id)}
                                                        onChange={() => { }}
                                                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <div className="shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-blue-700">
                                                            {tech.full_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {tech.full_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{tech.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-end shadow-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Remove Member Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Remove Team Member"
                message={`Are you sure you want to remove ${memberToRemove?.name} from this team?`}
                confirmText="Remove"
                cancelText="Cancel"
                onConfirm={confirmRemoveMember}
                onCancel={cancelRemoveMember}
                type="danger"
            />
        </div>
    );
}
