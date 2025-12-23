'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createComment } from '@/lib/tasks-api';

interface TaskCommentsAddProps {
    taskId: string;
    currentCount?: number;
    onCommentAdded?: () => void;
}

export default function TaskCommentsAdd({ taskId, currentCount, onCommentAdded }: TaskCommentsAddProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setIsSubmitting(true);
            await createComment(taskId, newComment.trim());
            setNewComment('');
            toast.success('Comment added successfully');
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (error: any) {
            console.error('Failed to add comment:', error);
            toast.error(error.message || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-emerald-600 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <span>Comments</span>
                        {currentCount !== undefined && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {currentCount}
                            </span>
                        )}
                    </h2>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={4}
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
            </div>
        </div>
    );
}
