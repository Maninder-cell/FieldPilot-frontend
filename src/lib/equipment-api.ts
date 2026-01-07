import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';
import { Equipment, CreateEquipmentData, UpdateEquipmentData } from '@/types/equipment';

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

export async function getEquipment(
  params?: {
    building?: string;
    facility?: string;
    status?: string;
    type?: string;
    manufacturer?: string;
    customer?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }
): Promise<PaginatedResponse<Equipment>> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
  }

  const endpoint = `/equipment/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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

export async function getEquipmentById(id: string): Promise<ApiResponse<Equipment>> {
  return fetchAPI<ApiResponse<Equipment>>(`/equipment/${id}/`);
}

export async function createEquipment(data: CreateEquipmentData): Promise<ApiResponse<Equipment>> {
  return fetchAPI<ApiResponse<Equipment>>('/equipment/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEquipment(
  id: string,
  data: UpdateEquipmentData
): Promise<ApiResponse<Equipment>> {
  return fetchAPI<ApiResponse<Equipment>>(`/equipment/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteEquipment(id: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/equipment/${id}/`, {
    method: 'DELETE',
  });
}
