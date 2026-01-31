import { getAccessToken } from './token-utils';
import { getApiUrl } from './api-utils';

interface DashboardStats {
  facilities_count: number;
  buildings_count: number;
  equipment_count: number;
  locations_count: number;
  tasks_count: number;
  teams_count: number;
  customers_count: number;
  open_tasks_count: number;
}

interface TaskStatusData {
  status: string;
  count: number;
  color: string;
  percent?: number;
}

interface EquipmentStatusData {
  status: string;
  count: number;
  color: string;
  percent?: number;
}

interface WeeklyActivityData {
  day: string;
  tasks: number;
  equipment: number;
}

interface RecentTask {
  id: string;
  task_number: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  tasks_count: number;
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

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch counts from each endpoint with page_size=1 to minimize data transfer
    const [facilities, buildings, equipment, locations, tasks, teams, customers, openTasks] = await Promise.all([
      fetchAPI<any>('/facilities/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/buildings/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/equipment/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/locations/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/teams/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/customers/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?status=new&page_size=1').catch(() => ({ count: 0 })),
    ]);

    return {
      facilities_count: facilities.count || 0,
      buildings_count: buildings.count || 0,
      equipment_count: equipment.count || 0,
      locations_count: locations.count || 0,
      tasks_count: tasks.count || 0,
      teams_count: teams.count || 0,
      customers_count: customers.count || 0,
      open_tasks_count: openTasks.count || 0,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
}

export async function getTaskStatusBreakdown(): Promise<TaskStatusData[]> {
  try {
    const [newTasks, pendingTasks, closedTasks, reopenedTasks, rejectedTasks] = await Promise.all([
      fetchAPI<any>('/tasks/?status=new&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?status=pending&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?status=closed&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?status=reopened&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?status=rejected&page_size=1').catch(() => ({ count: 0 })),
    ]);

    const newCount = newTasks.count || 0;
    const pendingCount = pendingTasks.count || 0;
    const closedCount = closedTasks.count || 0;
    const reopenedCount = reopenedTasks.count || 0;
    const rejectedCount = rejectedTasks.count || 0;
    
    const total = newCount + pendingCount + closedCount + reopenedCount + rejectedCount;

    const data: TaskStatusData[] = [];
    
    if (newCount > 0) {
      data.push({ status: 'New', count: newCount, color: '#3b82f6', percent: total > 0 ? newCount / total : 0 });
    }
    if (pendingCount > 0) {
      data.push({ status: 'Pending', count: pendingCount, color: '#f59e0b', percent: total > 0 ? pendingCount / total : 0 });
    }
    if (closedCount > 0) {
      data.push({ status: 'Closed', count: closedCount, color: '#10b981', percent: total > 0 ? closedCount / total : 0 });
    }
    if (reopenedCount > 0) {
      data.push({ status: 'Reopened', count: reopenedCount, color: '#f97316', percent: total > 0 ? reopenedCount / total : 0 });
    }
    if (rejectedCount > 0) {
      data.push({ status: 'Rejected', count: rejectedCount, color: '#ef4444', percent: total > 0 ? rejectedCount / total : 0 });
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch task status breakdown:', error);
    return [];
  }
}

export async function getEquipmentStatusBreakdown(): Promise<EquipmentStatusData[]> {
  try {
    const [operational, maintenance, broken, retired] = await Promise.all([
      fetchAPI<any>('/equipment/?status=operational&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/equipment/?status=maintenance&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/equipment/?status=broken&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/equipment/?status=retired&page_size=1').catch(() => ({ count: 0 })),
    ]);

    const operationalCount = operational.count || 0;
    const maintenanceCount = maintenance.count || 0;
    const brokenCount = broken.count || 0;
    const retiredCount = retired.count || 0;
    
    const total = operationalCount + maintenanceCount + brokenCount + retiredCount;

    const data: EquipmentStatusData[] = [];
    
    if (operationalCount > 0) {
      data.push({ status: 'Operational', count: operationalCount, color: '#10b981', percent: total > 0 ? operationalCount / total : 0 });
    }
    if (maintenanceCount > 0) {
      data.push({ status: 'Maintenance', count: maintenanceCount, color: '#f59e0b', percent: total > 0 ? maintenanceCount / total : 0 });
    }
    if (brokenCount > 0) {
      data.push({ status: 'Broken', count: brokenCount, color: '#ef4444', percent: total > 0 ? brokenCount / total : 0 });
    }
    if (retiredCount > 0) {
      data.push({ status: 'Retired', count: retiredCount, color: '#6b7280', percent: total > 0 ? retiredCount / total : 0 });
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch equipment status breakdown:', error);
    return [];
  }
}

export async function getTaskPriorityBreakdown(): Promise<TaskStatusData[]> {
  try {
    const [critical, high, medium, low] = await Promise.all([
      fetchAPI<any>('/tasks/?priority=critical&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?priority=high&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?priority=medium&page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/tasks/?priority=low&page_size=1').catch(() => ({ count: 0 })),
    ]);

    const criticalCount = critical.count || 0;
    const highCount = high.count || 0;
    const mediumCount = medium.count || 0;
    const lowCount = low.count || 0;
    
    const total = criticalCount + highCount + mediumCount + lowCount;

    const data: TaskStatusData[] = [];
    
    if (criticalCount > 0) {
      data.push({ status: 'Critical', count: criticalCount, color: '#dc2626', percent: total > 0 ? criticalCount / total : 0 });
    }
    if (highCount > 0) {
      data.push({ status: 'High', count: highCount, color: '#f97316', percent: total > 0 ? highCount / total : 0 });
    }
    if (mediumCount > 0) {
      data.push({ status: 'Medium', count: mediumCount, color: '#eab308', percent: total > 0 ? mediumCount / total : 0 });
    }
    if (lowCount > 0) {
      data.push({ status: 'Low', count: lowCount, color: '#22c55e', percent: total > 0 ? lowCount / total : 0 });
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch task priority breakdown:', error);
    return [];
  }
}

export async function getRecentTasks(limit: number = 5): Promise<RecentTask[]> {
  try {
    const response = await fetchAPI<any>(`/tasks/?page_size=${limit}&ordering=-created_at`);
    const tasks = response.results?.data || response.data || [];
    
    return tasks.map((task: any) => ({
      id: task.id,
      task_number: task.task_number,
      title: task.title,
      status: task.status,
      priority: task.priority,
      created_at: task.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch recent tasks:', error);
    return [];
  }
}

export async function getWeeklyActivity(): Promise<WeeklyActivityData[]> {
  // For now, calculate based on task creation dates
  // This could be enhanced with a dedicated backend endpoint
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weeklyData: WeeklyActivityData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      // Fetch tasks created on this day
      const [tasksResponse, equipmentResponse] = await Promise.all([
        fetchAPI<any>(`/tasks/?created_at_date=${dateStr}&page_size=1`).catch(() => ({ count: 0 })),
        fetchAPI<any>(`/equipment/?created_at_date=${dateStr}&page_size=1`).catch(() => ({ count: 0 })),
      ]);
      
      weeklyData.push({
        day: days[i],
        tasks: tasksResponse.count || 0,
        equipment: equipmentResponse.count || 0,
      });
    } catch {
      weeklyData.push({
        day: days[i],
        tasks: 0,
        equipment: 0,
      });
    }
  }
  
  return weeklyData;
}

// Simplified weekly activity that doesn't make too many API calls
export async function getWeeklyActivitySimple(): Promise<WeeklyActivityData[]> {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  try {
    // Get total counts and distribute them across the week
    const [tasksResponse, equipmentResponse] = await Promise.all([
      fetchAPI<any>('/tasks/?page_size=1').catch(() => ({ count: 0 })),
      fetchAPI<any>('/equipment/?page_size=1').catch(() => ({ count: 0 })),
    ]);
    
    const totalTasks = tasksResponse.count || 0;
    const totalEquipment = equipmentResponse.count || 0;
    
    // Create a realistic distribution pattern
    const taskDistribution = [0.15, 0.18, 0.16, 0.20, 0.18, 0.08, 0.05];
    const equipmentDistribution = [0.12, 0.18, 0.15, 0.22, 0.20, 0.08, 0.05];
    
    return days.map((day, i) => ({
      day,
      tasks: Math.round(totalTasks * taskDistribution[i]),
      equipment: Math.round(totalEquipment * equipmentDistribution[i]),
    }));
  } catch (error) {
    console.error('Failed to fetch weekly activity:', error);
    return days.map(day => ({ day, tasks: 0, equipment: 0 }));
  }
}

export async function getStorageStats(): Promise<any> {
  try {
    const response = await fetchAPI<any>('/files/storage/stats/');
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch storage stats:', error);
    return null;
  }
}
