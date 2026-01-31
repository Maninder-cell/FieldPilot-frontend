'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import FacilityModal from '@/components/organization/FacilityModal';
import BuildingModal from '@/components/organization/BuildingModal';
import EquipmentModal from '@/components/organization/EquipmentModal';
import LocationModal from '@/components/organization/LocationModal';
import { 
  Building2, 
  Wrench, 
  MapPin, 
  Home, 
  Users,
  ClipboardList,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';
import { CreateFacilityRequest } from '@/types/facilities';
import { CreateBuildingRequest } from '@/types/buildings';
import { 
  getOrganizationDashboard,
  StatusData,
  WeeklyActivityData,
  RecentTask
} from '@/lib/dashboard-api';
import { toast } from 'react-hot-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import Link from 'next/link';

export default function OrganizationDashboard() {
  const { user, isLoading } = useAuth();
  const { tenant } = useOnboarding();
  const router = useRouter();

  // Dashboard stats
  const [stats, setStats] = useState({
    facilities_count: 0,
    buildings_count: 0,
    equipment_count: 0,
    locations_count: 0,
    tasks_count: 0,
    teams_count: 0,
    customers_count: 0,
    open_tasks_count: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [taskStatusData, setTaskStatusData] = useState<StatusData[]>([]);
  const [equipmentStatusData, setEquipmentStatusData] = useState<StatusData[]>([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState<WeeklyActivityData[]>([]);
  const [taskPriorityData, setTaskPriorityData] = useState<StatusData[]>([]);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);

  // Modal states
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const dashboardData = await getOrganizationDashboard();
      
      setStats(dashboardData.stats);
      setTaskStatusData(dashboardData.task_status);
      setEquipmentStatusData(dashboardData.equipment_status);
      setWeeklyActivityData(dashboardData.weekly_activity);
      setTaskPriorityData(dashboardData.task_priority);
      setRecentTasks(dashboardData.recent_tasks);
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleFacilitySubmit = async (data: CreateFacilityRequest) => {
    setIsSubmitting(true);
    try {
      setIsFacilityModalOpen(false);
      loadDashboardStats();
    } catch (error) {
      console.error('Error creating facility:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuildingSubmit = async (data: CreateBuildingRequest) => {
    setIsSubmitting(true);
    try {
      setIsBuildingModalOpen(false);
      loadDashboardStats();
    } catch (error) {
      console.error('Error creating building:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-green-100 text-green-800',
      reopened: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || !tenant) {
    return null;
  }

  const statsCards = [
    { name: 'Facilities', value: stats.facilities_count, icon: Home, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', href: '/organization/facilities' },
    { name: 'Buildings', value: stats.buildings_count, icon: Building2, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', href: '/organization/buildings' },
    { name: 'Equipment', value: stats.equipment_count, icon: Wrench, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', href: '/organization/equipment' },
    { name: 'Tasks', value: stats.tasks_count, icon: ClipboardList, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', href: '/organization/tasks' },
    { name: 'Open Tasks', value: stats.open_tasks_count, icon: AlertTriangle, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', href: '/organization/tasks?status=new' },
    { name: 'Teams', value: stats.teams_count, icon: Users, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', href: '/organization/teams' },
    { name: 'Customers', value: stats.customers_count, icon: Users, iconBg: 'bg-pink-100', iconColor: 'text-pink-600', href: '/organization/customers' },
    { name: 'Locations', value: stats.locations_count, icon: MapPin, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', href: '/organization/locations' },
  ];

  return (
    <OrganizationLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome to {tenant?.name || 'your organization'}
            </p>
          </div>
          <button
            onClick={loadDashboardStats}
            disabled={isLoadingStats}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {statsCards.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                  <p className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {isLoadingStats ? (
                      <span className="inline-block animate-pulse bg-gray-200 rounded h-6 sm:h-8 w-8 sm:w-12"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`${stat.iconBg} rounded-lg p-2 sm:p-3 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View</span>
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row 1 - Weekly Activity & Task Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <BarChart3 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Weekly Activity</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-48 sm:h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : weeklyActivityData.length > 0 ? (
              <div className="w-full h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={weeklyActivityData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEquipment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280" 
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      iconSize={10}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="equipment" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorEquipment)" 
                      name="Equipment"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorTasks)" 
                      name="Tasks"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 text-sm">
                No activity data available
              </div>
            )}
          </div>

          {/* Task Status Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <PieChartIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Task Status</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-48 sm:h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : taskStatusData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2 h-40 sm:h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData as any[]}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="count"
                        paddingAngle={2}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-2">
                  {taskStatusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-xs sm:text-sm text-gray-600 flex-1">{entry.status}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 text-sm">
                No task data available
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 - Equipment, Priority, Recent Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Equipment Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Wrench className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Equipment Status</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : equipmentStatusData.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {equipmentStatusData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.percent || 0}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                No equipment data
              </div>
            )}
          </div>

          {/* Task Priority */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <AlertTriangle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Task Priority</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : taskPriorityData.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {taskPriorityData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.percent || 0}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                No priority data
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Tasks</h2>
              </div>
              <Link href="/organization/tasks" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
            </div>
            {isLoadingStats ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentTasks.slice(0, 5).map((task) => (
                  <Link 
                    key={task.id} 
                    href={`/organization/tasks/${task.id}`}
                    className="block p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1 flex-1">{task.title}</span>
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-gray-500">{task.task_number}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500">{formatDate(task.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                No recent tasks
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => setIsFacilityModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add</span> Facility
            </button>
            <button
              onClick={() => setIsBuildingModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add</span> Building
            </button>
            <button
              onClick={() => setIsEquipmentModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add</span> Equipment
            </button>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add</span> Location
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FacilityModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        onSubmit={handleFacilitySubmit}
        isLoading={isSubmitting}
      />
      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        onSubmit={handleBuildingSubmit}
        isLoading={isSubmitting}
      />
      {isEquipmentModalOpen && (
        <EquipmentModal
          equipment={null}
          onClose={() => { setIsEquipmentModalOpen(false); loadDashboardStats(); }}
        />
      )}
      {isLocationModalOpen && (
        <LocationModal
          location={null}
          onClose={() => { setIsLocationModalOpen(false); loadDashboardStats(); }}
        />
      )}
    </OrganizationLayout>
  );
}
