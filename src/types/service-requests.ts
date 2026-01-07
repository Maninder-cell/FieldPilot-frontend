/**
 * Service Requests Types
 */

import { Equipment } from './equipment';
import { Facility } from './facilities';

export type ServiceRequestType = 'service' | 'issue' | 'maintenance' | 'inspection';
export type ServiceRequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ServiceRequestStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type IssueType = 'breakdown' | 'malfunction' | 'performance' | 'safety' | 'other';
export type Severity = 'minor' | 'moderate' | 'major' | 'critical';

export interface ServiceRequest {
    id: string;
    request_number: string;
    customer: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
    };
    equipment: Equipment;
    facility: Facility;
    converted_task?: {
        id: string;
        task_number: string;
        status: string;
        status_display: string;
    } | null;

    // Request details
    request_type: ServiceRequestType;
    request_type_display: string;
    title: string;
    description: string;
    priority: ServiceRequestPriority;
    priority_display: string;

    // Issue-specific fields
    issue_type?: IssueType | null;
    issue_type_display?: string;
    severity?: Severity | null;
    severity_display?: string;

    // Status and review
    status: ServiceRequestStatus;
    status_display: string;
    reviewed_by?: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
    } | null;
    reviewed_at?: string | null;

    // Response
    response_message: string;
    estimated_cost?: number | null;
    estimated_timeline: string;
    rejection_reason: string;

    // Internal (admin only)
    internal_notes?: string;

    // Timestamps
    created_at: string;
    updated_at: string;
    completed_at?: string | null;

    // Feedback
    customer_rating?: number | null;
    customer_feedback: string;
    feedback_submitted_at?: string | null;

    // Related data
    attachments?: ServiceRequestAttachment[];
    comments?: ServiceRequestComment[];
    actions?: ServiceRequestAction[];
}

export interface ServiceRequestAttachment {
    id: string;
    request: string;
    uploaded_by: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
    };
    file: string;
    file_url: string;
    filename: string;
    file_size: number;
    file_type: string;
    is_image: boolean;
    created_at: string;
}

export interface ServiceRequestComment {
    id: string;
    request: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
    } | null;
    user_name: string;
    comment_text: string;
    is_internal: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceRequestAction {
    id: string;
    request: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
    } | null;
    user_name: string;
    action_type: string;
    action_display: string;
    description: string;
    metadata: Record<string, any>;
    created_at: string;
}

export interface CreateServiceRequestData {
    equipment_id: string;
    request_type: ServiceRequestType;
    title: string;
    description: string;
    priority?: ServiceRequestPriority;
    issue_type?: IssueType;
    severity?: Severity;
}

export interface UpdateServiceRequestData {
    title?: string;
    description?: string;
    priority?: ServiceRequestPriority;
    issue_type?: IssueType;
    severity?: Severity;
}

export interface AcceptRequestData {
    response_message?: string;
    estimated_timeline?: string;
    estimated_cost?: number;
}

export interface RejectRequestData {
    rejection_reason: string;
}

export interface ConvertToTaskData {
    assignee_ids?: string[];
    team_id?: string;
    scheduled_start?: string;
    scheduled_end?: string;
    priority?: string;
}

export interface SubmitFeedbackData {
    rating: number;
    feedback_text?: string;
}

export interface ServiceRequestFilters {
    page?: number;
    page_size?: number;
    status?: ServiceRequestStatus;
    priority?: ServiceRequestPriority;
    request_type?: ServiceRequestType;
    customer?: string;
    equipment?: string;
    search?: string;
}
