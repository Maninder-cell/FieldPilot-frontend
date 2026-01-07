/**
 * Service Requests API Client
 */

import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';
import {
    ServiceRequest,
    ServiceRequestFilters,
    CreateServiceRequestData,
    UpdateServiceRequestData,
    AcceptRequestData,
    RejectRequestData,
    ConvertToTaskData,
    SubmitFeedbackData,
    ServiceRequestComment,
    ServiceRequestAttachment,
    ServiceRequestAction,
} from '@/types/service-requests';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

class ApiError extends Error {
    constructor(public status: number, message: string, public details?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchServiceRequestAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = await getAccessToken();
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
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            error.message || error.error?.message || error.details || error.error?.details || 'An error occurred',
            error.details || error.error?.details
        );
    }

    return response.json();
}

/**
 * Get service requests (customer view)
 */
export async function getServiceRequests(
    filters: ServiceRequestFilters = {}
): Promise<PaginatedResponse<ServiceRequest>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.request_type) params.append('request_type', filters.request_type);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/service-requests/${queryString ? `?${queryString}` : ''}`;

    // Backend returns paginated response directly without ApiResponse wrapper
    const token = await getAccessToken();
    const apiUrl = getApiUrl(true);

    const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            error.message || error.error?.message || 'An error occurred',
            error.details || error.error?.details
        );
    }

    return response.json();
}

/**
 * Get all service requests (admin view)
 */
export async function getAdminServiceRequests(
    filters: ServiceRequestFilters = {}
): Promise<ApiResponse<PaginatedResponse<ServiceRequest>>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.customer) params.append('customer', filters.customer);
    if (filters.equipment) params.append('equipment', filters.equipment);

    const queryString = params.toString();
    const endpoint = `/service-requests/admin/${queryString ? `?${queryString}` : ''}`;

    const response = await fetchServiceRequestAPI<PaginatedResponse<ServiceRequest>>(endpoint);
    return response;
}

/**
 * Get service request by ID
 */
export async function getServiceRequestById(id: string): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/`);
}

/**
 * Create service request
 */
export async function createServiceRequest(
    data: CreateServiceRequestData
): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>('/service-requests/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update service request
 */
export async function updateServiceRequest(
    id: string,
    data: UpdateServiceRequestData
): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Cancel service request
 */
export async function cancelServiceRequest(id: string): Promise<ApiResponse<void>> {
    return fetchServiceRequestAPI<void>(`/service-requests/${id}/`, {
        method: 'DELETE',
    });
}

/**
 * Mark request under review (admin)
 */
export async function markUnderReview(id: string): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/review/`, {
        method: 'POST',
    });
}

/**
 * Update internal notes (admin)
 */
export async function updateInternalNotes(
    id: string,
    internal_notes: string
): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/internal-notes/`, {
        method: 'PATCH',
        body: JSON.stringify({ internal_notes }),
    });
}

/**
 * Accept service request (admin)
 */
export async function acceptServiceRequest(
    id: string,
    data: AcceptRequestData
): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/accept/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Reject service request (admin)
 */
export async function rejectServiceRequest(
    id: string,
    data: RejectRequestData
): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/reject/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Convert request to task (admin)
 */
export async function convertToTask(
    id: string,
    data: ConvertToTaskData
): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/convert-to-task/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get request timeline
 */
export async function getRequestTimeline(id: string): Promise<ApiResponse<ServiceRequestAction[]>> {
    return fetchServiceRequestAPI<ServiceRequestAction[]>(`/service-requests/${id}/timeline/`);
}

/**
 * Get request comments
 */
export async function getRequestComments(id: string): Promise<ApiResponse<ServiceRequestComment[]>> {
    return fetchServiceRequestAPI<ServiceRequestComment[]>(`/service-requests/${id}/comments/`);
}

/**
 * Add comment to request
 */
export async function addRequestComment(
    id: string,
    comment_text: string,
    is_internal: boolean = false
): Promise<ApiResponse<ServiceRequestComment>> {
    return fetchServiceRequestAPI<ServiceRequestComment>(`/service-requests/${id}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ comment_text, is_internal }),
    });
}

/**
 * Get request attachments
 */
export async function getRequestAttachments(
    id: string
): Promise<ApiResponse<ServiceRequestAttachment[]>> {
    return fetchServiceRequestAPI<ServiceRequestAttachment[]>(`/service-requests/${id}/attachments/`);
}

/**
 * Upload attachment to request
 */
export async function uploadRequestAttachment(
    id: string,
    file: File
): Promise<ApiResponse<ServiceRequestAttachment>> {
    const token = await getAccessToken();
    const apiUrl = getApiUrl(true); // Use tenant-aware URL
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${apiUrl}/service-requests/${id}/attachments/`, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            error.message || error.error?.message || 'Failed to upload attachment',
            error.details
        );
    }

    return response.json();
}

/**
 * Submit customer feedback
 */
export async function submitFeedback(
    id: string,
    data: SubmitFeedbackData
): Promise<ApiResponse<ServiceRequest>> {
    return fetchServiceRequestAPI<ServiceRequest>(`/service-requests/${id}/feedback/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Request clarification (admin)
 */
export async function requestClarification(
    id: string,
    message: string
): Promise<ApiResponse<ServiceRequestComment>> {
    return fetchServiceRequestAPI<ServiceRequestComment>(`/service-requests/${id}/clarification/`, {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
}

/**
 * Respond to clarification (customer)
 */
export async function respondToClarification(
    id: string,
    message: string
): Promise<ApiResponse<ServiceRequestComment>> {
    return fetchServiceRequestAPI<ServiceRequestComment>(
        `/service-requests/${id}/clarification/respond/`,
        {
            method: 'POST',
            body: JSON.stringify({ message }),
        }
    );
}

/**
 * Get service request reports (admin)
 */
export async function getServiceRequestReports(filters: {
    start_date?: string;
    end_date?: string;
    customer?: string;
    equipment?: string;
}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();

    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.customer) params.append('customer', filters.customer);
    if (filters.equipment) params.append('equipment', filters.equipment);

    const queryString = params.toString();
    const endpoint = `/service-requests/reports/${queryString ? `?${queryString}` : ''}`;

    return fetchServiceRequestAPI<any>(endpoint);
}

/**
 * Get analytics dashboard (admin)
 */
export async function getServiceRequestAnalytics(): Promise<ApiResponse<any>> {
    return fetchServiceRequestAPI<any>('/service-requests/reports/analytics/');
}

