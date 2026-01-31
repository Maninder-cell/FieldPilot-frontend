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
  TrendingUp, 
  Activity,
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';
import { CreateFacilityRequest } from '@/types/facilities';
import { CreateBuildingRequest } from '@/types/buildings';
import { 
  getDashboardStats, 
  getTaskStatusBreakdown, 
  getEquipmentStatusBreakdown, 
  getWeeklyActivitySimple,
  getTaskPriorityBreakdown,
  getRecentTasks
} from '@/lib/dashboard-api';
import { toast } from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
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
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [equipmentStatusData, setEquipmentStatusData] = useState<any[]>([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([]);
  const [taskPriorityData, setTaskPriorityData] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

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

  // Load dashboard stats
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const [statsData, taskStatus, equipmentStatus, weeklyActivity, taskPriority, recent] = await Promise.all([
        getDashboardStats(),
        getTaskStatusBreakdown(),
        getEquipmentStatusBreakdown(),
        getWeeklyActivitySimple(),
        getTaskPriorityBreakdown(),
        getRecentTasks(5),
      ]);
      
      setStats(statsData);
      setTaskStatusData(taskStatus);
      setEquipmentStatusData(equipmentStatus);
      setWeeklyActivityData(weeklyActivity);
      setTaskPriorityData(taskPriority);
      setRecentTasks(recent);
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Handler functions for modal submissions
  const handleFacilitySubmit = async (data: CreateFacilityRequest) => {
    setIsSubmitting(true);
    try {
      console.log('Creating facility:', data);
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
      console.log('Creating building:', data);
      setIsBuildingModalOpen(false);
      loadDashboardStats();
    } catch (error) {
      console.error('Error creating building:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEquipmentClose = () => {
    setIsEquipmentModalOpen(false);
    loadDashboardStats();
  };

  const handleLocationClose = () => {
    setIsLocationModalOpen(false);
    loadDashboardStats();
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

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
    {
      name: 'Total Facilities',
      value: stats.facilities_count,
      icon: Home,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      href: '/organization/facilities',
    },
    {
      name: 'Total Buildings',
      value: stats.buildings_count,
      icon: Building2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/organization/buildings',
    },
    {
      name: 'Total Equipment',
      value: stats.equipment_count,
      icon: Wrench,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: '/organization/equipment',
    },
    {
      name: 'Total Locations',
      value: stats.locations_count,
      icon: MapPin,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      href: '/organization/locations',
    },
    {
      name: 'Total Tasks',
      value: stats.tasks_count,
      icon: ClipboardList,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      href: '/organization/tasks',
    },
    {
      name: 'Open Tasks',
      value: stats.open_tasks_count,
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      href: '/organization/tasks?status=new',
    },
    {
      name: 'Teams',
      value: stats.teams_count,
      icon: Users,
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      href: '/organization/teams',
    },
    {
      name: 'Customers',
      value: stats.customers_count,
      icon: Users,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      href: '/organization/customers',
    },
  ];

  return (
    <OrganizationLayout>
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome to {tenant?.name || 'your'} organization portal
            </p>
          </div>
          <button
            onClick={loadDashboardStats}
            disabled={isLoadingStats}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {isLoadingStats ? (
                      <span className="inline-block animate-pulse bg-gray-200 rounded h-9 w-12"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`${stat.iconBg} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View details</span>
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Section - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : weeklyActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyActivityData}>
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
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="tasks" stroke="#10b981" fillOpacity={1} fill="url(#colorTasks)" name="Tasks" />
                  <Area type="monotone" dataKey="equipment" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquipment)" name="Equipment" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No activity data available
              </div>
            )}
          </div>

          {/* Task Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Task Status</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : taskStatusData.length > 0 ? (
              <div className="flex items-center">
                <ResponsiveContainer width="60%" height={280}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
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
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-40% space-y-2">
                  {taskStatusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-sm text-gray-600">{entry.status}</span>
                      <span className="text-sm font-semibold text-gray-900 ml-auto">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No task data available
              </div>
            )}
          </div>
        </div>

        {/* Charts Section - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Wrench className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Equipment Status</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : equipmentStatusData.length > 0 ? (
              <div className="space-y-4">
                {equipmentStatusData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(item.percent || 0) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No equipment data available
              </div>
            )}
          </div>

          {/* Task Priority */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Task Priority</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : taskPriorityData.length > 0 ? (
              <div className="space-y-4">
                {taskPriorityData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(item.percent || 0) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No priority data available
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              </div>
              <Link href="/organization/tasks" className="text-sm text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
            </div>
            {isLoadingStats ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <Link 
                    key={task.id} 
                    href={`/organization/tasks/${task.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{task.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{task.task_number}</span>
                      <span className="text-xs text-gray-500">{formatDate(task.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No recent tasks
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => setIsFacilityModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              Add Facility
            </button>
            <button
              onClick={() => setIsBuildingModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Building2 className="h-5 w-5" />
              Add Building
            </button>
            <button
              onClick={() => setIsEquipmentModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Wrench className="h-5 w-5" />
              Add Equipment
            </button>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <MapPin className="h-5 w-5" />
              Add Location
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
          onClose={handleEquipmentClose}
        />
      )}
      {isLocationModalOpen && (
        <LocationModal
          location={null}
          onClose={handleLocationClose}
        />
      )}
    </OrganizationLayout>
  );
}
