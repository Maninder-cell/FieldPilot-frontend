'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import ServiceRequestModal from '@/components/organization/ServiceRequestModal';
import DeleteServiceRequestModal from '@/components/organization/DeleteServiceRequestModal';
import { getServiceRequests, getServiceRequestById } from '@/lib/service-requests-api';
import { ServiceRequest, ServiceRequestStatus, ServiceRequestPriority, ServiceRequestType } from '@/types/service-requests';
import { FileText, Plus, Search, Edit, Trash2, Filter, X, AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ServiceRequestsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | ''>('');
    const [priorityFilter, setPriorityFilter] = useState<ServiceRequestPriority | ''>('');
    const [typeFilter, setTypeFilter] = useState<ServiceRequestType | ''>('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [requestToDelete, setRequestToDelete] = useState<ServiceRequest | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Initial load
    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    // Debounced search
    useEffect(() => {
        if (!user) return;

        const timeoutId = setTimeout(() => {
            loadRequests();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter, priorityFilter, typeFilter]);

    const loadRequests = async (page: number = currentPage, size: number = pageSize) => {
        try {
            setIsLoading(true);
            const response = await getServiceRequests({
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                request_type: typeFilter || undefined,
                page,
                page_size: size,
            });
            // Backend returns paginated response directly: {count, next, previous, results}
            setRequests(response.results || []);
            setTotalCount(response.count || 0);
        } catch (error: any) {
            console.error('Failed to load service requests:', error);
            toast.error('Failed to load service requests');
            setRequests([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setPriorityFilter('');
        setTypeFilter('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || statusFilter || priorityFilter || typeFilter;

    const handleCreate = () => {
        setSelectedRequest(null);
        setIsModalOpen(true);
    };

    const handleView = (request: ServiceRequest) => {
        router.push(`/organization/service-requests/${request.id}`);
    };

    const handleEdit = async (request: ServiceRequest) => {
        try {
            setIsFetchingDetails(true);
            toast.loading('Loading request details...', { id: 'fetch-request' });

            const response = await getServiceRequestById(request.id);
            setSelectedRequest(response.data);
            setIsModalOpen(true);

            toast.dismiss('fetch-request');
        } catch (error: any) {
            console.error('Failed to load request details:', error);
            toast.error('Failed to load request details', { id: 'fetch-request' });
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const handleDelete = (request: ServiceRequest) => {
        setRequestToDelete(request);
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setTimeout(() => loadRequests(), 100);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setRequestToDelete(null);
        setTimeout(() => loadRequests(), 100);
    };

    const getStatusBadgeColor = (status: ServiceRequestStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'under_review':
                return 'bg-blue-100 text-blue-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'in_progress':
                return 'bg-purple-100 text-purple-800';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadgeColor = (priority: ServiceRequestPriority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Service Requests</h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">
                                Manage customer service requests and maintenance tickets
                            </p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            New Request
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={handleSearch}
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
                                        {[statusFilter, priorityFilter, typeFilter].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 sm:flex-none lg:hidden inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
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
                                {['', 'pending', 'under_review', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setStatusFilter(status as ServiceRequestStatus | '');
                                            setCurrentPage(1);
                                        }}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${statusFilter === status
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        {status === '' && 'All Status'}
                                        {status === 'pending' && <><Clock className="h-4 w-4" />Pending</>}
                                        {status === 'under_review' && <><AlertCircle className="h-4 w-4" />Under Review</>}
                                        {status === 'accepted' && <><CheckCircle2 className="h-4 w-4" />Accepted</>}
                                        {status === 'rejected' && <><XCircle className="h-4 w-4" />Rejected</>}
                                        {status === 'in_progress' && 'In Progress'}
                                        {status === 'completed' && 'Completed'}
                                        {status === 'cancelled' && 'Cancelled'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Priority</label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {['', 'low', 'medium', 'high', 'urgent'].map((priority) => (
                                    <button
                                        key={priority}
                                        onClick={() => {
                                            setPriorityFilter(priority as ServiceRequestPriority | '');
                                            setCurrentPage(1);
                                        }}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${priorityFilter === priority
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                                            }`}
                                    >
                                        {priority === '' && 'All Priorities'}
                                        {priority === 'low' && 'Low'}
                                        {priority === 'medium' && 'Medium'}
                                        {priority === 'high' && <><AlertTriangle className="h-4 w-4" />High</>}
                                        {priority === 'urgent' && <><AlertTriangle className="h-4 w-4" />Urgent</>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Request Type</label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {['', 'maintenance', 'repair', 'inspection', 'issue', 'other'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setTypeFilter(type as ServiceRequestType | '');
                                            setCurrentPage(1);
                                        }}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${typeFilter === type
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                                            }`}
                                    >
                                        {type === '' && 'All Types'}
                                        {type === 'maintenance' && 'Maintenance'}
                                        {type === 'repair' && 'Repair'}
                                        {type === 'inspection' && 'Inspection'}
                                        {type === 'issue' && 'Issue'}
                                        {type === 'other' && 'Other'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-gray-900">No service requests</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {searchQuery || statusFilter || priorityFilter || typeFilter
                                        ? 'Try adjusting your filters'
                                        : 'Get started by creating a new service request'}
                                </p>
                                {!searchQuery && !statusFilter && !priorityFilter && !typeFilter && (
                                    <div className="mt-6">
                                        <button
                                            onClick={handleCreate}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                            New Request
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
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                            <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {requests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleView(request)}>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{request.title}</div>
                                                    <div className="text-sm text-gray-500">{request.request_number}</div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="text-sm text-gray-900">{request.customer.full_name}</div>
                                                    <div className="text-sm text-gray-500">{request.customer.email}</div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="text-sm text-gray-900">{request.equipment.name}</div>
                                                    <div className="text-sm text-gray-500">{request.equipment.equipment_number}</div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className="text-sm text-gray-900 capitalize">{request.request_type_display}</span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                                        {request.status_display}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(request.priority)}`}>
                                                        {request.priority_display}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="text-sm text-gray-900">{formatDate(request.created_at)}</div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => handleView(request)} className="text-blue-600 hover:text-blue-900 mr-3" title="View Details">
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleEdit(request)} disabled={isFetchingDetails} className="text-emerald-600 hover:text-emerald-900 mr-3 disabled:opacity-50" title="Edit">
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(request)} disabled={isFetchingDetails} className="text-red-600 hover:text-red-900 disabled:opacity-50" title="Delete">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md:hidden divide-y divide-gray-200">
                                {requests.map((request) => (
                                    <div key={request.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleView(request)}>
                                        <div className="flex justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900">{request.title}</h3>
                                                <p className="text-xs text-gray-500">{request.request_number}</p>
                                            </div>
                                            <div className="ml-2 flex flex-col gap-1">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                                    {request.status_display}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(request.priority)}`}>
                                                    {request.priority_display}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            <div className="text-xs text-gray-600">
                                                <span className="font-medium">Customer:</span> {request.customer.full_name}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                <span className="font-medium">Equipment:</span> {request.equipment.name}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                <span className="font-medium">Type:</span> {request.request_type_display}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                <span className="font-medium">Created:</span> {formatDate(request.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleView(request)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                                                <Eye className="h-4 w-4" />View
                                            </button>
                                            <button onClick={() => handleEdit(request)} disabled={isFetchingDetails} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50">
                                                <Edit className="h-4 w-4" />Edit
                                            </button>
                                            <button onClick={() => handleDelete(request)} disabled={isFetchingDetails} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50">
                                                <Trash2 className="h-4 w-4" />Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {!isLoading && requests.length > 0 && totalCount > pageSize && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700 order-2 sm:order-1">
                                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                                <span className="font-medium">{totalCount}</span> results
                            </div>

                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => {
                                        setCurrentPage(currentPage - 1);
                                        loadRequests(currentPage - 1);
                                    }}
                                    disabled={currentPage === 1}
                                    className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentPage(currentPage - 1);
                                        loadRequests(currentPage - 1);
                                    }}
                                    disabled={currentPage === 1}
                                    className="sm:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Prev
                                </button>

                                <div className="hidden md:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => {
                                                    setCurrentPage(pageNum);
                                                    loadRequests(pageNum);
                                                }}
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
                                    Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                                </span>

                                <button
                                    onClick={() => {
                                        setCurrentPage(currentPage + 1);
                                        loadRequests(currentPage + 1);
                                    }}
                                    disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ServiceRequestModal
                    request={selectedRequest}
                    onClose={handleModalClose}
                />
            )}

            {isDeleteModalOpen && requestToDelete && (
                <DeleteServiceRequestModal
                    request={requestToDelete}
                    onClose={handleDeleteModalClose}
                />
            )}
        </OrganizationLayout>
    );
}
