'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Edit2, Trash2, Loader2, ChevronDown, Paperclip } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTaskComments, createComment, updateComment, deleteComment } from '@/lib/tasks-api';
import { TaskComment } from '@/types/tasks';
import { useAuth } from '@/contexts/AuthContext';

interface TaskCommentsModalProps {
    taskId: string;
    isOpen: boolean;
    onClose: () => void;
    currentCount?: number;
    onCommentCountChange?: (newCount: number) => void;
}

export default function TaskCommentsModal({
    taskId,
    isOpen,
    onClose,
    currentCount,
    onCommentCountChange
}: TaskCommentsModalProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [totalCount, setTotalCount] = useState(currentCount || 0);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadComments(1);
        }
    }, [isOpen, taskId]);

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
                setComments(prev => [...prev, ...commentsData]);
            }

            setTotalCount(actualCount);
            setCurrentPage(page);
            setHasMore(!!response.next);

            // Update parent's count
            if (onCommentCountChange) {
                onCommentCountChange(actualCount);
            }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const commentText = newComment.trim();
        const tempId = `temp-${Date.now()}`;

        // Create optimistic comment object
        const optimisticComment: any = {
            id: tempId,
            task: taskId,
            task_number: '',
            author: user,
            author_name: user?.full_name || 'You',
            author_role: user?.role || '',
            comment: commentText,
            is_system_generated: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            setIsSubmitting(true);

            // Immediately add to UI (optimistic update)
            setComments(prev => [optimisticComment, ...prev]);
            setTotalCount(prev => prev + 1);
            setNewComment('');

            // Update parent count immediately
            if (onCommentCountChange) {
                onCommentCountChange(totalCount + 1);
            }

            // Create comment on server
            const response = await createComment(taskId, commentText);

            // Replace temp comment with real one from server
            setComments(prev => prev.map(c =>
                c.id === tempId ? response.data : c
            ));

            toast.success('Comment added successfully');
        } catch (error: any) {
            console.error('Failed to add comment:', error);
            toast.error(error.message || 'Failed to add comment');

            // Remove optimistic comment on error
            setComments(prev => prev.filter(c => c.id !== tempId));
            setTotalCount(prev => prev - 1);

            // Revert parent count
            if (onCommentCountChange) {
                onCommentCountChange(totalCount);
            }

            // Restore the comment text
            setNewComment(commentText);
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
            // No need to update count - edit doesn't change count
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
            const newCount = totalCount - 1;
            setTotalCount(newCount);
            toast.success('Comment deleted successfully');
            // Update parent's count
            if (onCommentCountChange) {
                onCommentCountChange(newCount);
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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
            'bg-teal-500',
            'bg-teal-600',
            'bg-green-500',
            'bg-green-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Panel - Slide from right */}
                <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <div className="w-screen max-w-md">
                        <div className="flex h-full flex-col bg-white shadow-xl">
                            {/* Header */}
                            <div className="border-b border-gray-200 bg-white px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
                                    <div className="w-5" /> {/* Spacer for alignment */}
                                </div>
                            </div>

                            {/* Add Comment Form - At Top */}
                            <div className="border-b border-gray-200 bg-white px-6 py-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-3">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm"
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !newComment.trim()}
                                                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                    </div>
                                ) : comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="group">
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar */}
                                                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${comment.is_system_generated
                                                        ? 'bg-emerald-600'
                                                        : getAvatarColor(comment.author_name)
                                                        } flex items-center justify-center text-white font-semibold text-sm`}>
                                                        {comment.is_system_generated ? (
                                                            <MessageSquare className="h-5 w-5" />
                                                        ) : (
                                                            getInitials(comment.author_name)
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                                {comment.author_name}
                                                            </h4>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(comment.created_at)}
                                                            </span>
                                                            {comment.updated_at !== comment.created_at && (
                                                                <span className="text-xs text-gray-400">(edited)</span>
                                                            )}
                                                        </div>

                                                        {/* Comment Text */}
                                                        {editingId === comment.id ? (
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    value={editText}
                                                                    onChange={(e) => setEditText(e.target.value)}
                                                                    rows={2}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm"
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEdit(comment.id)}
                                                                        disabled={!editText.trim()}
                                                                        className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                                {comment.comment}
                                                            </p>
                                                        )}

                                                        {/* Actions */}
                                                        {!comment.is_system_generated && comment.author?.id === user?.id && editingId !== comment.id && (
                                                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => startEdit(comment)}
                                                                    className="text-xs text-gray-600 hover:text-emerald-600 transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(comment.id)}
                                                                    className="text-xs text-gray-600 hover:text-red-600 transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Load More */}
                                        {hasMore && (
                                            <div className="flex justify-center pt-2">
                                                <button
                                                    onClick={loadMoreComments}
                                                    disabled={isLoadingMore}
                                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
                                                >
                                                    {isLoadingMore ? 'Loading...' : 'Load more comments'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No comments yet</p>
                                        <p className="text-gray-400 text-xs mt-1">Be the first to comment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteCommentId && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setDeleteCommentId(null)}
                    />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Comment</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Are you sure you want to delete this comment? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteCommentId(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
