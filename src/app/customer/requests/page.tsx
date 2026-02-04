'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPriorityBadgeClasses } from '@/lib/priority-utils';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    Search,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    Loader2,
    ChevronDown,
    ListFilter,
    Check,
    Wrench,
} from 'lucide-react';
import { getCustomerServiceRequests } from '@/lib/customer-api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const STATUS_OPTIONS = [
    { value: '', label: 'All Status', icon: ListFilter, color: 'text-gray-500' },
    { value: 'pending', label: 'Pending', icon: AlertCircle, color: 'text-orange-500' },
    { value: 'under_review', label: 'Under Review', icon: Clock, color: 'text-purple-500' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
];

export default function CustomerRequests() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    });
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user, pagination.page, statusFilter]);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const response = await getCustomerServiceRequests(
                pagination.page,
                pagination.pageSize,
                statusFilter || undefined
            );
            setRequests(response.results || []);
            setPagination(prev => ({ ...prev, total: response.count || 0 }));
        } catch (error: any) {
            console.error('Failed to load requests:', error);
            toast.error('Failed to load service requests');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
            case 'in_progress':
                return <Clock className="h-5 w-5 text-blue-600" />;
            case 'pending':
                return <AlertCircle className="h-5 w-5 text-orange-600" />;
            case 'under_review':
                return <Clock className="h-5 w-5 text-purple-600" />;
            case 'cancelled':
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-700';
            case 'in_progress':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
                return 'bg-orange-100 text-orange-700';
            case 'under_review':
                return 'bg-purple-100 text-purple-700';
            case 'accepted':
                return 'bg-green-100 text-green-700';
            case 'cancelled':
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'text-red-600';
            case 'high':
                return 'text-orange-600';
            case 'medium':
                return 'text-blue-600';
            case 'low':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const filteredRequests = requests.filter(request =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

    return (
        <CustomerLayout>
            <div className="bg-gray-50 min-h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Service Requests</h1>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    Track and manage your requests
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={loadRequests}
                                    disabled={isLoading}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                                <Link
                                    href="/customer/requests/new"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">New</span> Request
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-4 space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title, number, or equipment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="relative" ref={statusDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                className={`w-full sm:w-48 flex items-center justify-between gap-2 px-4 py-2.5 bg-white border rounded-lg text-sm transition-colors ${
                                    isStatusDropdownOpen 
                                        ? 'border-emerald-500 ring-2 ring-emerald-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const selected = STATUS_OPTIONS.find(o => o.value === statusFilter) || STATUS_OPTIONS[0];
                                        const Icon = selected.icon;
                                        return (
                                            <>
                                                <Icon className={`h-4 w-4 ${selected.color}`} />
                                                <span className="text-gray-700">{selected.label}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isStatusDropdownOpen && (
                                <div className="absolute right-0 sm:left-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                                    {STATUS_OPTIONS.map((option) => {
                                        const Icon = option.icon;
                                        const isSelected = statusFilter === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter(option.value);
                                                    setPagination(prev => ({ ...prev, page: 1 }));
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                                                    isSelected 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`h-4 w-4 ${option.color}`} />
                                                    <span>{option.label}</span>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {pagination.total} request{pagination.total !== 1 ? 's' : ''}
                            {statusFilter && ` • ${STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}`}
                        </span>
                    </div>

                    {/* Requests List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">No requests found</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {searchTerm ? 'Try adjusting your search' : 'Create your first service request'}
                            </p>
                            {!searchTerm && (
                                <Link
                                    href="/customer/requests/new"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Request
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map((request) => {
                                const statusOption = STATUS_OPTIONS.find(o => o.value === request.status) || STATUS_OPTIONS[0];
                                const StatusIcon = statusOption.icon;
                                
                                return (
                                    <Link
                                        key={request.id}
                                        href={`/customer/requests/${request.id}`}
                                        className="group block bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200"
                                    >
                                        <div className="p-5">
                                            {/* Top Row: Title and View Button */}
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className={`p-2 rounded-lg shrink-0 ${
                                                        request.status === 'completed' ? 'bg-emerald-100' :
                                                        request.status === 'in_progress' ? 'bg-blue-100' :
                                                        request.status === 'pending' ? 'bg-orange-100' :
                                                        request.status === 'under_review' ? 'bg-purple-100' :
                                                        request.status === 'cancelled' || request.status === 'rejected' ? 'bg-red-100' :
                                                        'bg-gray-100'
                                                    }`}>
                                                        <StatusIcon className={`h-5 w-5 ${statusOption.color}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                                                            {request.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-0.5">
                                                            {request.request_number}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 p-2 rounded-lg bg-gray-50 group-hover:bg-emerald-50 transition-colors">
                                                    <Eye className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {request.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 pl-12">
                                                    {request.description}
                                                </p>
                                            )}

                                            {/* Tags Row */}
                                            <div className="flex flex-wrap items-center gap-2 pl-12 mb-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {formatStatus(request.status)}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClasses(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                                {request.equipment?.name && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                        {request.equipment.name}
                                                    </span>
                                                )}
                                                {request.converted_task && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                        <Wrench className="h-3 w-3" />
                                                        Task: {request.converted_task.task_number}
                                                        {request.converted_task.assignees && request.converted_task.assignees.length > 0 && (
                                                            <span className="ml-1 text-emerald-600">• {request.converted_task.assignees.length} tech{request.converted_task.assignees.length !== 1 ? 's' : ''}</span>
                                                        )}
                                                        {request.converted_task.team && (
                                                            <span className="ml-1 text-emerald-600">• Team</span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Footer with Dates */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Created {formatDate(request.created_at)}</span>
                                                </div>
                                                <span>Updated {formatDate(request.updated_at)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs sm:text-sm text-gray-600">
                                Page {pagination.page} of {totalPages}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= totalPages}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
