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
  work_status: WorkStatus;
  assigned_at: string;
}

export interface Task {
  id: string;
  task_number: string;
  title: string;
  description: string;
  equipment: Equipment;
  equipment_id: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduled_start: string | null;
  scheduled_end: string | null;
  is_scheduled: boolean;
  section: TaskSection | null;
  section_id: string | null;
  assignments?: TaskAssignment[];
  materials_needed?: string[];
  materials_received?: string[];
  notes: string;
  custom_fields?: Record<string, any>;
  is_active: boolean;
  created_by: User;
  updated_by: User | null;
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

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

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
