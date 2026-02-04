'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/token-utils';
import { getApiUrl } from '@/lib/api-utils';
import { getPriorityConfig } from '@/lib/priority-utils';
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
    FileText,
    Building2,
    Wrench,
    AlertTriangle,
    Info,
    ChevronRight,
    RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', label: 'Completed' };
            case 'in_progress':
                return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', label: 'In Progress' };
            case 'pending':
                return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200', label: 'Pending' };
            case 'under_review':
                return { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', label: 'Under Review' };
            case 'accepted':
                return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200', label: 'Accepted' };
            case 'cancelled':
                return { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', label: 'Cancelled' };
            case 'rejected':
                return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200', label: 'Rejected' };
            default:
                return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', label: status };
        }
    };

    const getRequestTypeConfig = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'maintenance':
                return { icon: Wrench, label: 'Maintenance Request' };
            case 'service':
                return { icon: Wrench, label: 'Service Request' };
            case 'issue':
                return { icon: AlertTriangle, label: 'Issue Report' };
            case 'inspection':
                return { icon: FileText, label: 'Inspection Request' };
            default:
                return { icon: FileText, label: type };
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="min-h-full bg-gray-50 flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">Loading request details...</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (!request) {
        return (
            <CustomerLayout>
                <div className="min-h-full bg-gray-50 flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Not Found</h3>
                        <p className="text-gray-600 mb-4">The request you're looking for doesn't exist.</p>
                        <Link
                            href="/customer/requests"
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Requests
                        </Link>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    const statusConfig = getStatusConfig(request.status);
    const priorityConfig = getPriorityConfig(request.priority);
    const requestTypeConfig = getRequestTypeConfig(request.request_type);
    const StatusIcon = statusConfig.icon;
    const TypeIcon = requestTypeConfig.icon;

    return (
        <CustomerLayout>
            <div className="bg-gray-50 min-h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Link href="/customer/requests" className="hover:text-emerald-600 transition-colors">
                                Service Requests
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-gray-900 font-medium">{request.request_number}</span>
                        </div>

                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {request.title}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {request.request_number}
                                    </p>
                                    {/* Status Tags */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusConfig.label}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                                            {priorityConfig.label}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            <TypeIcon className="h-3.5 w-3.5" />
                                            {requestTypeConfig.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={loadRequest}
                                disabled={isLoading}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                                title="Refresh"
                            >
                                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Equipment Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-emerald-600" />
                                        Equipment Information
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipment Name</p>
                                            <p className="text-sm font-semibold text-gray-900">{request.equipment?.name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipment Number</p>
                                            <p className="text-sm font-semibold text-gray-900">{request.equipment?.equipment_number || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</p>
                                            <p className="text-sm text-gray-700">{request.equipment?.equipment_type?.replace(/_/g, ' ') || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Manufacturer</p>
                                            <p className="text-sm text-gray-700">{request.equipment?.manufacturer || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Model</p>
                                            <p className="text-sm text-gray-700">{request.equipment?.model || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serial Number</p>
                                            <p className="text-sm text-gray-700">{request.equipment?.serial_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-emerald-600" />
                                        Location
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Facility</p>
                                            <p className="text-sm font-semibold text-gray-900">{request.facility?.name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Building</p>
                                            <p className="text-sm text-gray-700">{request.equipment?.building?.name || 'N/A'}</p>
                                        </div>
                                        {request.facility?.address && (
                                            <div className="space-y-1 sm:col-span-2">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                                                <p className="text-sm text-gray-700">{request.facility.address}</p>
                                            </div>
                                        )}
                                        {request.facility?.city && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</p>
                                                <p className="text-sm text-gray-700">{request.facility.city}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Response Card */}
                            {request.response_message && (
                                <div className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-blue-200 bg-blue-100/50">
                                        <h2 className="text-base font-semibold text-blue-900 flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-blue-600" />
                                            Response from Team
                                        </h2>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-blue-800 leading-relaxed">{request.response_message}</p>
                                        {request.estimated_timeline && (
                                            <div className="mt-4 pt-4 border-t border-blue-200">
                                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Estimated Timeline</p>
                                                <p className="text-sm font-semibold text-blue-900">{request.estimated_timeline}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Card */}
                            {request.rejection_reason && (
                                <div className="bg-red-50 rounded-xl border border-red-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-red-200 bg-red-100/50">
                                        <h2 className="text-base font-semibold text-red-900 flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            Rejection Reason
                                        </h2>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-red-800 leading-relaxed">{request.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            {request.comments && request.comments.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-emerald-600" />
                                            Comments & Updates
                                            <span className="text-xs font-normal text-gray-500">({request.comments.length})</span>
                                        </h2>
                                    </div>
                                    <div className="p-5">
                                        <div className="space-y-4">
                                            {request.comments.map((comment: any, index: number) => (
                                                <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <User className="h-4 w-4 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {comment.user_name || 'System'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDateTime(comment.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                            {comment.comment_text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {request.attachments && request.attachments.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <Paperclip className="h-5 w-5 text-emerald-600" />
                                            Attachments
                                            <span className="text-xs font-normal text-gray-500">({request.attachments.length})</span>
                                        </h2>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {request.attachments.map((attachment: any, index: number) => (
                                                <a
                                                    key={index}
                                                    href={attachment.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-emerald-300 transition-colors"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Paperclip className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm text-gray-900 truncate">{attachment.file_name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Timeline Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-emerald-600" />
                                        Timeline
                                    </h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDateTime(request.created_at)}</p>
                                        </div>
                                    </div>
                                    {request.reviewed_at && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reviewed</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDateTime(request.reviewed_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDateTime(request.updated_at)}</p>
                                        </div>
                                    </div>
                                    {request.completed_at && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDateTime(request.completed_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                        Description
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {request.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            {/* Task Information Card */}
                            {request.converted_task && (
                                <div className="bg-emerald-50 rounded-xl border border-emerald-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-emerald-200 bg-emerald-100/50">
                                        <h2 className="text-base font-semibold text-emerald-900 flex items-center gap-2">
                                            <Wrench className="h-5 w-5 text-emerald-600" />
                                            Task Information
                                        </h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Task Number</p>
                                                <p className="text-sm font-bold text-emerald-900">{request.converted_task.task_number}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                request.converted_task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                request.converted_task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                request.converted_task.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {request.converted_task.status_display || request.converted_task.status?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        
                                        {request.converted_task.scheduled_start && (
                                            <div>
                                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Scheduled Start</p>
                                                <p className="text-sm font-medium text-emerald-900">{formatDateTime(request.converted_task.scheduled_start)}</p>
                                            </div>
                                        )}
                                        
                                        {request.converted_task.scheduled_end && (
                                            <div>
                                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Scheduled End</p>
                                                <p className="text-sm font-medium text-emerald-900">{formatDateTime(request.converted_task.scheduled_end)}</p>
                                            </div>
                                        )}
                                        
                                        {/* Assigned Technicians */}
                                        {request.converted_task.assignees && request.converted_task.assignees.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Assigned Technicians</p>
                                                <div className="space-y-2">
                                                    {request.converted_task.assignees.map((assignee: any, index: number) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                                <User className="h-4 w-4 text-emerald-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-emerald-900">{assignee.full_name || assignee.email}</p>
                                                                {assignee.full_name && assignee.email && (
                                                                    <p className="text-xs text-emerald-700">{assignee.email}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Assigned Team */}
                                        {request.converted_task.team && (
                                            <div>
                                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Assigned Team</p>
                                                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <User className="h-4 w-4 text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-emerald-900">{request.converted_task.team.name}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* No Assignment Message */}
                                        {(!request.converted_task.assignees || request.converted_task.assignees.length === 0) && !request.converted_task.team && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-medium text-amber-900 mb-0.5">Pending Assignment</p>
                                                        <p className="text-xs text-amber-700">A technician will be assigned to this task soon.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="pt-3 border-t border-emerald-200">
                                            <div className="flex items-center gap-2 text-xs text-emerald-700">
                                                <Info className="h-4 w-4" />
                                                <span>Your request has been converted to a task and is being worked on by our team.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Issue Details Card */}
                            {(request.issue_type || request.severity) && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-emerald-600" />
                                            Issue Details
                                        </h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {request.issue_type && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Issue Type</p>
                                                <p className="text-sm font-medium text-gray-900">{request.issue_type_display || request.issue_type?.replace(/_/g, ' ')}</p>
                                            </div>
                                        )}
                                        {request.severity && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Severity</p>
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${request.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                        request.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                                                            request.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {request.severity_display || request.severity}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
