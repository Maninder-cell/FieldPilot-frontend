/**
 * Teams API Service
 * 
 * API functions for managing technician teams
 */

import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';
import type {
    Team,
    CreateTeamData,
    UpdateTeamData,
    AddTeamMembersData,
    TeamListResponse,
    TeamFilters
} from '@/types/teams';

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
 * Get list of teams with optional filters
 */
export async function getTeams(filters?: TeamFilters): Promise<TeamListResponse> {
    const params = new URLSearchParams();

    if (filters?.search) {
        params.append('search', filters.search);
    }

    if (filters?.is_active !== undefined) {
        params.append('is_active', filters.is_active.toString());
    }

    if (filters?.page) {
        params.append('page', filters.page.toString());
    }

    if (filters?.page_size) {
        params.append('page_size', filters.page_size.toString());
    }

    const queryString = params.toString();
    const endpoint = `/tasks/teams/${queryString ? `?${queryString}` : ''}`;

    return fetchAPI<TeamListResponse>(endpoint);
}

/**
 * Get a single team by ID
 */
export async function getTeam(teamId: string): Promise<ApiResponse<Team>> {
    return fetchAPI<ApiResponse<Team>>(`/tasks/teams/${teamId}/`);
}

/**
 * Create a new team
 */
export async function createTeam(data: CreateTeamData): Promise<ApiResponse<Team>> {
    return fetchAPI<ApiResponse<Team>>('/tasks/teams/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing team
 */
export async function updateTeam(
    teamId: string,
    data: UpdateTeamData
): Promise<ApiResponse<Team>> {
    return fetchAPI<ApiResponse<Team>>(`/tasks/teams/${teamId}/`, {
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
    data: AddTeamMembersData
): Promise<ApiResponse<Team>> {
    return fetchAPI<ApiResponse<Team>>(`/tasks/teams/${teamId}/members/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(
    teamId: string,
    memberId: string
): Promise<ApiResponse<Team>> {
    return fetchAPI<ApiResponse<Team>>(`/tasks/teams/${teamId}/members/${memberId}/`, {
        method: 'DELETE',
    });
}

/**
 * Get list of technicians available for task assignment
 */
export async function getTechnicians(filters?: {
    search?: string;
    page?: number;
    page_size?: number;
}): Promise<any> {
    const params = new URLSearchParams();

    if (filters?.search) {
        params.append('search', filters.search);
    }

    if (filters?.page) {
        params.append('page', filters.page.toString());
    }

    if (filters?.page_size) {
        params.append('page_size', filters.page_size.toString());
    }

    const queryString = params.toString();
    const endpoint = `/tasks/teams/technicians/${queryString ? `?${queryString}` : ''}`;

    return fetchAPI<any>(endpoint);
}
