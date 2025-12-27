/**
 * Reports API functions
 * 
 * Provides functions to interact with the Reports module backend API.
 * Supports 17 report types across 5 categories with JSON, PDF, and Excel export.
 */

import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

// Local fetchAPI function with authentication
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

// Types for Reports
export interface ReportType {
    report_type: string;
    report_name: string;
    description: string;
    generator_class: string;
}

export interface ReportTypeDetail extends ReportType {
    cache_ttl: number;
    available_filters: string[];
}

export interface ReportFilters {
    start_date?: string;
    end_date?: string;
    status?: string | string[];
    priority?: string | string[];
    equipment?: string;
    technician?: string;
    customer?: string;
    team?: string;
    limit?: number;
    offset?: number;
    hourly_rate?: number;
    overtime_multiplier?: number;
    [key: string]: any;
}

export interface ReportGeneratedBy {
    id: string;
    name: string;
    email: string;
}

export interface ReportData {
    report_type: string;
    report_name: string;
    generated_at: string;
    generated_by: ReportGeneratedBy;
    filters: ReportFilters;
    data: Record<string, any>;
}

export interface ReportSchedule {
    id: string;
    name: string;
    report_type: string;
    filters: ReportFilters;
    format: 'json' | 'pdf' | 'excel';
    format_display: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    frequency_display: string;
    day_of_week?: number;
    day_of_month?: number;
    time_of_day: string;
    recipients: string[];
    is_active: boolean;
    last_run: string | null;
    next_run: string | null;
    created_at: string;
    created_by: string;
    created_by_name: string;
    updated_at: string;
}

export interface CreateReportScheduleRequest {
    name: string;
    report_type: string;
    filters?: ReportFilters;
    format: 'json' | 'pdf' | 'excel';
    frequency: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number;
    day_of_month?: number;
    time_of_day: string;
    recipients: string[];
    is_active?: boolean;
}

export interface UpdateReportScheduleRequest {
    name?: string;
    filters?: ReportFilters;
    format?: 'json' | 'pdf' | 'excel';
    frequency?: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number;
    day_of_month?: number;
    time_of_day?: string;
    recipients?: string[];
    is_active?: boolean;
}

export interface ReportAuditLog {
    id: string;
    user: string;
    user_name: string;
    report_type: string;
    report_name: string;
    filters: ReportFilters;
    format: string;
    generated_at: string;
    execution_time: number;
    status: 'pending' | 'success' | 'failed';
    error_message?: string;
    file_path?: string;
    file_size?: number;
}

export interface GenerateReportRequest {
    report_type: string;
    filters?: ReportFilters;
    format?: 'json' | 'pdf' | 'excel';
    use_cache?: boolean;
}

