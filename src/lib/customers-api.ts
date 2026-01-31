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
  company_name?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  status: 'pending' | 'active' | 'inactive';
  notes?: string;
  is_active: boolean;
  has_user_account?: boolean;
  invitation?: {
    status: 'pending' | 'accepted' | 'expired';
    sent_at?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  status?: 'pending' | 'active' | 'inactive';
  notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface InviteCustomerRequest {
  customer_id: string;
  email: string;
  message?: string;
}

export interface CustomerAssets {
  facilities: any[];
  buildings: any[];
  equipment: any[];
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
  page_size?: number;
  search?: string;
  status?: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);

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
      results: response.results,
    };
  }

  return response;
}

export async function getCustomer(id: string): Promise<ApiResponse<Customer>> {
  return fetchAPI<ApiResponse<Customer>>(`/customers/${id}/`);
}


export async function createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
  return fetchAPI<ApiResponse<Customer>>('/customers/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id: string, data: UpdateCustomerRequest): Promise<ApiResponse<Customer>> {
  return fetchAPI<ApiResponse<Customer>>(`/customers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/customers/${id}/`, {
    method: 'DELETE',
  });
}

export async function inviteCustomer(data: InviteCustomerRequest): Promise<ApiResponse<{ invitation_sent: boolean }>> {
  return fetchAPI<ApiResponse<{ invitation_sent: boolean }>>(`/customers/${data.customer_id}/invite/`, {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      message: data.message,
    }),
  });
}

export async function getCustomerAssets(customerId: string): Promise<ApiResponse<CustomerAssets>> {
  return fetchAPI<ApiResponse<CustomerAssets>>(`/customers/${customerId}/assets/`);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
