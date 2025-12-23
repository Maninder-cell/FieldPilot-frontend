import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

// Types
export interface UserFile {
    id: string;
    file: string;
    filename: string;
    file_size: number;
    file_type: string;
    title: string;
    description: string;
    tags: string[];
    is_public: boolean;
    is_image: boolean;
    task: string | null;
    service_request: string | null;
    uploaded_by: {
        id: string;
        full_name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

export interface FileShare {
    id: string;
    file: UserFile;
    shared_by: {
        id: string;
        full_name: string;
        email: string;
    };
    shared_with: {
        id: string;
        full_name: string;
        email: string;
    } | null;
    share_token: string | null;
    can_download: boolean;
    can_edit: boolean;
    expires_at: string | null;
    access_count: number;
    last_accessed_at: string | null;
    created_at: string;
}

export interface StorageStats {
    usage_bytes: number;
    usage_mb: number;
    usage_gb: number;
    limit_bytes: number | null;
    limit_gb: number | null;
    is_unlimited: boolean;
    percentage_used: number;
    remaining_bytes: number | null;
    remaining_gb: number | null;
    is_quota_exceeded: boolean;
    can_upload: boolean;
    file_count: number;
    subscription_plan: string;
}

export interface FileFilters {
    page?: number;
    page_size?: number;
    file_type?: string;
    is_image?: boolean;
    is_attached?: boolean;
    task_id?: string;
    service_request_id?: string;
    search?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// API Helper
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

// ============================================
// File Management APIs
// ============================================

/**
 * Get list of user's files with optional filters
 */
export async function getFiles(filters?: FileFilters): Promise<PaginatedResponse<UserFile>> {
    const queryParams = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
    }

    const endpoint = `/files/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return fetchAPI<PaginatedResponse<UserFile>>(endpoint);
}

/**
 * Get a single file by ID
 */
export async function getFile(fileId: string): Promise<ApiResponse<UserFile>> {
    return fetchAPI<ApiResponse<UserFile>>(`/files/${fileId}/`);
}

/**
 * Upload a new file
 */
export async function uploadFile(
    file: File,
    options?: {
        title?: string;
        description?: string;
        tags?: string[];
        is_public?: boolean;
        task_id?: string;
        service_request_id?: string;
    }
): Promise<ApiResponse<UserFile>> {
    const token = getAccessToken();
    const apiUrl = getApiUrl(true);

    const formData = new FormData();
    formData.append('file', file);

    if (options?.title) formData.append('title', options.title);
    if (options?.description) formData.append('description', options.description);
    if (options?.tags) formData.append('tags', JSON.stringify(options.tags));
    if (options?.is_public !== undefined) formData.append('is_public', options.is_public.toString());
    if (options?.task_id) formData.append('task_id', options.task_id);
    if (options?.service_request_id) formData.append('service_request_id', options.service_request_id);

    const response = await fetch(`${apiUrl}/files/`, {
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
 * Update file metadata
 */
export async function updateFile(
    fileId: string,
    data: {
        title?: string;
        description?: string;
        tags?: string[];
        is_public?: boolean;
    }
): Promise<ApiResponse<UserFile>> {
    return fetchAPI<ApiResponse<UserFile>>(`/files/${fileId}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<ApiResponse<null>> {
    return fetchAPI<ApiResponse<null>>(`/files/${fileId}/`, {
        method: 'DELETE',
    });
}

/**
 * Attach file to a task or service request
 */
export async function attachFile(
    fileId: string,
    data: {
        task_id?: string;
        service_request_id?: string;
    }
): Promise<ApiResponse<UserFile>> {
    return fetchAPI<ApiResponse<UserFile>>(`/files/${fileId}/attach/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Detach file from all entities
 */
export async function detachFile(fileId: string): Promise<ApiResponse<UserFile>> {
    return fetchAPI<ApiResponse<UserFile>>(`/files/${fileId}/detach/`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
}

// ============================================
// File Sharing APIs
// ============================================

/**
 * Get list of file shares
 */
export async function getFileShares(pageSize?: number): Promise<PaginatedResponse<FileShare>> {
    const queryParams = pageSize ? `?page_size=${pageSize}` : '';
    return fetchAPI<PaginatedResponse<FileShare>>(`/files/shares/${queryParams}`);
}

/**
 * Create a file share
 */
export async function createFileShare(data: {
    file_id: string;
    shared_with_id?: string;
    generate_public_link?: boolean;
    can_download?: boolean;
    can_edit?: boolean;
    expires_at?: string;
}): Promise<ApiResponse<FileShare>> {
    return fetchAPI<ApiResponse<FileShare>>('/files/shares/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a file share
 */
export async function deleteFileShare(shareId: string): Promise<ApiResponse<null>> {
    return fetchAPI<ApiResponse<null>>(`/files/shares/${shareId}/`, {
        method: 'DELETE',
    });
}

/**
 * Access a shared file via public link (no auth required)
 */
export async function accessSharedFile(shareToken: string): Promise<ApiResponse<{
    file: UserFile;
    can_download: boolean;
    expires_at: string | null;
}>> {
    const apiUrl = getApiUrl(true);

    const response = await fetch(`${apiUrl}/files/shared/${shareToken}/`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An error occurred',
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// ============================================
// Storage Management APIs
// ============================================

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<ApiResponse<StorageStats>> {
    return fetchAPI<ApiResponse<StorageStats>>('/files/storage/stats/');
}

/**
 * Get storage breakdown by file type
 */
export async function getStorageBreakdown(): Promise<ApiResponse<Record<string, { count: number; size: number }>>> {
    return fetchAPI<ApiResponse<Record<string, { count: number; size: number }>>>('/files/storage/breakdown/');
}

/**
 * Get largest files
 */
export async function getLargestFiles(limit?: number): Promise<ApiResponse<UserFile[]>> {
    const queryParams = limit ? `?limit=${limit}` : '';
    return fetchAPI<ApiResponse<UserFile[]>>(`/files/storage/largest/${queryParams}`);
}

/**
 * Cleanup old deleted files (Admin only)
 */
export async function cleanupStorage(daysOld?: number): Promise<ApiResponse<{
    files_deleted: number;
    bytes_freed: number;
    mb_freed: number;
    gb_freed: number;
}>> {
    const queryParams = daysOld ? `?days_old=${daysOld}` : '';
    return fetchAPI<ApiResponse<{
        files_deleted: number;
        bytes_freed: number;
        mb_freed: number;
        gb_freed: number;
    }>>(`/files/storage/cleanup/${queryParams}`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎬';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return '📦';
    return '📎';
}

/**
 * Check if file type is previewable
 */
export function isPreviewable(fileType: string): boolean {
    return fileType.startsWith('image/') || fileType === 'application/pdf';
}
