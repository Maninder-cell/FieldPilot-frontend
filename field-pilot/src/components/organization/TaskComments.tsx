'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2, X, ChevronDown, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTaskComments, createComment, updateComment, deleteComment } from '@/lib/tasks-api';
import { TaskComment } from '@/types/tasks';
import { useAuth } from '@/contexts/AuthContext';

interface TaskCommentsProps {
    taskId: string;
    currentCount?: number;
    onCommentChange?: (delta: number) => void;
}

export default function TaskComments({ taskId, currentCount, onCommentChange }: TaskCommentsProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

    useEffect(() => {
        loadComments();
    }, [taskId]);

    const loadComments = async () => {
        try {
            setIsLoading(true);
            const response = await getTaskComments(taskId);
            const commentsData = response.data || [];
            const actualCount = response.count || commentsData.length;

            setComments(commentsData);
            setTotalCount(actualCount);

            // Sync the initial count with parent using the total count from API
            // The API returns paginated results, so we need to use the count field
            if (onCommentChange && currentCount !== undefined) {
                const difference = actualCount - currentCount;
                if (difference !== 0) {
                    onCommentChange(difference);
                }
            }
        } catch (error: any) {
            console.error('Failed to load comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await createComment(taskId, newComment.trim());
            setComments([...comments, response.data]);
            setTotalCount(totalCount + 1);
            setNewComment('');
            toast.success('Comment added successfully');
            // Refresh task data to update activity count
            if (onCommentChange) {
                onCommentChange(1); // +1 for adding a comment
            }
        } catch (error: any) {
            console.error('Failed to add comment:', error);
            toast.error(error.message || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (commentId: string) => {
        if (!editText.trim()) return;

        try {
            const response = await updateComment(commentId, editText.trim());
            setComments(comments.map(c => c.id === commentId ? response.data : c));
            setEditingId(null);
            setEditText('');
            toast.success('Comment updated successfully');
        } catch (error: any) {
            console.error('Failed to update comment:', error);
            toast.error(error.message || 'Failed to update comment');
        }
    };

    const handleDelete = async (commentId: string) => {
        setDeleteCommentId(commentId);
    };

    const confirmDelete = async () => {
        if (!deleteCommentId) return;

        try {
            await deleteComment(deleteCommentId);
            setComments(comments.filter(c => c.id !== deleteCommentId));
            setTotalCount(totalCount - 1);
            toast.success('Comment deleted successfully');
            // Refresh task data to update activity count
            if (onCommentChange) {
                onCommentChange(-1); // -1 for deleting a comment
            }
        } catch (error: any) {
            console.error('Failed to delete comment:', error);
            toast.error(error.message || 'Failed to delete comment');
        } finally {
            setDeleteCommentId(null);
        }
    };

    const startEdit = (comment: TaskComment) => {
        setEditingId(comment.id);
        setEditText(comment.comment);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-emerald-500',
            'bg-emerald-600',
            'bg-blue-500',
            'bg-blue-600',
            'bg-purple-500',
            'bg-gray-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const renderComment = (comment: TaskComment) => (
        <div
            key={comment.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-md ${comment.is_system_generated
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60'
                : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`relative flex-shrink-0 w-11 h-11 rounded-full ${comment.is_system_generated
                        ? 'bg-blue-600'
                        : getAvatarColor(comment.author_name)
                        } flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-4 ring-white`}>
                        {comment.is_system_generated ? (
                            <MessageSquare className="h-5 w-5" />
                        ) : (
                            getInitials(comment.author_name)
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                    {comment.author_name}
                                </h4>
                                {comment.is_system_generated && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                        System
                                    </span>
                                )}
                                <span className="text-xs text-gray-500">
                                    {formatDate(comment.created_at)}
                                    {comment.updated_at !== comment.created_at && (
                                        <span className="ml-1 text-gray-400">(edited)</span>
                                    )}
                                </span>
                            </div>

                            {/* Actions */}
                            {!comment.is_system_generated && comment.author?.id === user?.id && (
                                <div className="flex items-center gap-1">
                                    {editingId === comment.id ? (
                                        <button
                                            onClick={cancelEdit}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Cancel"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(comment)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Comment Text */}
                        {editingId === comment.id ? (
                            <div className="mt-3 space-y-3">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm bg-white shadow-sm"
                                    placeholder="Edit your comment..."
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={cancelEdit}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleEdit(comment.id)}
                                        disabled={!editText.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">
                                {comment.comment}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-emerald-600 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span>Comments</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {totalCount}
                            </span>
                        </h2>
                        {totalCount > 1 && (
                            <button
                                onClick={() => setShowAllModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                            >
                                <ChevronDown className="h-4 w-4" />
                                View All
                            </button>
                        )}
                    </div>

                    {/* Add Comment Form */}
                    <form onSubmit={handleSubmit} className="mb-6">
                        <div className="space-y-3">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm shadow-sm transition-all"
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <Send className="h-4 w-4" />
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Latest Comment or Empty State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                                <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                            </div>
                        </div>
                    ) : latestComment ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Comment</p>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>
                            {renderComment(latestComment)}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                                <MessageSquare className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium mb-1">No comments yet</p>
                            <p className="text-gray-400 text-sm">Be the first to share your thoughts</p>
                        </div>
                    )}
                </div>
            </div>

            {/* All Comments Modal */}
            {showAllModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowAllModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
                            {/* Header with Gradient */}
                            <div className="relative px-6 py-6 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-600 rounded-xl">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">All Comments</h2>
                                            <p className="text-sm text-gray-600 mt-0.5">{totalCount} {totalCount === 1 ? 'comment' : 'comments'} total</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAllModal(false)}
                                        className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                                <div className="space-y-4">
                                    {comments.map((comment) => renderComment(comment))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-white">
                                <button
                                    onClick={() => setShowAllModal(false)}
                                    className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteCommentId && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setDeleteCommentId(null)}
                    />

                    {/* Modal Content */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-200 bg-red-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-red-600 rounded-xl">
                                        <Trash2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Delete Comment</h2>
                                        <p className="text-sm text-gray-600 mt-0.5">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6">
                                <p className="text-gray-700">
                                    Are you sure you want to delete this comment? This will permanently remove the comment from the task.
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => setDeleteCommentId(null)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    Delete Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
