'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTaskComments, updateComment, deleteComment } from '@/lib/tasks-api';
import { TaskComment } from '@/types/tasks';
import { useAuth } from '@/contexts/AuthContext';

interface TaskCommentsHistoryProps {
    taskId: string;
    onCommentDeleted?: () => void;
    onCommentUpdated?: () => void;
}

export default function TaskCommentsHistory({ taskId, onCommentDeleted, onCommentUpdated }: TaskCommentsHistoryProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        loadComments(1);
    }, [taskId]);

    const loadComments = async (page: number) => {
        try {
            if (page === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            
            const response = await getTaskComments(taskId, page);
            const commentsData = response.data || [];
            const actualCount = response.count || commentsData.length;

            if (page === 1) {
                setComments(commentsData);
            } else {
                // Append new comments to existing ones
                setComments(prev => [...prev, ...commentsData]);
            }
            
            setTotalCount(actualCount);
            setCurrentPage(page);
            setHasMore(!!response.next); // Check if there's a next page
        } catch (error: any) {
            console.error('Failed to load comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMoreComments = () => {
        if (!isLoadingMore && hasMore) {
            loadComments(currentPage + 1);
        }
    };

    const showLessComments = () => {
        // Reset to first page (3 comments)
        setComments(comments.slice(0, 3));
        setCurrentPage(1);
        setHasMore(totalCount > 3);
    };

    const handleEdit = async (commentId: string) => {
        if (!editText.trim()) return;

        try {
            const response = await updateComment(commentId, editText.trim());
            setComments(comments.map(c => c.id === commentId ? response.data : c));
            setEditingId(null);
            setEditText('');
            toast.success('Comment updated successfully');
            if (onCommentUpdated) onCommentUpdated();
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
            if (onCommentDeleted) onCommentDeleted();
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
            className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${comment.is_system_generated
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60'
                : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
        >
            <div className="p-3">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`relative flex-shrink-0 w-9 h-9 rounded-full ${comment.is_system_generated
                        ? 'bg-blue-600'
                        : getAvatarColor(comment.author_name)
                        } flex items-center justify-center text-white font-semibold text-xs`}>
                        {comment.is_system_generated ? (
                            <MessageSquare className="h-4 w-4" />
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
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
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
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Cancel"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(comment)}
                                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Comment Text */}
                        {editingId === comment.id ? (
                            <div className="mt-2 space-y-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm bg-white"
                                    placeholder="Edit your comment..."
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={cancelEdit}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleEdit(comment.id)}
                                        disabled={!editText.trim()}
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {comment.comment}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-600 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <span>Comments History</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {totalCount}
                            </span>
                        </h2>
                    </div>

                    {/* Comments List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200"></div>
                                <div className="absolute top-0 left-0 animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
                            </div>
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-3">
                            {/* Comments Container with scrollable area */}
                            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                                {comments.map((comment) => renderComment(comment))}
                            </div>

                            {/* Load More button */}
                            {hasMore && (
                                <div className="flex items-center justify-center pt-2">
                                    <button
                                        onClick={loadMoreComments}
                                        disabled={isLoadingMore}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3.5 w-3.5" />
                                                Load 3 More ({comments.length} of {totalCount})
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Show "All loaded" message and Show Less button when all comments are loaded */}
                            {!hasMore && comments.length > 3 && (
                                <div className="flex flex-col items-center gap-2 pt-2">
                                    <p className="text-xs text-gray-500">
                                        All {totalCount} comments loaded
                                    </p>
                                    <button
                                        onClick={showLessComments}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                    >
                                        <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                                        Show Less
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-3">
                                <MessageSquare className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium text-sm mb-1">No comments yet</p>
                            <p className="text-gray-400 text-xs">Be the first to share your thoughts</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteCommentId && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setDeleteCommentId(null)}
                    />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
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
                            <div className="px-6 py-6">
                                <p className="text-gray-700">
                                    Are you sure you want to delete this comment? This will permanently remove the comment from the task.
                                </p>
                            </div>
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
