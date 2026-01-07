'use client';

import { useState } from 'react';
import { CircleDot, CheckCircle2, RotateCcw, Clock, XCircle } from 'lucide-react';
import { updateTaskStatus } from '@/lib/tasks-api';
import { toast } from 'react-hot-toast';

interface AdminStatusSelectorProps {
    taskId: string;
    currentStatus: 'new' | 'closed' | 'reopened' | 'pending' | 'rejected';
    onStatusChange?: () => void;
    disabled?: boolean;
}

export default function AdminStatusSelector({
    taskId,
    currentStatus,
    onStatusChange,
    disabled = false
}: AdminStatusSelectorProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const statuses = [
        {
            value: 'new' as const,
            label: 'New',
            icon: CircleDot,
            selectedBg: 'bg-emerald-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-emerald-300 hover:bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            value: 'pending' as const,
            label: 'Pending',
            icon: Clock,
            selectedBg: 'bg-yellow-500',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-yellow-300 hover:bg-yellow-50',
            iconColor: 'text-yellow-600'
        },
        {
            value: 'closed' as const,
            label: 'Closed',
            icon: CheckCircle2,
            selectedBg: 'bg-gray-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-gray-400 hover:bg-gray-50',
            iconColor: 'text-gray-600'
        },
        {
            value: 'reopened' as const,
            label: 'Re-Opened',
            icon: RotateCcw,
            selectedBg: 'bg-blue-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-blue-300 hover:bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            value: 'rejected' as const,
            label: 'Rejected',
            icon: XCircle,
            selectedBg: 'bg-red-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-red-300 hover:bg-red-50',
            iconColor: 'text-red-600'
        }
    ];

    const handleStatusChange = async (newStatus: 'new' | 'closed' | 'reopened' | 'pending' | 'rejected') => {
        if (disabled || isUpdating || newStatus === selectedStatus) return;

        try {
            setIsUpdating(true);
            await updateTaskStatus(taskId, newStatus);
            setSelectedStatus(newStatus);
            toast.success(`Task status updated to ${statuses.find(s => s.value === newStatus)?.label}`);
            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Failed to update task status:', error);
            toast.error(error.message || 'Failed to update task status');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Task Status</h3>
            <div className="grid grid-cols-2 gap-2.5">
                {statuses.slice(0, 4).map((status) => {
                    const Icon = status.icon;
                    const isSelected = selectedStatus === status.value;

                    return (
                        <button
                            key={status.value}
                            onClick={() => handleStatusChange(status.value)}
                            disabled={disabled || isUpdating}
                            className={`
                                relative flex flex-col items-center justify-center px-3 py-3 rounded-lg border-2 transition-all duration-200
                                ${isSelected
                                    ? `${status.selectedBg} ${status.selectedText} border-transparent shadow-md`
                                    : `bg-white ${status.unselectedBorder} ${status.unselectedText} ${status.unselectedHover}`
                                }
                                ${disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                                group
                            `}
                        >
                            <Icon
                                className={`h-4 w-4 mb-1.5 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : status.iconColor
                                    }`}
                            />
                            <span className={`text-xs font-medium leading-tight text-center ${isSelected ? 'text-white' : status.unselectedText}`}>
                                {status.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            {/* Rejected button - full width */}
            <button
                onClick={() => handleStatusChange('rejected')}
                disabled={disabled || isUpdating}
                className={`
                    mt-2.5 w-full relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all duration-200
                    ${selectedStatus === 'rejected'
                        ? 'bg-red-600 text-white border-transparent shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'
                    }
                    ${disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                    group
                `}
            >
                <XCircle
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${selectedStatus === 'rejected' ? 'text-white' : 'text-red-600'
                        }`}
                />
                <span className={`text-xs font-medium ${selectedStatus === 'rejected' ? 'text-white' : 'text-gray-700'}`}>
                    Rejected
                </span>
            </button>
            {isUpdating && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                </div>
            )}
        </div>
    );
}
