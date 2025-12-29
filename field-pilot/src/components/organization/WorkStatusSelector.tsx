'use client';

import { useState } from 'react';
import { Lock, Pause, RefreshCw, Check } from 'lucide-react';
import { updateWorkStatus } from '@/lib/tasks-api';
import { toast } from 'react-hot-toast';

interface WorkStatusSelectorProps {
    taskId: string;
    currentStatus: 'open' | 'hold' | 'in_progress' | 'done';
    onStatusChange?: () => void;
    disabled?: boolean;
}

export default function WorkStatusSelector({
    taskId,
    currentStatus,
    onStatusChange,
    disabled = false
}: WorkStatusSelectorProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const statuses = [
        {
            value: 'open' as const,
            label: 'Open',
            icon: Lock,
            selectedBg: 'bg-emerald-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-emerald-300 hover:bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            value: 'hold' as const,
            label: 'On Hold',
            icon: Pause,
            selectedBg: 'bg-gray-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-gray-400 hover:bg-gray-50',
            iconColor: 'text-gray-600'
        },
        {
            value: 'in_progress' as const,
            label: 'In Progress',
            icon: RefreshCw,
            selectedBg: 'bg-emerald-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-emerald-300 hover:bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            value: 'done' as const,
            label: 'Done',
            icon: Check,
            selectedBg: 'bg-emerald-600',
            selectedText: 'text-white',
            unselectedBorder: 'border-gray-200',
            unselectedText: 'text-gray-700',
            unselectedHover: 'hover:border-emerald-300 hover:bg-emerald-50',
            iconColor: 'text-emerald-600'
        }
    ];

    const handleStatusChange = async (newStatus: 'open' | 'hold' | 'in_progress' | 'done') => {
        if (disabled || isUpdating || newStatus === selectedStatus) return;

        try {
            setIsUpdating(true);
            await updateWorkStatus(taskId, newStatus);
            setSelectedStatus(newStatus);
            toast.success(`Work status updated to ${statuses.find(s => s.value === newStatus)?.label}`);
            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Failed to update work status:', error);
            toast.error(error.message || 'Failed to update work status');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-2.5">
                {statuses.map((status) => {
                    const Icon = status.icon;
                    const isSelected = selectedStatus === status.value;

                    return (
                        <button
                            key={status.value}
                            onClick={() => handleStatusChange(status.value)}
                            disabled={disabled || isUpdating}
                            className={`
                                relative flex flex-col items-center justify-center px-3 py-4 rounded-lg border-2 transition-all duration-200
                                ${isSelected
                                    ? `${status.selectedBg} ${status.selectedText} border-transparent shadow-md`
                                    : `bg-white ${status.unselectedBorder} ${status.unselectedText} ${status.unselectedHover}`
                                }
                                ${disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                                group
                            `}
                        >
                            <Icon
                                className={`h-5 w-5 mb-2 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : status.iconColor
                                    }`}
                            />
                            <span className={`text-sm font-medium leading-tight text-center ${isSelected ? 'text-white' : status.unselectedText}`}>
                                {status.label}
                            </span>
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                            )}
                        </button>
                    );
                })}
            </div>
            {isUpdating && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                </div>
            )}
        </div>
    );
}
