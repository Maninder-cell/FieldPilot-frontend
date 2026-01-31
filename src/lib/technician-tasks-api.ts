/**
 * Tasks API for Technician Portal
 * 
 * Handles all task-related API calls for technicians
 */

import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

export interface Task {
    id: string;
    task_number: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'new' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'reopened';
    work_status: 'open' | 'in_progress' | 'on_hold' | 'completed';
    equipment?: {
        id: string;
        name: string;
        equipment_number: string;
        manufacturer?: string;
        model?: string;
        serial_number?: string;
    };
    equipment_name?: string;  // For list view
    equipment_number?: string;  // For list view
    assignees?: Array<{
        id: string;
        name: string;
        email: string;
    }>;
    teams?: Array<{
        id: string;
        name: string;
    }>;
    scheduled_start?: string;
    scheduled_end?: string;
    actual_start?: string;
    actual_end?: string;
    is_scheduled: boolean;
    materials_needed: string[];
    notes: string;
    custom_fields: Record<string, any>;
    created_by?: {
        id: string;
        email: string;
        full_name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface TimeLog {
    id: string;
    task: string;
    technician: string;
    travel_started_at?: string;
    arrived_at?: string;
    departed_at?: string;
    lunch_started_at?: string;
    lunch_ended_at?: string;
    travel_time?: number;
    normal_hours?: number;
    overtime_hours?: number;
    total_work_hours?: number;
    lunch_duration?: number;
    equipment_status_at_departure?: 'functional' | 'shutdown';
    // Helper properties from backend
    is_on_site?: boolean;
    is_traveling?: boolean;
    is_on_lunch?: boolean;
    can_start_lunch?: boolean;
    can_end_lunch?: boolean;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

export interface WorkHoursSummary {
    technician: {
        id: string;
        name: string;
        email: string;
    };
    summary: {
        total_hours: number;
        normal_hours: number;
        overtime_hours: number;
        task_count: number;
    };
    time_logs: TimeLog[];
}

export interface TaskComment {
    id: string;
    task: string;
    author: {
        id: string;
        full_name: string;
        email: string;
    };
    comment: string;
    is_system_generated: boolean;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    meta?: {
        timestamp: string;
    };
}

async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAccessToken();
    const apiUrl = getApiUrl(true); // Use tenant-aware URL

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An error occurred',
        }));

        let errorMessage = error.message || error.error?.message || `HTTP error! status: ${response.status}`;

        if (error.details || error.error?.details) {
            const details = error.details || error.error?.details;
            if (typeof details === 'object') {
                const errorMessages = Object.entries(details)
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                    .join('; ');
                errorMessage = errorMessages || errorMessage;
            }
        }

        throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
}

/**
 * Get tasks assigned to the current technician
 */
export async function getTasks(params?: {
    status?: string;
    priority?: string;
    search?: string;
    work_status?: string;
}): Promise<ApiResponse<{ results: Task[] }>> {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.work_status) queryParams.append('work_status', params.work_status);

    const url = `/tasks/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return fetchAPI<ApiResponse<{ results: Task[] }>>(url, {
        method: 'GET',
    });
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: string): Promise<ApiResponse<Task>> {
    return fetchAPI<ApiResponse<Task>>(`/tasks/${taskId}/`, {
        method: 'GET',
    });
}

/**
 * Get task history
 */
export async function getTaskHistory(taskId: string): Promise<ApiResponse<any[]>> {
    return fetchAPI<ApiResponse<any[]>>(`/tasks/${taskId}/history/`, {
        method: 'GET',
    });
}

/**
 * Update task work status (technician can update)
 */
export async function updateWorkStatus(
    taskId: string,
    workStatus: 'open' | 'in_progress' | 'on_hold' | 'completed'
): Promise<ApiResponse<Task>> {
    return fetchAPI<ApiResponse<Task>>(`/tasks/${taskId}/work-status/`, {
        method: 'PATCH',
        body: JSON.stringify({ work_status: workStatus }),
    });
}

/**
 * Get task comments
 */
export async function getTaskComments(taskId: string, page?: number): Promise<ApiResponse<TaskComment[]>> {
    const queryParams = page ? `?page=${page}` : '';
    return fetchAPI<ApiResponse<TaskComment[]>>(`/tasks/${taskId}/comments/${queryParams}`, {
        method: 'GET',
    });
}

/**
 * Add task comment
 */
export async function addTaskComment(
    taskId: string,
    comment: string
): Promise<ApiResponse<TaskComment>> {
    return fetchAPI<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
    });
}

/**
 * Update task comment
 */
export async function updateTaskComment(
    taskId: string,
    commentId: string,
    comment: string
): Promise<ApiResponse<TaskComment>> {
    return fetchAPI<ApiResponse<TaskComment>>(`/tasks/comments/${commentId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ comment }),
    });
}

