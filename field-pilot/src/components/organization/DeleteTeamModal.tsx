'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Team } from '@/types/teams';
import { deleteTeam } from '@/lib/teams-api';
import { toast } from 'react-hot-toast';

interface DeleteTeamModalProps {
    team: Team;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteTeamModal({ team, onClose, onSuccess }: DeleteTeamModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await deleteTeam(team.id);
            toast.success('Team deleted successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Delete Team</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="px-6 py-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete the team <strong className="text-gray-900">{team.name}</strong>?
                        </p>

                        {team.member_count > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-amber-800">
                                    <strong>Warning:</strong> This team has {team.member_count} member{team.member_count !== 1 ? 's' : ''}.
                                    Deleting this team will remove all member associations.
                                </p>
                            </div>
                        )}

                        <p className="text-sm text-gray-500">
                            This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            Delete Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
