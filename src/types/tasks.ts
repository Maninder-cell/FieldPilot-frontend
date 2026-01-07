import { User } from './auth';
import { Equipment } from './equipment';

export type TaskStatus = 'new' | 'closed' | 'reopened' | 'pending' | 'rejected';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type WorkStatus = 'open' | 'hold' | 'in_progress' | 'done';

export interface TaskSection {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  tasks_count: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
}

export interface TaskAssignment {
  id: string;
  assignee: User | null;
  team: Team | null;
  team_name?: string; // Team name from backend
  assignee_name?: string; // Assignee name from backend
  work_status: WorkStatus;
  assigned_at: string;
}

export interface Assignee {
  id: string;
  name: string;
  email: string;
  work_status: WorkStatus;
}

export interface TeamAssignment {
  id: string;
  name: string;
  work_status: WorkStatus;
}

export interface TaskComment {
  id: string;
  task: string;
  task_number: string;
  author: User;
  author_name: string;
  author_role: string;
  comment: string;
  is_system_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task: string;
  task_number: string;
  uploaded_by: User;
  uploaded_by_name: string;
  file: string;
  file_url: string;
  filename: string;
  file_size: number;
  file_size_mb: number;
  file_type: string;
  is_image: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  task_number: string;
  title: string;
  description: string;
  equipment?: Equipment; // Full equipment object (detail view)
  equipment_id: string;
  equipment_name?: string; // Equipment name (list view)
  equipment_number?: string; // Equipment number (list view)
  status: TaskStatus;
  priority: TaskPriority;
  scheduled_start: string | null;
  scheduled_end: string | null;
  is_scheduled: boolean;
  section: TaskSection | null;
  section_id: string | null;
  assignments?: TaskAssignment[]; // Full assignments (detail view)
  assignment_count?: number; // Number of assignments (list view)
  assignees?: Assignee[]; // Assigned technicians (list view)
  teams?: TeamAssignment[]; // Assigned teams (list view)
  comments_count?: number; // Number of comments (detail view)
  attachments_count?: number; // Number of attachments (detail view)
  materials_needed?: string[];
  materials_received?: string[];
  notes: string;
  custom_fields?: Record<string, any>;
  is_active: boolean;
  created_by?: User; // Optional for list view
  created_by_name?: string; // Creator name (list view)
  updated_by?: User | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  equipment_id: string;
  title: string;
  description: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_ids?: string[];
  team_ids?: string[];
  scheduled_start?: string;
  scheduled_end?: string;
  materials_needed?: string[];
  notes?: string;
  section_id?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> { }

export interface TaskFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  equipment?: string;
  section?: string;
}


// ============================================
// Time Tracking Types
// ============================================

export type EquipmentStatusAtDeparture = 'functional' | 'shutdown';

export interface TimeLog {
  id: string;
  task: string;
  task_number: string;
  technician: User;
  technician_name: string;
  travel_started_at: string | null;
  arrived_at: string | null;
  departed_at: string | null;
  lunch_started_at: string | null;
  lunch_ended_at: string | null;
  equipment_status_at_departure: EquipmentStatusAtDeparture | null;
  total_work_hours: number;
  normal_hours: number;
  overtime_hours: number;
  is_on_site: boolean;
  is_traveling: boolean;
  is_on_lunch: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Task History Types
// ============================================

export type TaskHistoryAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'work_status_changed'
  | 'assigned'
  | 'comment_added'
  | 'file_uploaded'
  | 'travel_started'
  | 'arrived'
  | 'departed'
  | 'lunch_started'
  | 'lunch_ended'
  | 'material_needed'
  | 'material_received';

export interface TaskHistory {
  id: string;
  task: string;
  task_number: string;
  action: TaskHistoryAction;
  user: User | null;
  user_name: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  details: Record<string, any>;
  created_at: string;
}

// ============================================
// Status Update Types
// ============================================

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface UpdateWorkStatusRequest {
  work_status: WorkStatus;
}

export interface LogDepartureRequest {
  equipment_status: EquipmentStatusAtDeparture;
}


// ============================================
// Materials Tracking Types
// ============================================

export type MaterialLogType = 'needed' | 'received';

export interface MaterialLog {
  id: string;
  task: string;
  task_number: string;
  log_type: MaterialLogType;
  material_name: string;
  quantity: number;
  unit: string;
  notes: string;
  logged_by: User;
  logged_by_name: string;
  logged_at: string;
}

export interface LogMaterialRequest {
  material_name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

// ============================================
// Team Management Types
// ============================================

export interface TechnicianTeam {
  id: string;
  name: string;
  description: string;
  members: User[];
  is_active: boolean;
  member_count: number;
  active_member_count: number;
  created_by: User;
  updated_by: User | null;
  created_at: string;
  updated_at: string;
}

export interface TechnicianTeamListItem {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  member_count: number;
  active_member_count: number;
  created_by_name: string;
  created_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  member_ids?: string[];
  is_active?: boolean;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface AddTeamMembersRequest {
  member_ids: string[];
}

// ============================================
// Reports Types
// ============================================

export interface WorkHoursSummary {
  total_work_hours: number;
  normal_hours: number;
  overtime_hours: number;
  total_tasks: number;
}

export interface WorkHoursReport {
  technician: {
    id: string;
    name: string;
    email: string;
  };
  summary: WorkHoursSummary;
  time_logs: TimeLog[];
}

export interface WorkHoursReportFilters {
  technician_id: string;
  start_date?: string;
  end_date?: string;
}
