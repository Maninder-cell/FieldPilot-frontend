'use client';

import { useState, useEffect } from 'react';
import {
    History,
    User,
    Clock,
    Edit,
    UserPlus,
    MessageSquare,
    Paperclip,
    Car,
    MapPin,
    LogOut,
    Coffee,
    Package,
    AlertCircle,
    CheckCircle2,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import { getTaskHistory } from '@/lib/tasks-api';
import { TaskHistory as TaskHistoryType, TaskHistoryAction } from '@/types/tasks';

interface TaskHistoryProps {
    taskId: string;
}

export default function TaskHistory({ taskId }: TaskHistoryProps) {
    const [history, setHistory] = useState<TaskHistoryType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [taskId]);

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const response = await getTaskHistory(taskId);
            setHistory(response.data || []);
        } catch (error: any) {
            console.error('Failed to load task history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getActionIcon = (action: TaskHistoryAction) => {
        const icons: Record<TaskHistoryAction, React.ReactNode> = {
            created: <CheckCircle2 className="h-4 w-4 text-green-600" />,
            updated: <Edit className="h-4 w-4 text-blue-600" />,
            status_changed: <RefreshCw className="h-4 w-4 text-purple-600" />,
            work_status_changed: <RefreshCw className="h-4 w-4 text-indigo-600" />,
            assigned: <UserPlus className="h-4 w-4 text-emerald-600" />,
            comment_added: <MessageSquare className="h-4 w-4 text-blue-600" />,
            file_uploaded: <Paperclip className="h-4 w-4 text-orange-600" />,
            travel_started: <Car className="h-4 w-4 text-blue-600" />,
            arrived: <MapPin className="h-4 w-4 text-green-600" />,
            departed: <LogOut className="h-4 w-4 text-red-600" />,
            lunch_started: <Coffee className="h-4 w-4 text-yellow-600" />,
            lunch_ended: <Coffee className="h-4 w-4 text-green-600" />,
            material_needed: <Package className="h-4 w-4 text-orange-600" />,
            material_received: <Package className="h-4 w-4 text-green-600" />,
        };
        return icons[action] || <AlertCircle className="h-4 w-4 text-gray-600" />;
    };

    const getActionLabel = (action: TaskHistoryAction): string => {
        const labels: Record<TaskHistoryAction, string> = {
            created: 'Task created',
            updated: 'Task updated',
            status_changed: 'Status changed',
            work_status_changed: 'Work status changed',
            assigned: 'Task assigned',
            comment_added: 'Comment added',
            file_uploaded: 'File uploaded',
            travel_started: 'Travel started',
            arrived: 'Arrived at site',
            departed: 'Departed from site',
            lunch_started: 'Lunch break started',
            lunch_ended: 'Lunch break ended',
            material_needed: 'Material needed',
            material_received: 'Material received',
        };
        return labels[action] || action;
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatRelativeTime = (dateString: string) => {
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
        return formatDateTime(dateString);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <History className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Task History</h2>
                </div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-emerald-600" />
                    Task History
                </h2>
                <button
                    onClick={loadHistory}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh history"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-6">
                    <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No history yet</p>
                </div>
            ) : (
                <div className="max-h-80 overflow-y-auto">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                        <div className="space-y-4">
                            {history.map((item, index) => (
                                <div key={item.id} className="relative flex gap-4">
                                    {/* Timeline dot */}
                                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full">
                                        {getActionIcon(item.action)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pb-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getActionLabel(item.action)}
                                                </p>
                                                {item.field_name && (
                                                    <p className="text-xs text-gray-600 mt-0.5">
                                                        {item.field_name}:{' '}
                                                        {item.old_value && (
                                                            <span className="line-through text-gray-400">
                                                                {item.old_value}
                                                            </span>
                                                        )}
                                                        {item.old_value && item.new_value && ' → '}
                                                        {item.new_value && (
                                                            <span className="text-gray-900">{item.new_value}</span>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {formatRelativeTime(item.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <User className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                {item.user_name || 'System'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
