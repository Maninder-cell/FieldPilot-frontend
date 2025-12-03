import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';
import { Building, CreateBuildingRequest, UpdateBuildingRequest, BuildingFilters } from '@/types/buildings';

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
    
    // Extract detailed error message
    let errorMessage = error.message || error.error?.message || `HTTP error! status: ${response.status}`;
    
    // If there are validation errors, format them
    if (error.details || error.error?.details) {
      const details = error.details || error.error?.details;
      if (typeof details === 'object') {
        const errorMessages = Object.entries(details)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(', ')}`;
          })
          .join('; ');
        errorMessage = errorMessages || errorMessage;
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get list of buildings with optional filters
 */
export async function getBuildings(filters?: BuildingFilters): Promise<PaginatedResponse<Building>> {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.facility) params.append('facility', filters.facility);
  
  const queryString = params.toString();
  const endpoint = `/buildings/${queryString ? `?${queryString}` : ''}`;
  
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
 * Get building by ID
 */
export async function getBuilding(buildingId: string): Promise<ApiResponse<Building>> {
  return fetchAPI<ApiResponse<Building>>(`/buildings/${buildingId}/`);
}

/**
 * Create new building
 */
export async function createBuilding(data: CreateBuildingRequest): Promise<ApiResponse<Building>> {
  return fetchAPI<ApiResponse<Building>>('/buildings/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update building
 */
export async function updateBuilding(
  buildingId: string,
  data: UpdateBuildingRequest
): Promise<ApiResponse<Building>> {
  return fetchAPI<ApiResponse<Building>>(`/buildings/${buildingId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete building
 */
export async function deleteBuilding(buildingId: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/buildings/${buildingId}/`, {
    method: 'DELETE',
  });
}
