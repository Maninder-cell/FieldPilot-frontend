import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

// Types
export interface CustomerDashboardData {
    metrics: {
        pending_requests: number;
        in_progress_requests: number;
        completed_requests: number;
        total_equipment: number;
        equipment_requiring_attention: number;
    };
    recent_activity: {
        id: string;
        request_number: string;
        title: string;
        status: string;
        updated_at: string;
    }[];
    equipment_requiring_attention: {
        id: string;
        name: string;
        status: string;
        location: string | null;
    }[];
    upcoming_services: {
        id: string;
        task_number: string;
        equipment_name: string | null;
        scheduled_start: string;
    }[];
}

export interface Equipment {
    id: string;
    name: string;
    equipment_type: string;
    manufacturer: string;
    model: string;
    serial_number: string;
    location: string | null;
    status: string;
    facility: {
        id: string;
        name: string;
    } | null;
    building: {
        id: string;
        name: string;
    } | null;
    installation_date: string | null;
    warranty_expiry: string | null;
}

export interface ServiceRequest {
    id: string;
    request_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    request_type: string;
    created_at: string;
    updated_at: string;
    equipment: {
        id: string;
        name: string;
    };
    facility: {
        id: string;
        name: string;
    };
}

// API Functions
export const getCustomerDashboardData = async (): Promise<CustomerDashboardData> => {
    const accessToken = getAccessToken();
    const apiUrl = getApiUrl(true);

    const response = await fetch(`${apiUrl}/service-requests/customer/dashboard/`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    const result = await response.json();
    // Extract data from success wrapper
    return result.success ? result.data : result;
};

export const getCustomerEquipment = async (page = 1, pageSize = 20, facilityId?: string) => {
    const accessToken = getAccessToken();
    const apiUrl = getApiUrl(true);

    const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
    });
    if (facilityId) params.append('facility', facilityId);

    const response = await fetch(`${apiUrl}/service-requests/customer/equipment/?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error('Failed to fetch equipment');
    const result = await response.json();
    // Extract data from success wrapper if present
    return result.success ? result.data : result;
};

export const getCustomerServiceRequests = async (page = 1, pageSize = 20, status?: string) => {
    const accessToken = getAccessToken();
    const apiUrl = getApiUrl(true);

    const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
    });
    if (status) params.append('status', status);

    const response = await fetch(`${apiUrl}/service-requests/?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error('Failed to fetch service requests');
    const result = await response.json();
    return result.success ? result.data : result;
};

export const getEquipmentDetail = async (equipmentId: string) => {
    const accessToken = getAccessToken();
    const apiUrl = getApiUrl(true);

    const response = await fetch(`${apiUrl}/service-requests/customer/equipment/${equipmentId}/`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error('Failed to fetch equipment detail');
    const result = await response.json();
    return result.success ? result.data : result;
};

export const getEquipmentHistory = async (equipmentId: string) => {
    const accessToken = getAccessToken();
    const apiUrl = getApiUrl(true);

    const response = await fetch(`${apiUrl}/service-requests/customer/equipment/${equipmentId}/history/`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error('Failed to fetch equipment history');
    const result = await response.json();
    return result.success ? result.data : result;
};

export const getEquipmentUpcoming = async (equipmentId: string) => {
    const accessToken = getAccessToken();
    const apiUrl = getApiUrl(true);

    const response = await fetch(`${apiUrl}/service-requests/customer/equipment/${equipmentId}/upcoming/`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error('Failed to fetch upcoming services');
    const result = await response.json();
    return result.success ? result.data : result;
};