/**
 * Delete task comment
 */
export async function deleteTaskComment(
    taskId: string,
    commentId: string
): Promise<ApiResponse<void>> {
    return fetchAPI<ApiResponse<void>>(`/tasks/comments/${commentId}/`, {
        method: 'DELETE',
    });
}

// Time Tracking APIs

/**
 * Start travel for a task
 */
export async function startTravel(taskId: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/travel/`, {
        method: 'POST',
    });
}

/**
 * Log arrival at task site
 */
export async function logArrival(taskId: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/arrive/`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
}

/**
 * Log departure from task site
 */
export async function logDeparture(
    taskId: string,
    equipmentStatus: 'functional' | 'shutdown'
): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/depart/`, {
        method: 'POST',
        body: JSON.stringify({ equipment_status: equipmentStatus }),
    });
}

/**
 * Start lunch break
 */
export async function startLunch(taskId: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/lunch-start/`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
}

/**
 * End lunch break
 */
export async function endLunch(taskId: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/lunch-end/`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
}

/**
 * Get time logs for a task
 */
export async function getTimeLogs(taskId: string): Promise<ApiResponse<TimeLog[]>> {
    return fetchAPI<ApiResponse<TimeLog[]>>(`/tasks/${taskId}/time-logs/`);
}

/**
 * Get work hours report
 */
export async function getWorkHoursReport(startDate: string, endDate: string): Promise<ApiResponse<WorkHoursSummary>> {
    const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
    });

    return fetchAPI<ApiResponse<WorkHoursSummary>>(`/tasks/reports/work-hours/?${queryParams.toString()}`, {
        method: 'GET',
    });
}

// Equipment APIs (if needed for technicians)

export interface Equipment {
    id: string;
    equipment_number: string;
    name: string;
    equipment_type: string;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
    installation_date?: string;
    warranty_expiry?: string;
    operational_status: 'operational' | 'maintenance' | 'out_of_service' | 'decommissioned';
    location_details?: string;
    specifications?: Record<string, any>;
    building?: {
        id: string;
        name: string;
        facility?: {
            id: string;
            name: string;
        };
    };
    created_at: string;
    updated_at: string;
}

/**
 * Get equipment list
 */
export async function getEquipmentList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    type?: string;
}): Promise<ApiResponse<Equipment[]>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const url = `/equipment/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return fetchAPI<ApiResponse<Equipment[]>>(url, {
        method: 'GET',
    });
}

/**
 * Get equipment details
 */
export async function getEquipmentDetails(equipmentId: string): Promise<ApiResponse<Equipment>> {
    return fetchAPI<ApiResponse<Equipment>>(`/equipment/${equipmentId}/`, {
        method: 'GET',
    });
}

/**
 * Dashboard Data Types
 */
export interface DashboardStats {
    today_tasks: number;
    active_tasks: number;
    completed_today: number;
    hours_today: number;
    hours_this_week: number;
    completion_rate: number;
}

export interface CurrentTask {
    id: string;
    task_number: string;
    title: string;
    priority: string;
    started_at: string | null;
    duration_minutes: number;
    equipment: string | null;
    location: string | null;
}

export interface TodayTask {
    id: string;
    task_number: string;
    title: string;
    priority: string;
    status: string;
    work_status: string;
    due_date: string | null;
    equipment: string | null;
    location: string | null;
}

export interface WeeklyHour {
    day: string;
    date: string;
    hours: number;
    percentage: number;
    is_today: boolean;
}

export interface PriorityBreakdown {
    high: number;
    medium: number;
    low: number;
}

export interface RecentActivity {
    time: string;
    action: string;
    timestamp: string;
}

export interface DashboardData {
    stats: DashboardStats;
    current_task: CurrentTask | null;
    today_tasks: TodayTask[];
    weekly_hours: WeeklyHour[];
    priority_breakdown: PriorityBreakdown;
    recent_activity: RecentActivity[];
}

/**
 * Get technician dashboard data
 */
export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return fetchAPI<ApiResponse<DashboardData>>('/tasks/reports/dashboard/', {
        method: 'GET',
    });
}

