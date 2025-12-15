'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import TeamModal from '@/components/organization/TeamModal';
import DeleteTeamModal from '@/components/organization/DeleteTeamModal';
import { Users, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import { getTeams } from '@/lib/teams-api';
import { Team } from '@/types/teams';
import { toast } from 'react-hot-toast';

export default function TeamsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal states
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadTeams();
        }
    }, [user, searchQuery, statusFilter, currentPage]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const filters: any = {
                page: currentPage,
                page_size: 10,
            };

            if (searchQuery) {
                filters.search = searchQuery;
            }

            if (statusFilter !== 'all') {
                filters.is_active = statusFilter === 'active';
            }

            const response = await getTeams(filters);

            // Handle the actual backend response structure:
            // { count, next, previous, results: { success, data: [], message } }
            if (response.results && (response.results as any).data) {
                const teamsData = (response.results as any).data;
                setTeams(Array.isArray(teamsData) ? teamsData : []);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / 10));
            } else if (response.results && Array.isArray(response.results)) {
                // Fallback: results is directly an array
                setTeams(response.results);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / 10));
            } else if ((response as any).data) {
                // Alternative: data at root level
                const data = Array.isArray((response as any).data) ? (response as any).data : [(response as any).data];
                setTeams(data);
                setTotalCount(data.length);
                setTotalPages(1);
            } else if (Array.isArray(response)) {
                // Direct array response
                setTeams(response as any);
                setTotalCount((response as any).length);
                setTotalPages(1);
            } else {
                console.error('Unexpected response structure:', response);
                setTeams([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (error: any) {
            console.error('Error loading teams:', error);
            toast.error(error.message || 'Failed to load teams');
            setTeams([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = () => {
        setSelectedTeam(null);
        setIsTeamModalOpen(true);
    };

    const handleEditTeam = (team: Team) => {
        setSelectedTeam(team);
        setIsTeamModalOpen(true);
    };

    const handleDeleteTeam = (team: Team) => {
        setSelectedTeam(team);
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setIsTeamModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedTeam(null);
        loadTeams();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage technician teams and their members
                        </p>
                    </div>
                    <button
                        onClick={handleCreateTeam}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <UserPlus className="h-5 w-5" />
                        Add Team
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleStatusFilterChange('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'all'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('active')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'active'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('inactive')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'inactive'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                {/* Teams List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating a new team'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Members
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
                                        {teams.map((team) => (
                                            <tr key={team.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{team.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {team.description || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${team.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {team.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditTeam(team)}
                                                            className="text-emerald-600 hover:text-emerald-900 p-1 hover:bg-emerald-50 rounded transition-colors"
                                                            title="Edit team"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTeam(team)}
                                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete team"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {teams.map((team) => (
                                    <div key={team.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">{team.name}</h3>
                                                    {team.description && (
                                                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{team.description}</p>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${team.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                        >
                                                            {team.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                                <button
                                                    onClick={() => handleEditTeam(team)}
                                                    className="text-emerald-600 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTeam(team)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * 10, totalCount)}
                                        </span>{' '}
                                        of <span className="font-medium">{totalCount}</span> teams
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isTeamModalOpen && (
                <TeamModal team={selectedTeam} onClose={handleModalClose} />
            )}
            {isDeleteModalOpen && selectedTeam && (
                <DeleteTeamModal
                    team={selectedTeam}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onSuccess={handleModalClose}
                />
            )}
        </OrganizationLayout>
    );
}
