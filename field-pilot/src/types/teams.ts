/**
 * Team Types
 * 
 * Type definitions for Technician Teams
 */

export interface TeamMember {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
}

export interface Team {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
    is_active: boolean;
    member_count: number;
    active_member_count: number;
    created_by: string;
    created_by_name: string;
    created_at: string;
    updated_at: string;
}

export interface CreateTeamData {
    name: string;
    description?: string;
    member_ids?: string[];
    is_active?: boolean;
}

export interface UpdateTeamData {
    name?: string;
    description?: string;
    is_active?: boolean;
}

export interface AddTeamMembersData {
    member_ids: string[];
}

export interface TeamListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Team[];
}

export interface TeamFilters {
    search?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
}
