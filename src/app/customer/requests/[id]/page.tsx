'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/token-utils';
import { getApiUrl } from '@/lib/api-utils';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Package,
    User,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Paperclip,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceRequestDetail() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const requestId = params.id as string;

    const [request, setRequest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && requestId) {
            loadRequest();
        }
    }, [user, authLoading, router, requestId]);

    const loadRequest = async () => {
        try {
            setIsLoading(true);
            const accessToken = getAccessToken();
            if (!accessToken) {
                router.push('/login');
                return;
            }

            const apiUrl = getApiUrl(true);
            const response = await fetch(`${apiUrl}/service-requests/${requestId}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch service request');
            }

            const data = await response.json();
            setRequest(data.success ? data.data : data);
        } catch (error: any) {
            console.error('Failed to load request:', error);
            toast.error('Failed to load service request');
            router.push('/customer/requests');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
            case 'in_progress':
                return <Clock className="h-6 w-6 text-blue-600" />;
            case 'pending':
                return <AlertCircle className="h-6 w-6 text-orange-600" />;
            case 'cancelled':
            case 'rejected':
                return <XCircle className="h-6 w-6 text-red-600" />;
            default:
                return <Clock className="h-6 w-6 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'under_review':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'cancelled':
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
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
        return status?.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || '';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
            </CustomerLayout>
        );
    }

    if (!request) {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Request Not Found</h3>
                        <button
                            onClick={() => router.push('/customer/requests')}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            Back to Requests
                        </button>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatusIcon(request.status)}
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {request.title}
                                    </h1>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Request #{request.request_number}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(request.status)}`}>
                                {formatStatus(request.status_display || request.status)}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(request.priority)}`}>
                                {request.priority_display || request.priority}
                            </span>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {request.request_type_display || formatStatus(request.request_type)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                            </div>

                            {/* Equipment Details */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-emerald-600" />
                                    Equipment Details
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Name:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.equipment?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Equipment Number:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.equipment?.equipment_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Type:</span>
                                        <span className="text-sm font-medium text-gray-900">{formatStatus(request.equipment?.equipment_type)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Manufacturer:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.equipment?.manufacturer || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Model:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.equipment?.model || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                    Location
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Facility:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.facility?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Building:</span>
                                        <span className="text-sm font-medium text-gray-900">{request.equipment?.building?.name}</span>
                                    </div>
                                    {request.facility?.city && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">City:</span>
                                            <span className="text-sm font-medium text-gray-900">{request.facility.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Comments */}
                            {request.comments && request.comments.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-emerald-600" />
                                        Comments ({request.comments.length})
                                    </h2>
                                    <div className="space-y-4">
                                        {request.comments.map((comment: any, index: number) => (
                                            <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">{comment.user_name}</span>
                                                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {request.attachments && request.attachments.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Paperclip className="h-5 w-5 text-emerald-600" />
                                        Attachments ({request.attachments.length})
                                    </h2>
                                    <div className="space-y-2">
                                        {request.attachments.map((attachment: any, index: number) => (
                                            <a
                                                key={index}
                                                href={attachment.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Paperclip className="h-5 w-5 text-gray-400" />
                                                <span className="text-sm text-gray-900">{attachment.file_name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Timeline */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    Timeline
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Created</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(request.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(request.updated_at)}</p>
                                    </div>
                                    {request.completed_at && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Completed</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDate(request.completed_at)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Info */}
                            {(request.issue_type || request.severity) && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h2>
                                    <div className="space-y-3">
                                        {request.issue_type && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Issue Type</p>
                                                <p className="text-sm font-medium text-gray-900">{formatStatus(request.issue_type_display || request.issue_type)}</p>
                                            </div>
                                        )}
                                        {request.severity && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Severity</p>
                                                <p className="text-sm font-medium text-gray-900">{formatStatus(request.severity_display || request.severity)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Response */}
                            {request.response_message && (
                                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Response</h2>
                                    <p className="text-sm text-blue-800">{request.response_message}</p>
                                    {request.estimated_timeline && (
                                        <p className="text-xs text-blue-600 mt-2">
                                            Estimated Timeline: {request.estimated_timeline}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {request.rejection_reason && (
                                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                                    <h2 className="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h2>
                                    <p className="text-sm text-red-800">{request.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
