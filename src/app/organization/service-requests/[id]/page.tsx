'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Building2,
    Wrench,
    AlertTriangle,
    Settings,
    Search,
    MessageSquare,
    Paperclip,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle as AlertCircleIcon,
    Flame,
    FileText,
    MapPin,
    Star,
} from 'lucide-react';
import AcceptRequestModal from '@/components/organization/AcceptRequestModal';
import RejectRequestModal from '@/components/organization/RejectRequestModal';
import FeedbackModal from '@/components/organization/FeedbackModal';
import InternalNotesModal from '@/components/organization/InternalNotesModal';
import ConvertToTaskModal from '@/components/organization/ConvertToTaskModal';
import { getServiceRequestById, requestClarification } from '@/lib/service-requests-api';
import { ServiceRequest } from '@/types/service-requests';
import { toast } from 'react-hot-toast';

export default function ServiceRequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'attachments'>('details');

    const requestId = params?.id as string;
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showInternalNotesModal, setShowInternalNotesModal] = useState(false);
    const [showConvertToTaskModal, setShowConvertToTaskModal] = useState(false);
    const [showClarificationForm, setShowClarificationForm] = useState(false);
    const [clarificationMessage, setClarificationMessage] = useState('');
    const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);


    useEffect(() => {
        if (requestId) {
            loadRequest();
        }
    }, [requestId]);

    const loadRequest = async () => {
        try {
            setLoading(true);
            const response = await getServiceRequestById(requestId);
            setRequest(response.data);
        } catch (error: any) {
            console.error('Failed to load service request:', error);
            toast.error('Failed to load service request');
            router.push('/organization/service-requests');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestClarification = async () => {
        if (!clarificationMessage.trim()) {
            toast.error('Please enter a clarification message');
            return;
        }

        try {
            setIsSubmittingClarification(true);
            const response = await requestClarification(requestId, clarificationMessage);
            
            if (response.success) {
                toast.success('Clarification requested successfully');
                setClarificationMessage('');
                setShowClarificationForm(false);
                loadRequest(); // Reload to show the new comment
            } else {
                toast.error(response.error?.message || 'Failed to request clarification');
            }
        } catch (error: any) {
            console.error('Failed to request clarification:', error);
            toast.error('Failed to request clarification');
        } finally {
            setIsSubmittingClarification(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            under_review: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
            accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
            in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Settings },
            completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-4 w-4" />
                {request?.status_display || status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig: Record<string, { bg: string; text: string; icon: any }> = {
            low: { bg: 'bg-green-100', text: 'text-green-800', icon: AlertCircleIcon },
            medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircleIcon },
            high: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle },
            urgent: { bg: 'bg-red-100', text: 'text-red-800', icon: Flame },
        };

        const config = priorityConfig[priority] || priorityConfig.medium;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-4 w-4" />
                {request?.priority_display || priority}
            </span>
        );
    };

    const getRequestTypeIcon = (type: string) => {
        const icons: Record<string, any> = {
            service: Wrench,
            issue: AlertTriangle,
            maintenance: Settings,
            inspection: Search,
        };
        return icons[type] || FileText;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <OrganizationLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>

                {/* Modals */}
                <AcceptRequestModal
                    isOpen={showAcceptModal}
                    onClose={() => setShowAcceptModal(false)}
                    requestId={requestId}
                    onSuccess={loadRequest}
                />
                <RejectRequestModal
                    isOpen={showRejectModal}
                    onClose={() => setShowRejectModal(false)}
                    requestId={requestId}
                    onSuccess={loadRequest}
                />
                <FeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    requestId={requestId}
                    onSuccess={loadRequest}
                />
            </OrganizationLayout>
        );
    }

    if (!request) {
        return (
            <OrganizationLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Service Request Not Found</h2>
                        <button
                            onClick={() => router.push('/organization/service-requests')}
                            className="mt-4 text-emerald-600 hover:text-emerald-700"
                        >
                            Back to Service Requests
                        </button>
                    </div>
                </div>

                {/* Modals */}
                <AcceptRequestModal
                    isOpen={showAcceptModal}
                    onClose={() => setShowAcceptModal(false)}
                    requestId={requestId}
                    onSuccess={loadRequest}
                />
                <RejectRequestModal
                    isOpen={showRejectModal}
                    onClose={() => setShowRejectModal(false)}
                    requestId={requestId}
                    onSuccess={loadRequest}
                />
                <FeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    requestId={requestId}
                    onSuccess={loadRequest}
                />
            </OrganizationLayout>
        );
    }

    const RequestTypeIcon = getRequestTypeIcon(request.request_type);

    return (
        <OrganizationLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.push('/organization/service-requests')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <RequestTypeIcon className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                                            <p className="text-sm text-gray-500">{request.request_number}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(request.status)}
                                {getPriorityBadge(request.priority)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tabs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="border-b border-gray-200">
                                    <nav className="flex -mb-px">
                                        {[
                                            { id: 'details', label: 'Details', icon: FileText },
                                            { id: 'timeline', label: 'Timeline', icon: Clock },
                                            { id: 'comments', label: 'Comments', icon: MessageSquare },
                                            { id: 'attachments', label: 'Attachments', icon: Paperclip },
                                        ].map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                                        ? 'border-emerald-600 text-emerald-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === 'details' && (
                                        <div className="space-y-6">
                                            {/* Description */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                                            </div>

                                            {/* Issue Details (if issue type) */}
                                            {request.request_type === 'issue' && (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                    <h3 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Issue Details
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-orange-700 mb-1">Issue Type</p>
                                                            <p className="text-sm font-medium text-orange-900">
                                                                {request.issue_type_display || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-orange-700 mb-1">Severity</p>
                                                            <p className="text-sm font-medium text-orange-900">
                                                                {request.severity_display || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Response Message */}
                                            {request.response_message && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Response</h3>
                                                    <p className="text-sm text-blue-800">{request.response_message}</p>
                                                    {request.estimated_timeline && (
                                                        <p className="text-xs text-blue-700 mt-2">
                                                            Estimated Timeline: {request.estimated_timeline}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Rejection Reason */}
                                            {request.status === 'rejected' && request.rejection_reason && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                    <h3 className="text-sm font-semibold text-red-900 mb-2">Rejection Reason</h3>
                                                    <p className="text-sm text-red-800">{request.rejection_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {
                                        activeTab === 'timeline' && (
                                            <div className="space-y-4">
                                                {request.actions && request.actions.length > 0 ? (
                                                    <div className="relative">
                                                        {/* Timeline line */}
                                                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                                        {/* Timeline items */}
                                                        <div className="space-y-6">
                                                            {request.actions.map((action: any) => {
                                                                // Determine icon and color based on action type
                                                                const getActionIcon = (type: string) => {
                                                                    switch (type) {
                                                                        case 'created':
                                                                            return { Icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' };
                                                                        case 'status_changed':
                                                                            return { Icon: Settings, color: 'bg-blue-100 text-blue-600' };
                                                                        case 'commented':
                                                                            return { Icon: MessageSquare, color: 'bg-purple-100 text-purple-600' };
                                                                        case 'attachment_added':
                                                                            return { Icon: Paperclip, color: 'bg-orange-100 text-orange-600' };
                                                                        case 'accepted':
                                                                            return { Icon: CheckCircle, color: 'bg-green-100 text-green-600' };
                                                                        case 'rejected':
                                                                            return { Icon: XCircle, color: 'bg-red-100 text-red-600' };
                                                                        case 'assigned':
                                                                            return { Icon: User, color: 'bg-indigo-100 text-indigo-600' };
                                                                        default:
                                                                            return { Icon: Clock, color: 'bg-gray-100 text-gray-600' };
                                                                    }
                                                                };

                                                                const { Icon, color } = getActionIcon(action.action_type);

                                                                return (
                                                                    <div key={action.id} className="relative flex gap-4">
                                                                        {/* Icon */}
                                                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${color} ring-4 ring-white z-10`}>
                                                                            <Icon className="h-5 w-5" />
                                                                        </div>

                                                                        {/* Content */}
                                                                        <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                                            <div className="flex items-start justify-between mb-2">
                                                                                <div>
                                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                                        {action.action_display}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                                        {action.user_name || 'System'} • {formatDate(action.created_at)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {action.description && (
                                                                                <p className="text-sm text-gray-700 mb-2">
                                                                                    {action.description}
                                                                                </p>
                                                                            )}

                                                                            {/* Internal Note Badge */}
                                                                            {action.metadata?.is_internal && (
                                                                                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                                                                                    Internal Note
                                                                                </span>
                                                                            )}

                                                                            {/* Metadata (excluding is_internal) */}
                                                                            {action.metadata && Object.keys(action.metadata).filter(key => key !== 'is_internal').length > 0 && (
                                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                                    {Object.entries(action.metadata)
                                                                                        .filter(([key]) => key !== 'is_internal')
                                                                                        .map(([key, value]: [string, any]) => (
                                                                                            <span
                                                                                                key={key}
                                                                                                className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600"
                                                                                            >
                                                                                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                                                                                                <span className="ml-1">{String(value)}</span>
                                                                                            </span>
                                                                                        ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                                        <p>No timeline events yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }

                                    {activeTab === 'comments' && (
                                        <div className="space-y-4">
                                            {/* Comments List */}
                                            {request.comments && request.comments.length > 0 ? (
                                                <div className="space-y-4">
                                                    {request.comments.map((comment: any) => (
                                                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0">
                                                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                        <User className="h-5 w-5 text-emerald-600" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <p className="text-sm font-semibold text-gray-900">
                                                                            {comment.user_name || 'User'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {formatDate(comment.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                                        {comment.comment_text}
                                                                    </p>
                                                                    {comment.is_internal && (
                                                                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                                                            Internal Note
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                                    <p>No comments yet</p>
                                                </div>
                                            )}

                                            {/* Add Comment Form */}
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <form
                                                    onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        const form = e.currentTarget; // Capture form reference
                                                        const formData = new FormData(form);
                                                        const commentText = formData.get('comment') as string;

                                                        if (!commentText.trim()) {
                                                            toast.error('Please enter a comment');
                                                            return;
                                                        }

                                                        try {
                                                            const { addRequestComment, getRequestComments } = await import('@/lib/service-requests-api');
                                                            await addRequestComment(requestId, commentText, false);
                                                            toast.success('Comment added successfully');
                                                            form.reset(); // Use captured reference

                                                            // Fetch updated comments list
                                                            const commentsResponse = await getRequestComments(requestId);
                                                            console.log('Comments response:', commentsResponse);

                                                            // Handle both response formats
                                                            const comments = commentsResponse.data || commentsResponse;
                                                            setRequest(prev => prev ? { ...prev, comments } : null);
                                                        } catch (error: any) {
                                                            console.error('Comment error:', error);
                                                            toast.error(error.message || 'Failed to add comment');
                                                        }
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    <textarea
                                                        name="comment"
                                                        rows={3}
                                                        placeholder="Add a comment..."
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                                    />
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                                                        >
                                                            Add Comment
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'attachments' && (
                                        <div className="space-y-4">
                                            {/* Attachments List */}
                                            {request.attachments && request.attachments.length > 0 ? (
                                                <div className="space-y-3">
                                                    {request.attachments.map((attachment: any) => {
                                                        const fileExtension = attachment.filename?.split('.').pop()?.toLowerCase() || '';
                                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                                                        const isPDF = fileExtension === 'pdf';

                                                        return (
                                                            <div
                                                                key={attachment.id}
                                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${isImage ? 'bg-purple-100' : isPDF ? 'bg-red-100' : 'bg-blue-100'
                                                                        }`}>
                                                                        <FileText className={`h-5 w-5 ${isImage ? 'text-purple-600' : isPDF ? 'text-red-600' : 'text-blue-600'
                                                                            }`} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {attachment.filename || 'Unnamed file'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : 'Unknown size'} •
                                                                            {attachment.uploaded_by?.full_name || 'Unknown'} •
                                                                            {formatDate(attachment.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <a
                                                                    href={attachment.file_url}
                                                                    download
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-shrink-0 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                >
                                                                    Download
                                                                </a>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Paperclip className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                                    <p>No attachments yet</p>
                                                </div>
                                            )}

                                            {/* Upload Form */}
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <form
                                                    onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        const form = e.currentTarget; // Capture form reference
                                                        const formData = new FormData(form);
                                                        const file = formData.get('file') as File;

                                                        if (!file || file.size === 0) {
                                                            toast.error('Please select a file');
                                                            return;
                                                        }

                                                        // Check file size (max 10MB)
                                                        if (file.size > 10 * 1024 * 1024) {
                                                            toast.error('File size must be less than 10MB');
                                                            return;
                                                        }

                                                        try {
                                                            const { uploadRequestAttachment, getRequestAttachments } = await import('@/lib/service-requests-api');
                                                            await uploadRequestAttachment(requestId, file);
                                                            toast.success('File uploaded successfully');
                                                            form.reset(); // Use captured reference

                                                            // Fetch updated attachments list
                                                            const attachmentsResponse = await getRequestAttachments(requestId);
                                                            console.log('Attachments response:', attachmentsResponse);

                                                            // Handle both response formats
                                                            const attachments = attachmentsResponse.data || attachmentsResponse;
                                                            setRequest(prev => prev ? { ...prev, attachments } : null);
                                                        } catch (error: any) {
                                                            console.error('Attachment error:', error);
                                                            toast.error(error.message || 'Failed to upload file');
                                                        }
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Upload Attachment
                                                        </label>
                                                        <input
                                                            type="file"
                                                            name="file"
                                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Maximum file size: 10MB
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <Paperclip className="h-4 w-4" />
                                                            Upload File
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Actions Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-emerald-600" />
                                    Actions
                                </h3>
                                <div className="space-y-2">
                                    {/* Mark Under Review */}
                                    {request.status === 'pending' && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const { markUnderReview } = await import('@/lib/service-requests-api');
                                                    await markUnderReview(requestId);
                                                    toast.success('Marked as under review');
                                                    loadRequest();
                                                } catch (error: any) {
                                                    toast.error(error.message || 'Failed to update status');
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Mark Under Review
                                        </button>
                                    )}

                                    {/* Accept & Reject */}
                                    {['pending', 'under_review'].includes(request.status) && (
                                        <>
                                            <button
                                                onClick={() => setShowAcceptModal(true)}
                                                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Accept Request
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject Request
                                            </button>
                                        </>
                                    )}

                                    {/* Internal Notes */}
                                    {!['completed', 'cancelled', 'rejected'].includes(request.status) && (
                                        <button
                                            onClick={() => setShowInternalNotesModal(true)}
                                            className="w-full px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Internal Notes
                                        </button>
                                    )}

                                    {/* Request Clarification */}
                                    {!['completed', 'cancelled', 'rejected'].includes(request.status) && (
                                        <button
                                            onClick={() => setShowClarificationForm(!showClarificationForm)}
                                            className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Request Clarification
                                        </button>
                                    )}

                                    {/* Convert to Task */}
                                    {request.status === 'accepted' && (
                                        <button
                                            onClick={() => setShowConvertToTaskModal(true)}
                                            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Convert to Task
                                        </button>
                                    )}

                                    {/* Submit Feedback */}
                                    {request.status === 'completed' && (
                                        <button
                                            onClick={() => setShowFeedbackModal(true)}
                                            className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Star className="h-4 w-4" />
                                            Submit Feedback
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Clarification Form */}
                            {showClarificationForm && (
                                <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6">
                                    <h3 className="text-sm font-semibold text-amber-900 mb-4 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-amber-600" />
                                        Request Clarification from Customer
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-amber-900 mb-2">
                                                Your Message
                                            </label>
                                            <textarea
                                                value={clarificationMessage}
                                                onChange={(e) => setClarificationMessage(e.target.value)}
                                                placeholder="Ask the customer for more information..."
                                                rows={4}
                                                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleRequestClarification}
                                                disabled={isSubmittingClarification || !clarificationMessage.trim()}
                                                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmittingClarification ? (
                                                    <>
                                                        <Clock className="h-4 w-4 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MessageSquare className="h-4 w-4" />
                                                        Send Request
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowClarificationForm(false);
                                                    setClarificationMessage('');
                                                }}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Customer Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-600" />
                                    Customer
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">{request.customer?.full_name || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">{request.customer?.email || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Equipment Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-emerald-600" />
                                    Equipment
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Name</p>
                                        <p className="text-sm font-medium text-gray-900">{request.equipment.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Equipment Number</p>
                                        <p className="text-sm text-gray-700">{request.equipment.equipment_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Facility Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-emerald-600" />
                                    Facility
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Name</p>
                                        <p className="text-sm font-medium text-gray-900">{request.facility.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Code</p>
                                        <p className="text-sm text-gray-700">{request.facility.code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                    Timestamps
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Created</p>
                                        <p className="text-sm text-gray-700">{formatDate(request.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                        <p className="text-sm text-gray-700">{formatDate(request.updated_at)}</p>
                                    </div>
                                    {request.completed_at && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Completed</p>
                                            <p className="text-sm text-gray-700">{formatDate(request.completed_at)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Internal Notes Display */}
                            {request.internal_notes && (
                                <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-amber-600" />
                                            Internal Notes
                                        </h3>
                                        <button
                                            onClick={() => setShowInternalNotesModal(true)}
                                            className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                                        >
                                            <Edit className="h-3 w-3" />
                                            Edit
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-amber-100">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.internal_notes}</p>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                        <AlertCircleIcon className="h-3 w-3" />
                                        Only visible to staff members
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AcceptRequestModal
                isOpen={showAcceptModal}
                onClose={() => setShowAcceptModal(false)}
                requestId={requestId}
                onSuccess={loadRequest}
            />
            <RejectRequestModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                requestId={requestId}
                onSuccess={loadRequest}
            />
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                requestId={requestId}
                onSuccess={loadRequest}
            />
            <InternalNotesModal
                isOpen={showInternalNotesModal}
                onClose={() => setShowInternalNotesModal(false)}
                requestId={requestId}
                currentNotes={request?.internal_notes || ''}
                onSuccess={loadRequest}
            />
            <ConvertToTaskModal
                isOpen={showConvertToTaskModal}
                onClose={() => setShowConvertToTaskModal(false)}
                requestId={requestId}
                requestTitle={request?.title || ''}
                requestDescription={request?.description || ''}
                onSuccess={loadRequest}
            />
        </OrganizationLayout>
    );
}
