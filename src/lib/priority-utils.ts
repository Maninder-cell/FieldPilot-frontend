/**
 * Priority Utilities
 * Handles priority display and styling for both Service Requests and Tasks
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export interface PriorityConfig {
    color: string;
    bg: string;
    label: string;
}

/**
 * Get priority configuration for display
 * Handles both Service Request priorities (urgent) and Task priorities (critical)
 */
export function getPriorityConfig(priority: string | undefined | null): PriorityConfig {
    if (!priority) {
        return { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Unknown' };
    }

    switch (priority.toLowerCase()) {
        case 'urgent':
            return { color: 'text-red-700', bg: 'bg-red-100', label: 'Urgent' };
        case 'critical':
            return { color: 'text-red-700', bg: 'bg-red-100', label: 'Critical' };
        case 'high':
            return { color: 'text-orange-700', bg: 'bg-orange-100', label: 'High' };
        case 'medium':
            return { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Medium' };
        case 'low':
            return { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Low' };
        default:
            return { color: 'text-gray-700', bg: 'bg-gray-100', label: priority };
    }
}

/**
 * Get priority badge classes for inline display
 */
export function getPriorityBadgeClasses(priority: string | undefined | null): string {
    if (!priority) {
        return 'bg-gray-100 text-gray-700';
    }

    switch (priority.toLowerCase()) {
        case 'urgent':
        case 'critical':
            return 'bg-red-100 text-red-700';
        case 'high':
            return 'bg-orange-100 text-orange-700';
        case 'medium':
            return 'bg-blue-100 text-blue-700';
        case 'low':
            return 'bg-gray-100 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

/**
 * Get priority sort order (for sorting lists)
 */
export function getPrioritySortOrder(priority: string | undefined | null): number {
    if (!priority) return 999;

    switch (priority.toLowerCase()) {
        case 'urgent':
        case 'critical':
            return 1;
        case 'high':
            return 2;
        case 'medium':
            return 3;
        case 'low':
            return 4;
        default:
            return 999;
    }
}
