'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Users, User, Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { assignTask, getTeams, getTechnicians } from '@/lib/tasks-api';

interface ManageAssignmentsModalProps {
    taskId: string;
    currentAssignments: any[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function ManageAssignmentsModal({
    taskId,
    currentAssignments,
    onClose,
    onSuccess,
}: ManageAssignmentsModalProps) {
    const [activeTab, setActiveTab] = useState<'technicians' | 'teams'>('technicians');
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Get current assignments
    const currentTechnicians = currentAssignments.filter(a => a.assignee);
    const currentTeamAssignments = currentAssignments.filter(a => a.team || a.team_name);

    useEffect(() => {
        loadData();
        // Pre-select current assignments
        const currentTechIds = currentTechnicians.filter(a => a.assignee).map(a => a.assignee.id);
        const currentTeamIds = currentTeamAssignments.map(a => a.team || a.id);
        setSelectedTechnicians(currentTechIds);
        setSelectedTeams(currentTeamIds);
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [techResponse, teamsResponse] = await Promise.all([
                getTechnicians(),
                getTeams(),
            ]);

            // Handle technicians response
            setTechnicians(techResponse.data || []);

            // Handle teams response
            const teamsData = teamsResponse.data || [];
            setTeams(teamsData);
        } catch (error: any) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load technicians and teams');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveTechnician = (techId: string) => {
        setSelectedTechnicians(prev => prev.filter(id => id !== techId));
    };

    const handleRemoveTeam = (teamId: string) => {
        setSelectedTeams(prev => prev.filter(id => id !== teamId));
    };

    const handleToggleTechnician = (techId: string) => {
        setSelectedTechnicians(prev =>
            prev.includes(techId)
                ? prev.filter(id => id !== techId)
                : [...prev, techId]
        );
    };

    const handleToggleTeam = (teamId: string) => {
        setSelectedTeams(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleSave = async () => {
        if (selectedTechnicians.length === 0 && selectedTeams.length === 0) {
            toast.error('Please select at least one technician or team');
            return;
        }

        try {
            setIsSaving(true);
            await assignTask(taskId, {
                assignee_ids: selectedTechnicians,
                team_ids: selectedTeams,
            });
            toast.success('Assignments updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update assignments:', error);
            toast.error(error.message || 'Failed to update assignments');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredTechnicians = useMemo(() =>
        technicians.filter((tech: any) =>
            !selectedTechnicians.includes(tech.id) && (
                tech.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tech.email?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        ),
        [technicians, selectedTechnicians, searchQuery]
    );

    const filteredTeams = useMemo(() =>
        teams.filter((team: any) =>
            !selectedTeams.includes(team.id) &&
            team.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [teams, selectedTeams, searchQuery]
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Manage Assignments</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Assign technicians or teams to this task
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 px-6 bg-gray-50">
                        <button
                            onClick={() => setActiveTab('technicians')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'technicians'
                                ? 'border-emerald-600 text-emerald-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Technicians ({selectedTechnicians.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('teams')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'teams'
                                ? 'border-emerald-600 text-emerald-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Teams ({selectedTeams.length})
                            </div>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activeTab === 'technicians' ? (
                                    <>
                                        {/* Current Technicians */}
                                        {selectedTechnicians.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                    Current Assignments ({selectedTechnicians.length})
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedTechnicians.map((techId) => {
                                                        const tech = technicians.find(t => t.id === techId) ||
                                                            currentTechnicians.find(a => a.assignee.id === techId)?.assignee;
                                                        if (!tech) return null;
                                                        return (
                                                            <div
                                                                key={techId}
                                                                className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                                        <User className="h-5 w-5 text-emerald-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">{tech.full_name}</p>
                                                                        <p className="text-xs text-gray-500">{tech.email}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveTechnician(techId)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Remove"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add New Technicians */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                Add Technicians
                                            </h3>
                                            <div className="mb-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search technicians..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {filteredTechnicians.length > 0 ? (
                                                    filteredTechnicians.map((tech) => (
                                                        <div
                                                            key={tech.id}
                                                            className="flex items-center justify-between p-4 hover:bg-white rounded-xl cursor-pointer transition-colors border border-gray-200 bg-white"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                                    <User className="h-5 w-5 text-gray-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{tech.full_name}</p>
                                                                    <p className="text-xs text-gray-500">{tech.email}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleTechnician(tech.id)}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            >
                                                                <Plus className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-gray-500 py-8 text-sm">
                                                        {searchQuery ? 'No technicians found' : 'All technicians are assigned'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Current Teams */}
                                        {selectedTeams.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                    Current Assignments ({selectedTeams.length})
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedTeams.map((teamId) => {
                                                        const team = teams.find(t => t.id === teamId);
                                                        const teamName = team?.name || currentTeamAssignments.find(a => a.team === teamId)?.team_name;
                                                        if (!teamName && !team) return null;
                                                        return (
                                                            <div
                                                                key={teamId}
                                                                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                        <Users className="h-5 w-5 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">{team?.name || teamName}</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {team?.member_count || 0} members
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveTeam(teamId)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Remove"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add New Teams */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                Add Teams
                                            </h3>
                                            <div className="mb-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search teams..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {filteredTeams.length > 0 ? (
                                                    filteredTeams.map((team) => (
                                                        <div
                                                            key={team.id}
                                                            className="flex items-center justify-between p-4 hover:bg-white rounded-xl cursor-pointer transition-colors border border-gray-200 bg-white"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                                    <Users className="h-5 w-5 text-gray-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{team.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {team.member_count || 0} members
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleTeam(team.id)}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            >
                                                                <Plus className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-gray-500 py-8 text-sm">
                                                        {searchQuery ? 'No teams found' : 'All teams are assigned'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                        <div className="text-sm text-gray-600 font-medium">
                            {selectedTechnicians.length + selectedTeams.length} selected
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || (selectedTechnicians.length === 0 && selectedTeams.length === 0)}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {isSaving ? 'Saving...' : 'Save Assignments'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
