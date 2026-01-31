import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

// Dashboard data types
export interface DashboardStats {
  facilities_count: number;
  buildings_count: number;
  equipment_count: number;
  locations_count: number;
  tasks_count: number;
  teams_count: number;
  customers_count: number;
  open_tasks_count: number;
}

export interface StatusData {
  status: string;
  value: string;
  count: number;
  color: string;
  percent: number;
}

export interface WeeklyActivityData {
  day: string;
  date: string;
  tasks: number;
  equipment: number;
}

export interface RecentTask {
  id: string;
  task_number: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
}

export interface RecentEquipment {
  id: string;
  equipment_number: string;
  name: string;
  operational_status: string;
  equipment_type: string;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  task_status: StatusData[];
  task_priority: StatusData[];
  equipment_status: StatusData[];
  weekly_activity: WeeklyActivityData[];
  recent_tasks: RecentTask[];
  recent_equipment: RecentEquipment[];
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const apiUrl = getApiUrl(true);
  
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

/**
 * Get all dashboard data in a single API call
 * This is the main function to use for the organization dashboard
 */
export async function getOrganizationDashboard(): Promise<DashboardData> {
  try {
    const response = await fetchAPI<any>('/dashboard/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch organization dashboard:', error);
    throw error;
  }
}

// Legacy functions for backward compatibility (deprecated - use getOrganizationDashboard instead)

export async function getDashboardStats(): Promise<DashboardStats> {
  const dashboard = await getOrganizationDashboard();
  return dashboard.stats;
}

export async function getTaskStatusBreakdown(): Promise<StatusData[]> {
  const dashboard = await getOrganizationDashboard();
  return dashboard.task_status;
}

export async function getEquipmentStatusBreakdown(): Promise<StatusData[]> {
  const dashboard = await getOrganizationDashboard();
  return dashboard.equipment_status;
}

export async function getTaskPriorityBreakdown(): Promise<StatusData[]> {
  const dashboard = await getOrganizationDashboard();
  return dashboard.task_priority;
}

export async function getRecentTasks(): Promise<RecentTask[]> {
  const dashboard = await getOrganizationDashboard();
  return dashboard.recent_tasks;
}

export async function getWeeklyActivitySimple(): Promise<WeeklyActivityData[]> {
  const dashboard = await getOrganizationDashboard();
  return dashboard.weekly_activity;
}
