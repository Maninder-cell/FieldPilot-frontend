'use client';

import { useState, useEffect } from 'react';
import { X, Users, FileText } from 'lucide-react';
import { Team, CreateTeamData } from '@/types/teams';
import { createTeam, updateTeam } from '@/lib/teams-api';
import { toast } from 'react-hot-toast';

interface TeamModalProps {
    team: Team | null;
    onClose: () => void;
}

export default function TeamModal({ team, onClose }: TeamModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateTeamData>({
        name: '',
        description: '',
        is_active: true,
    });

    useEffect(() => {
        if (team) {
            setFormData({
                name: team.name,
                description: team.description || '',
                is_active: team.is_active,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                is_active: true,
            });
        }
    }, [team]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            if (team) {
                await updateTeam(team.id, {
                    name: formData.name,
                    description: formData.description,
                    is_active: formData.is_active,
                });
                toast.success('Team updated successfully');
            } else {
                await createTeam(formData);
                toast.success('Team created successfully');
            }
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save team');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                    onClick={onClose} 
                />

                <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {team ? 'Edit Team' : 'Create New Team'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-8">
                            {/* Basic Information Section */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <Users className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Team Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter team name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Provide a description of the team's purpose and responsibilities..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-900 cursor-pointer">
                                        Active Team
                                    </label>
                                </div>
                            </div>

                            {/* Additional Info Section */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Team members can be managed from the teams list page after {team ? 'updating' : 'creating'} the team.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-between items-center shadow-lg">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                {team ? 'Update Team' : 'Create Team'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