export interface GenerateReportResponse {
    report_id?: string;
    message?: string;
    export_url?: string;
    // For JSON format, this contains the full report data
    report_type?: string;
    report_name?: string;
    generated_at?: string;
    generated_by?: ReportGeneratedBy;
    filters?: ReportFilters;
    data?: Record<string, any>;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Report Categories for UI organization
export const REPORT_CATEGORIES = {
    task: {
        name: 'Task Reports',
        description: 'Reports related to task management, completion rates, and overdue tracking',
        icon: 'ClipboardList',
        reports: [
            { type: 'task_summary', name: 'Task Summary', description: 'Total tasks, completion rates, overdue tasks, breakdown by status and priority' },
            { type: 'task_detail', name: 'Task Detail', description: 'Detailed task information with equipment and assignments' },
            { type: 'overdue_tasks', name: 'Overdue Tasks', description: 'Tasks past scheduled end date with days overdue calculation' },
        ],
    },
    equipment: {
        name: 'Equipment Reports',
        description: 'Reports for equipment tracking, maintenance history, and utilization',
        icon: 'Wrench',
        reports: [
            { type: 'equipment_summary', name: 'Equipment Summary', description: 'Total equipment counts by type, status, condition' },
            { type: 'equipment_detail', name: 'Equipment Detail', description: 'Complete equipment information with building associations' },
            { type: 'equipment_maintenance_history', name: 'Maintenance History', description: 'Maintenance task history per equipment' },
            { type: 'equipment_utilization', name: 'Equipment Utilization', description: 'Task counts per equipment, most and least utilized' },
        ],
    },
    technician: {
        name: 'Technician Reports',
        description: 'Reports for technician performance, productivity, and work hours',
        icon: 'Users',
        reports: [
            { type: 'technician_worksheet', name: 'Technician Worksheet', description: 'Time logs with travel, arrival, departure times' },
            { type: 'technician_performance', name: 'Technician Performance', description: 'Completed tasks, work hours, average completion time' },
            { type: 'technician_productivity', name: 'Technician Productivity', description: 'Tasks per day, hours per task, efficiency metrics' },
            { type: 'team_performance', name: 'Team Performance', description: 'Aggregated team metrics and individual contributions' },
            { type: 'overtime_report', name: 'Overtime Report', description: 'Overtime hours by technician with optional cost calculations' },
        ],
    },
    service_request: {
        name: 'Service Request Reports',
        description: 'Reports for service request tracking and response times',
        icon: 'Headphones',
        reports: [
            { type: 'service_request_summary', name: 'Service Request Summary', description: 'Request counts by status, priority, type' },
            { type: 'service_request_detail', name: 'Service Request Detail', description: 'Complete request information with customer details' },
        ],
    },
    financial: {
        name: 'Financial Reports',
        description: 'Reports for labor costs, materials usage, and customer billing',
        icon: 'DollarSign',
        reports: [
            { type: 'labor_cost', name: 'Labor Cost', description: 'Labor costs by technician, task, customer' },
            { type: 'materials_usage', name: 'Materials Usage', description: 'Materials needed vs received breakdown' },
            { type: 'customer_billing', name: 'Customer Billing', description: 'Billable work aggregated by customer' },
        ],
    },
};

// API Functions

/**
 * Get list of all available report types
 */
export async function getReportTypes(): Promise<ApiResponse<ReportType[]>> {
    return fetchAPI<ApiResponse<ReportType[]>>('/reports/types/');
}

/**
 * Get detailed information about a specific report type
 */
export async function getReportTypeDetail(reportType: string): Promise<ApiResponse<ReportTypeDetail>> {
    return fetchAPI<ApiResponse<ReportTypeDetail>>(`/reports/types/${reportType}/`);
}

/**
 * Generate a report
 */
export async function generateReport(request: GenerateReportRequest): Promise<ApiResponse<GenerateReportResponse>> {
    return fetchAPI<ApiResponse<GenerateReportResponse>>('/reports/generate/', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

/**
 * Get report details (for previously generated reports)
 */
export async function getReportDetail(reportId: string): Promise<ApiResponse<ReportData>> {
    return fetchAPI<ApiResponse<ReportData>>(`/reports/${reportId}/`);
}

/**
 * Export report as PDF - returns the URL for download
 */
export function getReportPdfUrl(reportId: string): string {
    const apiUrl = getApiUrl(true);
    return `${apiUrl}/reports/${reportId}/export/pdf/`;
}

/**
 * Export report as Excel - returns the URL for download
 */
export function getReportExcelUrl(reportId: string): string {
    const apiUrl = getApiUrl(true);
    return `${apiUrl}/reports/${reportId}/export/excel/`;
}

/**
 * List report schedules
 */
export async function getReportSchedules(params?: {
    is_active?: boolean;
    report_type?: string;
    page?: number;
}): Promise<PaginatedResponse<ReportSchedule> | ApiResponse<ReportSchedule[]>> {
    const queryParams = new URLSearchParams();
    if (params?.is_active !== undefined) {
        queryParams.append('is_active', String(params.is_active));
    }
    if (params?.report_type) {
        queryParams.append('report_type', params.report_type);
    }
    if (params?.page) {
        queryParams.append('page', String(params.page));
    }

    const queryString = queryParams.toString();
    return fetchAPI(`/reports/schedules/${queryString ? `?${queryString}` : ''}`);
}

/**
 * Create a new report schedule
 */
export async function createReportSchedule(
    request: CreateReportScheduleRequest
): Promise<ApiResponse<ReportSchedule>> {
    return fetchAPI<ApiResponse<ReportSchedule>>('/reports/schedules/', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

/**
 * Get a specific report schedule
 */
export async function getReportSchedule(scheduleId: string): Promise<ApiResponse<ReportSchedule>> {
    return fetchAPI<ApiResponse<ReportSchedule>>(`/reports/schedules/${scheduleId}/`);
}

/**
 * Update a report schedule
 */
export async function updateReportSchedule(
    scheduleId: string,
    request: UpdateReportScheduleRequest
): Promise<ApiResponse<ReportSchedule>> {
    return fetchAPI<ApiResponse<ReportSchedule>>(`/reports/schedules/${scheduleId}/`, {
        method: 'PUT',
        body: JSON.stringify(request),
    });
}

/**
 * Delete a report schedule
 */
export async function deleteReportSchedule(scheduleId: string): Promise<ApiResponse<void>> {
    return fetchAPI<ApiResponse<void>>(`/reports/schedules/${scheduleId}/`, {
        method: 'DELETE',
    });
}

/**
 * Get report audit logs
 */
export async function getReportAuditLogs(params?: {
    report_type?: string;
    status?: 'pending' | 'success' | 'failed';
    user?: string;
    page?: number;
    page_size?: number;
}): Promise<PaginatedResponse<ReportAuditLog>> {
    const queryParams = new URLSearchParams();
    if (params?.report_type) {
        queryParams.append('report_type', params.report_type);
    }
    if (params?.status) {
        queryParams.append('status', params.status);
    }
    if (params?.user) {
        queryParams.append('user', params.user);
    }
    if (params?.page) {
        queryParams.append('page', String(params.page));
    }
    if (params?.page_size) {
        queryParams.append('page_size', String(params.page_size));
    }

    const queryString = queryParams.toString();
    return fetchAPI<PaginatedResponse<ReportAuditLog>>(
        `/reports/audit/${queryString ? `?${queryString}` : ''}`
    );
}
