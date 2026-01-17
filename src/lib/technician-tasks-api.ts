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
    };
    scheduled_start?: string;
    scheduled_end?: string;
    actual_start?: string;
    actual_end?: string;
    is_scheduled: boolean;
    materials_needed: string[];
    notes: string;
    custom_fields: Record<string, any>;
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
    lunch_duration?: number;
    equipment_status?: 'operational' | 'needs_repair' | 'replaced';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface WorkHoursSummary {
    total_hours: number;
    normal_hours: number;
    overtime_hours: number;
    travel_hours: number;
    lunch_hours: number;
    by_date: Array<{
        date: string;
        normal_hours: number;
        overtime_hours: number;
        travel_hours: number;
    }>;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    message: string;
    count: number;
    next: string | null;
    previous: string | null;
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

    return response.json();
}

/**
 * Get list of tasks assigned to the technician
 */
export async function getTasks(params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    page_size?: number;
}): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });
    }

    const endpoint = `/tasks/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchAPI<any>(endpoint);

    // Handle nested response structure from backend
    if (response.results && response.results.data) {
        return {
            success: response.results.success,
            data: response.results.data,
            message: response.results.message,
            count: response.count,
            next: response.next,
            previous: response.previous,
        };
    }

    return response;
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId: string): Promise<ApiResponse<Task>> {
    return fetchAPI<ApiResponse<Task>>(`/tasks/${taskId}/`);
}

/**
 * Update task work status
 */
export async function updateWorkStatus(taskId: string, workStatus: string): Promise<ApiResponse<Task>> {
    return fetchAPI<ApiResponse<Task>>(`/tasks/${taskId}/work-status/`, {
        method: 'PATCH',
        body: JSON.stringify({ work_status: workStatus }),
    });
}

/**
 * Get task history
 */
export async function getTaskHistory(taskId: string): Promise<ApiResponse<any[]>> {
    return fetchAPI<ApiResponse<any[]>>(`/tasks/${taskId}/history/`);
}

/**
 * Start travel to job site
 */
export async function startTravel(taskId: string, travelStartedAt?: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/travel/`, {
        method: 'POST',
        body: JSON.stringify({
            travel_started_at: travelStartedAt || new Date().toISOString(),
        }),
    });
}

/**
 * Log arrival at job site
 */
export async function logArrival(taskId: string, arrivedAt?: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/arrive/`, {
        method: 'POST',
        body: JSON.stringify({
            arrived_at: arrivedAt || new Date().toISOString(),
        }),
    });
}

/**
 * Log departure from job site
 */
export async function logDeparture(
    taskId: string,
    data: {
        departed_at?: string;
        equipment_status: 'operational' | 'needs_repair' | 'replaced';
        notes?: string;
    }
): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/depart/`, {
        method: 'POST',
        body: JSON.stringify({
            departed_at: data.departed_at || new Date().toISOString(),
            equipment_status: data.equipment_status,
            notes: data.notes,
        }),
    });
}

/**
 * Start lunch break
 */
export async function startLunch(taskId: string, lunchStartedAt?: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/lunch-start/`, {
        method: 'POST',
        body: JSON.stringify({
            lunch_started_at: lunchStartedAt || new Date().toISOString(),
        }),
    });
}

/**
 * End lunch break
 */
export async function endLunch(taskId: string, lunchEndedAt?: string): Promise<ApiResponse<TimeLog>> {
    return fetchAPI<ApiResponse<TimeLog>>(`/tasks/${taskId}/lunch-end/`, {
        method: 'POST',
        body: JSON.stringify({
            lunch_ended_at: lunchEndedAt || new Date().toISOString(),
        }),
    });
}

/**
 * Get time logs for a task
 */
export async function getTimeLogs(taskId: string): Promise<ApiResponse<TimeLog[]>> {
    return fetchAPI<ApiResponse<TimeLog[]>>(`/tasks/${taskId}/time-logs/`);
}

/**
 * Add comment to task
 */
export async function addComment(taskId: string, comment: string, isInternal: boolean = false): Promise<ApiResponse<any>> {
    return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({
            comment,
            is_internal: isInternal,
        }),
    });
}

/**
 * Upload attachment to task
 */
export async function uploadAttachment(taskId: string, file: File, description?: string): Promise<ApiResponse<any>> {
    const token = getAccessToken();
    const apiUrl = getApiUrl(true);

    const formData = new FormData();
    formData.append('file', file);
    if (description) {
        formData.append('description', description);
    }

    const response = await fetch(`${apiUrl}/tasks/${taskId}/attachments/`, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An error occurred',
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

/**
 * Log materials needed
 */
export async function logMaterialsNeeded(
    taskId: string,
    data: {
        material_name: string;
        quantity: number;
        unit: string;
        notes?: string;
    }
): Promise<ApiResponse<any>> {
    return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/materials/needed/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Log materials received
 */
export async function logMaterialsReceived(
    taskId: string,
    data: {
        material_name: string;
        quantity: number;
        unit: string;
        notes?: string;
    }
): Promise<ApiResponse<any>> {
    return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/materials/received/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
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

/**
 * Equipment interfaces and types
 */
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
