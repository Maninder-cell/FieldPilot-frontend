/**
 * Customers API
 * 
 * API functions for managing customers, invitations, and customer assets.
 */
import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

// Types
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    company_name: string;
    contact_person: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    status: 'active' | 'inactive' | 'pending';
    user: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    notes: string;
    is_active: boolean;
    has_user_account: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    invitation: {
        id: string;
        status: 'pending' | 'accepted' | 'expired' | 'revoked';
        invited_at: string;
        invited_by: string;
        expires_at: string;
        accepted_at: string | null;
        is_valid: boolean;
    } | null;
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
    status?: 'active' | 'inactive' | 'pending';
    notes?: string;
}

export interface UpdateCustomerRequest {
    name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    contact_person?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    status?: 'active' | 'inactive' | 'pending';
    notes?: string;
}

export interface CustomerInvitation {
    id: string;
    customer: string;
    customer_name: string;
    email: string;
    token: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    invited_by: string;
    invited_by_name: string;
    is_valid: boolean;
    created_at: string;
    expires_at: string;
    accepted_at: string | null;
}

export interface InviteCustomerRequest {
    customer_id: string;
    email: string;
    message?: string;
}

export interface CustomerFilters {
    search?: string;
    status?: string;
    page?: number;
    page_size?: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PaginatedResponse<T> {
    success?: boolean;
    data?: T[];
    message?: string;
    count: number;
    next: string | null;
    previous: string | null;
    results?: {
        success: boolean;
        data: T[];
        message?: string;
    };
}

// Helper function for API calls
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAccessToken();
    const apiUrl = getApiUrl(true);

    const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

// ============================================
// Customer CRUD Operations
// ============================================

/**
 * Get list of customers with optional filters
 */
export async function getCustomers(params?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/customers/?${queryString}` : '/customers/';

    return fetchAPI<PaginatedResponse<Customer>>(endpoint);
}

/**
 * Get a single customer by ID
 */
export async function getCustomer(customerId: string): Promise<ApiResponse<Customer>> {
    return fetchAPI<ApiResponse<Customer>>(`/customers/${customerId}/`);
}

/**
 * Create a new customer
 */
export async function createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    return fetchAPI<ApiResponse<Customer>>('/customers/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing customer
 */
export async function updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<ApiResponse<Customer>> {
    return fetchAPI<ApiResponse<Customer>>(`/customers/${customerId}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string): Promise<ApiResponse<null>> {
    return fetchAPI<ApiResponse<null>>(`/customers/${customerId}/`, {
        method: 'DELETE',
    });
}

// ============================================
// Customer Invitation Operations
// ============================================

/**
 * Invite a customer to create an account
 */
export async function inviteCustomer(data: InviteCustomerRequest): Promise<ApiResponse<CustomerInvitation>> {
    return fetchAPI<ApiResponse<CustomerInvitation>>('/customers/invite/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Verify a customer invitation token
 */
export async function verifyInvitation(token: string): Promise<ApiResponse<CustomerInvitation>> {
    return fetchAPI<ApiResponse<CustomerInvitation>>('/customers/invitations/verify/', {
        method: 'POST',
        body: JSON.stringify({ token }),
    });
}

/**
 * Accept a customer invitation
 */
export async function acceptInvitation(token: string): Promise<ApiResponse<Customer>> {
    return fetchAPI<ApiResponse<Customer>>('/customers/invitations/accept/', {
        method: 'POST',
        body: JSON.stringify({ token }),
    });
}

// ============================================
// Customer Assets Operations
// ============================================

/**
 * Get assets (facilities, buildings, equipment) associated with a customer
 */
export async function getCustomerAssets(customerId: string): Promise<ApiResponse<{
    facilities: any[];
    buildings: any[];
    equipment: any[];
}>> {
    return fetchAPI<ApiResponse<{
        facilities: any[];
        buildings: any[];
        equipment: any[];
    }>>(`/customers/${customerId}/assets/`);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
    switch (status) {
        case 'active':
            return 'bg-emerald-100 text-emerald-700';
        case 'inactive':
            return 'bg-gray-100 text-gray-700';
        case 'pending':
            return 'bg-amber-100 text-amber-700';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

/**
 * Format customer display name
 */
export function formatCustomerName(customer: Customer): string {
    if (customer.company_name) {
        return `${customer.name} (${customer.company_name})`;
    }
    return customer.name;
}
