import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '@/types/tasks';

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

export async function getTasks(params?: TaskFilters): Promise<PaginatedResponse<Task>> {
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

export async function getTask(id: string): Promise<ApiResponse<Task>> {
  return fetchAPI<ApiResponse<Task>>(`/tasks/${id}/`);
}

export async function createTask(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
  return fetchAPI<ApiResponse<Task>>('/tasks/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  id: string,
  data: UpdateTaskRequest
): Promise<ApiResponse<Task>> {
  return fetchAPI<ApiResponse<Task>>(`/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/tasks/${id}/`, {
    method: 'DELETE',
  });
}

// Assignment Management
export async function assignTask(
  taskId: string,
  data: { assignee_ids?: string[]; team_ids?: string[] }
): Promise<ApiResponse<Task>> {
  return fetchAPI<ApiResponse<Task>>(`/tasks/${taskId}/assign/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Team Management
export async function getTeams(): Promise<any> {
  const response = await fetchAPI<any>('/tasks/teams/');
  // Backend returns: { count, next, previous, results: { success, data: [...] } }
  return response.results || response;
}

export async function getTechnicians(): Promise<any> {
  const response = await fetchAPI<any>('/tasks/teams/technicians/');
  // Backend returns: { count, next, previous, results: { success, data: [...] } }
  return response.results || response;
}

// Comment Management
export async function getTaskComments(taskId: string): Promise<any> {
  const response = await fetchAPI<any>(`/tasks/${taskId}/comments/`);
  // Backend may return paginated: { count, next, previous, results: { success, data: [...] } }
  // Or direct: { success, data: [...] }
  if (response.results) {
    return response.results;
  }
  return response;
}

export async function createComment(taskId: string, comment: string): Promise<ApiResponse<any>> {
  return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

export async function updateComment(commentId: string, comment: string): Promise<ApiResponse<any>> {
  return fetchAPI<ApiResponse<any>>(`/tasks/comments/${commentId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ comment }),
  });
}

export async function deleteComment(commentId: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/tasks/comments/${commentId}/`, {
    method: 'DELETE',
  });
}

// Attachment Management
export async function getTaskAttachments(taskId: string): Promise<ApiResponse<any[]>> {
  return fetchAPI<ApiResponse<any[]>>(`/tasks/${taskId}/attachments/`);
}

export async function uploadAttachment(taskId: string, file: File): Promise<ApiResponse<any>> {
  const token = getAccessToken();
  const apiUrl = getApiUrl(true);
  
  const formData = new FormData();
  formData.append('file', file);

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

export async function deleteAttachment(attachmentId: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/tasks/attachments/${attachmentId}/`, {
    method: 'DELETE',
  });
}

