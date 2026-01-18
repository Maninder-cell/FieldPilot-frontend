'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    Search,
    Filter,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Eye,
} from 'lucide-react';
import { getCustomerServiceRequests } from '@/lib/customer-api';
import toast from 'react-hot-toast';

export default function CustomerRequests() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0,
    });

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
                statusFilter === 'all' ? undefined : statusFilter
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
                return 'bg-emerald-100 text-emerald-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-orange-100 text-orange-800';
            case 'under_review':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical':
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

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const filteredRequests = requests.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Service Requests</h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    Manage and track your service requests
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/customer/requests/new')}
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                New Request
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Requests List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Clock className="h-8 w-8 text-emerald-600 animate-spin" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm ? 'Try adjusting your search' : 'Create your first service request to get started'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => router.push('/customer/requests/new')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                                >
                                    <Plus className="h-5 w-5" />
                                    New Request
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/customer/requests/${request.id}`)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getStatusIcon(request.status)}
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {request.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {request.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500">
                                                    {request.request_number}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {formatStatus(request.status)}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                                {request.equipment && (
                                                    <span className="text-xs text-gray-500">
                                                        📦 {request.equipment.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/customer/requests/${request.id}`);
                                            }}
                                            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Eye className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                        <span>Created {new Date(request.created_at).toLocaleDateString()}</span>
                                        <span>Updated {new Date(request.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.total > pagination.pageSize && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                                {pagination.total} requests
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page * pagination.pageSize >= pagination.total}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
