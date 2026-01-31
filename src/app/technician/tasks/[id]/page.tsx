'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import TechnicianTimeTracking from '@/components/technician/TechnicianTimeTracking';
import {
    getTaskById,
    updateWorkStatus,
    getTaskComments,
    addTaskComment,
    deleteTaskComment,
    updateTaskComment,
    getTimeLogs,
    type Task,
    type TaskComment,
    type TimeLog,
} from '@/lib/technician-tasks-api';
import {
    ArrowLeft,
    Clock,
    User,
    Users,
    MapPin,
    Calendar,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    Wrench,
    Package,
    FileText,
    Send,
    Trash2,
    Edit3,
    X,
    Pause,
    Zap,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TechnicianTaskDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const taskId = params?.id as string;

    const [task, setTask] = useState<Task | null>(null);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');

    // Pagination state for comments
    const [commentsPage, setCommentsPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [totalCommentsCount, setTotalCommentsCount] = useState(0);
    const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

    // Delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && taskId) {
            loadTaskData();
        }
    }, [user, taskId]);

    const loadTaskData = async () => {
        try {
            setIsLoading(true);

            // Load task first (required)
            const taskResponse = await getTaskById(taskId);
            setTask(taskResponse.data);

            // Load comments with pagination info
            try {
                const commentsResponse = await getTaskComments(taskId);
                const responseData = commentsResponse as any;
                if (responseData.results?.data && Array.isArray(responseData.results.data)) {
                    setComments(responseData.results.data);
                    setTotalCommentsCount(responseData.count || responseData.results.data.length);
                    setHasMoreComments(!!responseData.next);
                } else if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
                    setComments(commentsResponse.data);
                    setTotalCommentsCount(commentsResponse.data.length);
                    setHasMoreComments(false);
                } else {
                    setComments([]);
                    setTotalCommentsCount(0);
                    setHasMoreComments(false);
                }
                setCommentsPage(1);
            } catch (error) {
                console.warn('Failed to load comments:', error);
                setComments([]);
                setTotalCommentsCount(0);
                setHasMoreComments(false);
            }

            try {
                const timeLogsResponse = await getTimeLogs(taskId);
                setTimeLogs(timeLogsResponse.data || []);
            } catch (error) {
                console.warn('Failed to load time logs:', error);
                setTimeLogs([]);
            }
        } catch (error: any) {
            console.error('Failed to load task:', error);
            toast.error('Failed to load task details');
            router.push('/technician/tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWorkStatusChange = async (newStatus: 'open' | 'in_progress' | 'on_hold' | 'completed') => {
        try {
            await updateWorkStatus(taskId, newStatus);
            // Update state directly without reloading
            if (task) {
                setTask({ ...task, work_status: newStatus });
            }
            toast.success('Work status updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update work status');
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setIsSubmittingComment(true);
            await addTaskComment(taskId, newComment.trim());
            setNewComment('');
            toast.success('Comment added');

            // Reload first page of comments
            const commentsResponse = await getTaskComments(taskId, 1);
            const responseData = commentsResponse as any;
            if (responseData.results?.data && Array.isArray(responseData.results.data)) {
                setComments(responseData.results.data);
                setTotalCommentsCount(responseData.count || responseData.results.data.length);
                setHasMoreComments(!!responseData.next);
            } else if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
                setComments(commentsResponse.data);
                setTotalCommentsCount(commentsResponse.data.length);
                setHasMoreComments(false);
            }
            setCommentsPage(1);
        } catch (error: any) {
            toast.error(error.message || 'Failed to add comment');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleEditComment = async (commentId: string) => {
        if (!editCommentText.trim()) return;

        try {
            await updateTaskComment(taskId, commentId, editCommentText.trim());
            // Update comment in state directly
            setComments(comments.map(c =>
                c.id === commentId ? { ...c, comment: editCommentText.trim() } : c
            ));
            setEditingCommentId(null);
            setEditCommentText('');
            toast.success('Comment updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        setCommentToDelete(commentId);
        setShowDeleteModal(true);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;

        try {
            await deleteTaskComment(taskId, commentToDelete);

            // Reload the current page to maintain 3 comments per page
            const currentPageNum = commentsPage;
            const commentsResponse = await getTaskComments(taskId, currentPageNum);

            const responseData = commentsResponse as any;
            if (responseData.results?.data && Array.isArray(responseData.results.data)) {
                setComments(responseData.results.data);
                setTotalCommentsCount(responseData.count || responseData.results.data.length);
                setHasMoreComments(!!responseData.next);
            } else if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
                setComments(commentsResponse.data);
                setTotalCommentsCount(commentsResponse.data.length);
                setHasMoreComments(false);
            }

            toast.success('Comment deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete comment');
        } finally {
            setShowDeleteModal(false);
            setCommentToDelete(null);
        }
    };

    const loadMoreComments = async () => {
        if (isLoadingMoreComments || !hasMoreComments) return;

        try {
            setIsLoadingMoreComments(true);
            const nextPage = commentsPage + 1;
            const commentsResponse = await getTaskComments(taskId, nextPage);

            const responseData = commentsResponse as any;
            let newComments: TaskComment[] = [];

            if (responseData.results?.data && Array.isArray(responseData.results.data)) {
                newComments = responseData.results.data;
                setHasMoreComments(!!responseData.next);
            } else if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
                newComments = commentsResponse.data;
                setHasMoreComments(false);
            }

            // Append new comments to existing ones
            setComments([...comments, ...newComments]);
            setCommentsPage(nextPage);
        } catch (error: any) {
            console.error('Failed to load more comments:', error);
            toast.error('Failed to load more comments');
        } finally {
            setIsLoadingMoreComments(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            critical: 'bg-red-100 text-red-700 border-red-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            low: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[priority as keyof typeof colors] || colors.medium;
    };

    const getWorkStatusColor = (status: string) => {
        const colors = {
            open: 'bg-gray-100 text-gray-700 border-gray-200',
            in_progress: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            completed: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[status as keyof typeof colors] || colors.open;
    };

    if (authLoading || isLoading) {
        return (
            <TechnicianLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            </TechnicianLayout>
        );
    }

    if (!user || !task) {
        return null;
    }

    return (
        <TechnicianLayout>
            <div className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex items-start gap-2 sm:gap-4">
                    <button
                        onClick={() => router.push('/technician/tasks')}
                        className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{task.title}</h1>
                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getPriorityColor(task.priority)} w-fit`}>
                                {task.priority.toUpperCase()} PRIORITY
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">{task.task_number}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Sidebar - Shows first on mobile, last on desktop */}
                    <div className="space-y-4 sm:space-y-6 lg:col-start-3 lg:row-start-1">
                        {/* Work Status Selector */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Status</h2>
                            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                                {[
                                    {
                                        value: 'open',
                                        label: 'Open',
                                        icon: FileText,
                                        selectedBg: 'bg-gray-600',
                                        iconColor: 'text-gray-600'
                                    },
                                    {
                                        value: 'in_progress',
                                        label: 'In Progress',
                                        icon: Zap,
                                        selectedBg: 'bg-blue-600',
                                        iconColor: 'text-blue-600'
                                    },
                                    {
                                        value: 'on_hold',
                                        label: 'On Hold',
                                        icon: Pause,
                                        selectedBg: 'bg-yellow-600',
                                        iconColor: 'text-yellow-600'
                                    },
                                    {
                                        value: 'completed',
                                        label: 'Completed',
                                        icon: CheckCircle2,
                                        selectedBg: 'bg-emerald-600',
                                        iconColor: 'text-emerald-600'
                                    },
                                ].map((status) => {
                                    const Icon = status.icon;
                                    const isSelected = task.work_status === status.value;

                                    return (
                                        <button
                                            key={status.value}
                                            onClick={() => handleWorkStatusChange(status.value as any)}
                                            className={`
                                                relative flex flex-col items-center justify-center px-2 sm:px-3 py-3 sm:py-4 rounded-lg border-2 transition-all duration-200
                                                ${isSelected
                                                    ? `${status.selectedBg} text-white border-transparent shadow-md`
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                                                }
                                                cursor-pointer active:scale-95 group min-h-[80px] sm:min-h-[90px]
                                            `}
                                        >
                                            <Icon
                                                className={`h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : status.iconColor
                                                    }`}
                                            />
                                            <span className={`text-xs sm:text-sm font-medium leading-tight text-center ${isSelected ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                {status.label}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Shows second on mobile, first on desktop */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:col-start-1 lg:row-start-1">
                        {/* Time Tracking Section */}
                        <TechnicianTimeTracking taskId={taskId} />

                        {/* Materials Needed */}
                        {task.materials_needed && task.materials_needed.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-emerald-600" />
                                    Materials Needed
                                </h2>
                                <ul className="space-y-2">
                                    {task.materials_needed.map((material: any, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{material}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-emerald-600" />
                                Comments ({totalCommentsCount})
                            </h2>

                            {/* Add Comment Form */}
                            <form onSubmit={handleAddComment} className="mb-6">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                    rows={3}
                                />
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmittingComment}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-4 w-4" />
                                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No comments yet</p>
                                        <p className="text-gray-400 text-xs mt-1">Be the first to share your thoughts</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Scrollable Comments Container */}
                                        <div className="max-h-96 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className={`border-l-4 ${comment.is_system_generated ? 'border-blue-400 bg-blue-50' : 'border-emerald-500 bg-gray-50'} p-4 rounded-r-lg`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${comment.is_system_generated ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                                                                <User className={`h-4 w-4 ${comment.is_system_generated ? 'text-blue-700' : 'text-emerald-700'}`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">
                                                                    {comment.is_system_generated ? 'System' : (comment.author?.full_name || 'Unknown User')}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(comment.created_at).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {comment.author?.id === user?.id && !comment.is_system_generated && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCommentId(comment.id);
                                                                        setEditCommentText(comment.comment);
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {editingCommentId === comment.id ? (
                                                        <div className="mt-2">
                                                            <textarea
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm"
                                                                rows={3}
                                                            />
                                                            <div className="mt-2 flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditComment(comment.id)}
                                                                    className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCommentId(null);
                                                                        setEditCommentText('');
                                                                    }}
                                                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Load More Button */}
                                        {hasMoreComments && (
                                            <div className="flex items-center justify-center pt-2">
                                                <button
                                                    onClick={loadMoreComments}
                                                    disabled={isLoadingMoreComments}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoadingMoreComments ? (
                                                        <>
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                            Load 3 More ({comments.length} of {totalCommentsCount})
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Show Less button when all comments are loaded */}
                                        {!hasMoreComments && comments.length > 3 && (
                                            <div className="flex flex-col items-center gap-2 pt-2">
                                                <p className="text-xs text-gray-500">
                                                    All {totalCommentsCount} comments loaded
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setComments(comments.slice(0, 3));
                                                        setCommentsPage(1);
                                                        setHasMoreComments(totalCommentsCount > 3);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                                >
                                                    <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                                                    Show Less
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {task.notes && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                    Notes
                                </h2>
                                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{task.notes}</p>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                Description
                            </h2>
                            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{task.description}</p>
                        </div>

                        {/* Equipment Details */}
                        {task.equipment && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                    Equipment
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Equipment Name</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">{task.equipment.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Equipment Number</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">{task.equipment.equipment_number}</p>
                                    </div>
                                    {task.equipment.manufacturer && (
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">Manufacturer</p>
                                            <p className="text-sm sm:text-base font-medium text-gray-900">{task.equipment.manufacturer}</p>
                                        </div>
                                    )}
                                    {task.equipment.model && (
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">Model</p>
                                            <p className="text-sm sm:text-base font-medium text-gray-900">{task.equipment.model}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Comment</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this comment? This will permanently remove the comment from the task.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setCommentToDelete(null);
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteComment}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TechnicianLayout>
    );
}
