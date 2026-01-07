'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import TeamModal from '@/components/organization/TeamModal';
import DeleteTeamModal from '@/components/organization/DeleteTeamModal';
import TeamMembersModal from '@/components/organization/TeamMembersModal';
import { Users, Search, Edit, Trash2, UserPlus, Filter, X, CheckCircle2, XCircle, UserCog } from 'lucide-react';
import { getTeams } from '@/lib/teams-api';
import { Team } from '@/types/teams';
import { toast } from 'react-hot-toast';

export default function TeamsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Modal states
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
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
    }, [user, currentPage]);

    useEffect(() => {
        if (!user) return;

        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            loadTeams();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const filters: any = {
                page: currentPage,
                page_size: pageSize,
            };

            if (searchQuery) {
                filters.search = searchQuery;
            }

            if (statusFilter) {
                filters.is_active = statusFilter === 'active';
            }

            const response = await getTeams(filters);

            // Handle the actual backend response structure:
            // { count, next, previous, results: { success, data: [], message } }
            if (response.results && (response.results as any).data) {
                const teamsData = (response.results as any).data;
                setTeams(Array.isArray(teamsData) ? teamsData : []);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / pageSize));
            } else if (response.results && Array.isArray(response.results)) {
                // Fallback: results is directly an array
                setTeams(response.results);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / pageSize));
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

    const handleManageMembers = (team: Team) => {
        setSelectedTeam(team);
        setIsMembersModalOpen(true);
    };

    const handleModalClose = () => {
        setIsTeamModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsMembersModalOpen(false);
        setSelectedTeam(null);
        loadTeams();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || statusFilter;

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
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Teams</h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">
                                Manage technician teams and their members
                            </p>
                        </div>
                        <button
                            onClick={handleCreateTeam}
                            className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Add Team
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="block w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm font-medium shadow-sm transition-all whitespace-nowrap ${showFilters || hasActiveFilters
                                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden xs:inline">Filters</span>
                                {hasActiveFilters && (
                                    <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                                        {[statusFilter].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={handleCreateTeam}
                                className="flex-1 sm:flex-none lg:hidden inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                            >
                                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2.5">
                                <label className="text-xs font-medium text-gray-700">Status</label>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full xs:w-auto"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {['', 'active', 'inactive'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setStatusFilter(status);
                                            setCurrentPage(1);
                                        }}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${statusFilter === status
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        {status === '' && 'All Status'}
                                        {status === 'active' && <><CheckCircle2 className="h-4 w-4" />Active</>}
                                        {status === 'inactive' && <><XCircle className="h-4 w-4" />Inactive</>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="p-12">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Users className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-gray-900">No teams</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {searchQuery || statusFilter
                                        ? 'Try adjusting your filters'
                                        : 'Get started by creating a new team'}
                                </p>
                                {!searchQuery && !statusFilter && (
                                    <div className="mt-6">
                                        <button
                                            onClick={handleCreateTeam}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <UserPlus className="h-5 w-5" />
                                            New Team
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Name</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teams.map((team) => (
                                            <tr key={team.id} className="hover:bg-gray-50">
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{team.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {team.description || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${team.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {team.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleManageMembers(team)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Manage Members"
                                                        >
                                                            <UserCog className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditTeam(team)}
                                                            className="text-emerald-600 hover:text-emerald-900"
                                                            title="Edit Team"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTeam(team)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete Team"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md:hidden divide-y divide-gray-200">
                                {teams.map((team) => (
                                    <div key={team.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between mb-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900">{team.name}</h3>
                                                    {team.description && (
                                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{team.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span
                                                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full h-fit ${team.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {team.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            <div className="text-xs text-gray-600">
                                                <span className="font-medium">Members:</span>{' '}
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                                                    {team.member_count}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-3 border-t">
                                            <button
                                                onClick={() => handleManageMembers(team)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                                            >
                                                <UserCog className="h-4 w-4" />
                                                Members
                                            </button>
                                            <button
                                                onClick={() => handleEditTeam(team)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTeam(team)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </>
                    )}
                </div>

                {!loading && teams.length > 0 && totalPages > 1 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700 order-2 sm:order-1">
                                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                                <span className="font-medium">{totalCount}</span> results
                            </div>

                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="sm:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Prev
                                </button>

                                <div className="hidden md:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <span className="md:hidden text-sm text-gray-700 px-2">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
            {isMembersModalOpen && selectedTeam && (
                <TeamMembersModal
                    team={selectedTeam}
                    onClose={handleModalClose}
                />
            )}
        </OrganizationLayout>
    );
}
