import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';
import { Location, CreateLocationData, UpdateLocationData } from '@/types/locations';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const apiUrl = getApiUrl(true);
  
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

export async function getLocations(params?: {
  entity_type?: string;
  entity_id?: string;
  page?: number;
  page_size?: number;
}): Promise<{ success: boolean; data: Location[]; message: string; count: number }> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
  }

  const endpoint = `/locations/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetchAPI<any>(endpoint);
  
  // Locations API doesn't use pagination by default, return as-is with count
  if (response.success && response.data) {
    return {
      success: response.success,
      data: response.data,
      message: response.message,
      count: response.data.length,
    };
  }
  
  return response;
}

export async function getLocationById(id: string): Promise<ApiResponse<Location>> {
  return fetchAPI<ApiResponse<Location>>(`/locations/${id}/`);
}

export async function createLocation(data: CreateLocationData): Promise<ApiResponse<Location>> {
  return fetchAPI<ApiResponse<Location>>('/locations/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLocation(
  id: string,
  data: UpdateLocationData
): Promise<ApiResponse<Location>> {
  return fetchAPI<ApiResponse<Location>>(`/locations/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteLocation(id: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/locations/${id}/`, {
    method: 'DELETE',
  });
}
