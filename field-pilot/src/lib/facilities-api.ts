import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';
import { Facility, CreateFacilityRequest, UpdateFacilityRequest, FacilityFilters } from '@/types/facilities';

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
 * Get list of facilities with optional filters
 */
export async function getFacilities(filters?: FacilityFilters): Promise<PaginatedResponse<Facility>> {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.customer) params.append('customer', filters.customer);
  
  const queryString = params.toString();
  const endpoint = `/facilities/${queryString ? `?${queryString}` : ''}`;
  
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
 * Get facility by ID
 */
export async function getFacility(facilityId: string): Promise<ApiResponse<Facility>> {
  return fetchAPI<ApiResponse<Facility>>(`/facilities/${facilityId}/`);
}

/**
 * Create new facility
 */
export async function createFacility(data: CreateFacilityRequest): Promise<ApiResponse<Facility>> {
  return fetchAPI<ApiResponse<Facility>>('/facilities/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update facility
 */
export async function updateFacility(
  facilityId: string,
  data: UpdateFacilityRequest
): Promise<ApiResponse<Facility>> {
  return fetchAPI<ApiResponse<Facility>>(`/facilities/${facilityId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete facility
 */
export async function deleteFacility(facilityId: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/facilities/${facilityId}/`, {
    method: 'DELETE',
  });
}

/**
 * Get buildings in a facility
 */
export async function getFacilityBuildings(facilityId: string): Promise<ApiResponse<any[]>> {
  return fetchAPI<ApiResponse<any[]>>(`/facilities/${facilityId}/buildings/`);
}

/**
 * Get equipment in a facility
 */
export async function getFacilityEquipment(facilityId: string): Promise<ApiResponse<any[]>> {
  return fetchAPI<ApiResponse<any[]>>(`/facilities/${facilityId}/equipment/`);
}
