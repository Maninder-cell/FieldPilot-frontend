import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

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

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getCustomers(params?: {
  page?: number;
  search?: string;
}): Promise<PaginatedResponse<Customer>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);

  const endpoint = `/customers/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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

export async function getCustomer(id: string): Promise<ApiResponse<Customer>> {
  return fetchAPI<ApiResponse<Customer>>(`/customers/${id}/`);
}