export async function downloadAttachment(attachmentId: string, filename: string): Promise<void> {
  const token = getAccessToken();
  const apiUrl = getApiUrl(true);
  
  const response = await fetch(`${apiUrl}/tasks/attachments/${attachmentId}/download/`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}


// ============================================
// Task Status Management APIs
// ============================================

/**
 * Update administrative status of a task (admin/manager only)
 * Status options: 'new' | 'closed' | 'reopened' | 'pending' | 'rejected'
 */
export async function updateTaskStatus(
  taskId: string,
  status: 'new' | 'closed' | 'reopened' | 'pending' | 'rejected'
): Promise<ApiResponse<Task>> {
  return fetchAPI<ApiResponse<Task>>(`/tasks/${taskId}/status/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * Update work status of a task assignment (technician only)
 * Work status options: 'open' | 'hold' | 'in_progress' | 'done'
 */
export async function updateWorkStatus(
  taskId: string,
  workStatus: 'open' | 'hold' | 'in_progress' | 'done'
): Promise<ApiResponse<Task>> {
  return fetchAPI<ApiResponse<Task>>(`/tasks/${taskId}/work-status/`, {
    method: 'PATCH',
    body: JSON.stringify({ work_status: workStatus }),
  });
}

/**
 * Get task history/audit trail
 * Optional filters: action type, user ID
 */
export async function getTaskHistory(
  taskId: string,
  filters?: { action?: string; user?: string }
): Promise<ApiResponse<any[]>> {
  const queryParams = new URLSearchParams();
  if (filters?.action) queryParams.append('action', filters.action);
  if (filters?.user) queryParams.append('user', filters.user);

  const endpoint = `/tasks/${taskId}/history/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchAPI<ApiResponse<any[]>>(endpoint);
}

// ============================================
// Time Tracking APIs (Technician Field Work)
// ============================================

/**
 * Log that technician started traveling to site
 */
export async function logTravel(taskId: string): Promise<ApiResponse<any>> {
  return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/travel/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Log that technician arrived at site
 */
export async function logArrival(taskId: string): Promise<ApiResponse<any>> {
  return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/arrive/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Log that technician departed from site
 * @param equipmentStatus - Status of equipment when leaving: 'functional' | 'shutdown'
 */
export async function logDeparture(
  taskId: string,
  equipmentStatus: 'functional' | 'shutdown'
): Promise<ApiResponse<any>> {
  return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/depart/`, {
    method: 'POST',
    body: JSON.stringify({ equipment_status: equipmentStatus }),
  });
}

/**
 * Log that technician started lunch break
 */
export async function logLunchStart(taskId: string): Promise<ApiResponse<any>> {
  return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/lunch-start/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Log that technician ended lunch break
 */
export async function logLunchEnd(taskId: string): Promise<ApiResponse<any>> {
  return fetchAPI<ApiResponse<any>>(`/tasks/${taskId}/lunch-end/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Get all time logs for a task
 */
export async function getTimeLogs(taskId: string): Promise<ApiResponse<any[]>> {
  return fetchAPI<ApiResponse<any[]>>(`/tasks/${taskId}/time-logs/`);
}


// ============================================
// Materials Tracking APIs
// ============================================

export interface LogMaterialRequest {
  material_name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface MaterialLog {
  id: string;
  task: string;
  task_number: string;
  log_type: 'needed' | 'received';
  material_name: string;
  quantity: number;
  unit: string;
  notes: string;
  logged_by: any;
  logged_by_name: string;
  logged_at: string;
}

/**
 * Log materials needed for a task
 */
export async function logMaterialNeeded(
  taskId: string,
  data: LogMaterialRequest
): Promise<ApiResponse<MaterialLog>> {
  return fetchAPI<ApiResponse<MaterialLog>>(`/tasks/${taskId}/materials/needed/`, {
    method: 'POST',
    body: JSON.stringify({ ...data, log_type: 'needed' }),
  });
}

/**
 * Log materials received for a task
 */
export async function logMaterialReceived(
  taskId: string,
  data: LogMaterialRequest
): Promise<ApiResponse<MaterialLog>> {
  return fetchAPI<ApiResponse<MaterialLog>>(`/tasks/${taskId}/materials/received/`, {
    method: 'POST',
    body: JSON.stringify({ ...data, log_type: 'received' }),
  });
}

/**
 * Get all material logs for a task
 * @param logType - Optional filter: 'needed' | 'received'
 */
export async function getTaskMaterials(
  taskId: string,
  logType?: 'needed' | 'received'
): Promise<ApiResponse<MaterialLog[]>> {
  const queryParams = new URLSearchParams();
  if (logType) queryParams.append('log_type', logType);

  const endpoint = `/tasks/${taskId}/materials/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchAPI<ApiResponse<MaterialLog[]>>(endpoint);
}

// ============================================
// Team Management APIs (Extended)
// ============================================

export interface TechnicianTeam {
  id: string;
  name: string;
  description: string;
  members: any[];
  is_active: boolean;
  member_count: number;
  active_member_count: number;
  created_by: any;
  updated_by: any;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  member_ids?: string[];
  is_active?: boolean;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Get team details
 */
export async function getTeam(teamId: string): Promise<ApiResponse<TechnicianTeam>> {
  return fetchAPI<ApiResponse<TechnicianTeam>>(`/tasks/teams/${teamId}/`);
}

/**
 * Create a new team
 */
export async function createTeam(data: CreateTeamRequest): Promise<ApiResponse<TechnicianTeam>> {
  return fetchAPI<ApiResponse<TechnicianTeam>>('/tasks/teams/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update team information
 */
export async function updateTeam(
  teamId: string,
  data: UpdateTeamRequest
): Promise<ApiResponse<TechnicianTeam>> {
  return fetchAPI<ApiResponse<TechnicianTeam>>(`/tasks/teams/${teamId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a team (soft delete)
 */
export async function deleteTeam(teamId: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/tasks/teams/${teamId}/`, {
    method: 'DELETE',
  });
}

/**
 * Add members to a team
 */
export async function addTeamMembers(
  teamId: string,
  memberIds: string[]
): Promise<ApiResponse<TechnicianTeam>> {
  return fetchAPI<ApiResponse<TechnicianTeam>>(`/tasks/teams/${teamId}/members/`, {
    method: 'POST',
    body: JSON.stringify({ member_ids: memberIds }),
  });
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(
  teamId: string,
  memberId: string
): Promise<ApiResponse<TechnicianTeam>> {
  return fetchAPI<ApiResponse<TechnicianTeam>>(`/tasks/teams/${teamId}/members/${memberId}/`, {
    method: 'DELETE',
  });
}

// ============================================
// Reports APIs
// ============================================

export interface WorkHoursReport {
  technician: {
    id: string;
    name: string;
    email: string;
  };
  summary: {
    total_work_hours: number;
    normal_hours: number;
    overtime_hours: number;
    total_tasks: number;
  };
  time_logs: any[];
}

/**
 * Get work hours report for a technician
 * @param technicianId - Technician ID (required for admin/manager, auto-filled for technicians)
 * @param startDate - Start date filter (YYYY-MM-DD)
 * @param endDate - End date filter (YYYY-MM-DD)
 */
export async function getWorkHoursReport(
  technicianId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<WorkHoursReport>> {
  const queryParams = new URLSearchParams();
  queryParams.append('technician', technicianId);
  if (startDate) queryParams.append('start_date', startDate);
  if (endDate) queryParams.append('end_date', endDate);

  return fetchAPI<ApiResponse<WorkHoursReport>>(`/tasks/reports/work-hours/?${queryParams.toString()}`);
}
