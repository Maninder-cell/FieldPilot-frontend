'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    Timer,
    Play,
    Eye,
    Car,
    MapPin,
    LogOut as LogOutIcon,
    Coffee,
    Camera,
    FileText,
    Package,
    BarChart3,
    Flame,
    AlertCircle,
    TrendingUp,
    Calendar,
    Activity,
} from 'lucide-react';
import { getDashboardData, type DashboardData } from '@/lib/technician-tasks-api';
import toast from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from 'recharts';

export default function TechnicianDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Load dashboard data
    useEffect(() => {
        if (user) {
            loadDashboard();
        }
    }, [user]);

    const loadDashboard = async () => {
        try {
            setIsLoading(true);
            const response = await getDashboardData();
            setDashboardData(response.data);
        } catch (error: any) {
            console.error('Failed to load dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <TechnicianLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Clock className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </TechnicianLayout>
        );
    }

    if (!user || !dashboardData) {
        return null;
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
            case 'critical':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const { stats, current_task, today_tasks, weekly_hours, priority_breakdown, recent_activity } = dashboardData;

    // Prepare data for charts
    const priorityData = [
        { name: 'High', value: priority_breakdown.high, color: '#ef4444' },
        { name: 'Medium', value: priority_breakdown.medium, color: '#f59e0b' },
        { name: 'Low', value: priority_breakdown.low, color: '#3b82f6' },
    ].filter(item => item.value > 0);

    const weeklyHoursData = weekly_hours.map(item => ({
        day: item.day,
        hours: item.hours,
        target: 8,
        isToday: item.is_today,
    }));

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-sm text-emerald-600">
                        Hours: {payload[0].value.toFixed(1)}h
                    </p>
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];

    return (
        <TechnicianLayout>
            <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-0">
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight">
                                👋 Welcome back, {user.full_name}!
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm lg:text-base text-emerald-50">Here's your day at a glance</p>
                        </div>
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                            <p className="text-base sm:text-lg lg:text-xl font-semibold">{formatTime(currentTime)}</p>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                                <span className="text-xs sm:text-sm font-medium">On Duty</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">Today's Tasks</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.today_tasks}</p>
                        <p className="text-xs text-gray-500 mt-1">tasks</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">Active</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.active_tasks}</p>
                        <p className="text-xs text-gray-500 mt-1">in progress</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">Completed</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.completed_today}</p>
                        <p className="text-xs text-gray-500 mt-1">today</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">Hours Today</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.hours_today.toFixed(1)}h</p>
                        <p className="text-xs text-gray-500 mt-1">worked</p>
                    </div>
                </div>

                {/* Current Task Card */}
                {current_task && (
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Currently Working On</h2>
                        </div>

                        <div className="bg-white rounded-lg p-3 sm:p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{current_task.task_number}: {current_task.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-semibold ${getPriorityColor(current_task.priority)}`}>
                                            {current_task.priority.toUpperCase()}
                                        </span>
                                        {current_task.started_at && (
                                            <span className="flex items-center gap-1">
                                                <Activity className="h-4 w-4" />
                                                Duration: {formatDuration(current_task.duration_minutes)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {current_task.equipment && (
                                <div className="mb-4 text-sm">
                                    <p className="text-gray-500 font-medium">Equipment</p>
                                    <p className="text-gray-900">{current_task.equipment}</p>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => router.push(`/technician/tasks/${current_task.id}`)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Charts & Progress */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Weekly Hours Chart */}
                        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
                            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                <span className="truncate">Weekly Hours</span>
                            </h2>
                            <div className="h-48 sm:h-64 lg:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyHoursData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="day"
                                            stroke="#6b7280"
                                            style={{ fontSize: '10px' }}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            style={{ fontSize: '10px' }}
                                            tick={{ fontSize: 10 }}
                                            label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="hours"
                                            fill="#10b981"
                                            radius={[8, 8, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="target"
                                            fill="#3b82f6"
                                            radius={[8, 8, 0, 0]}
                                            opacity={0.4}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded"></div>
                                    <span className="text-gray-600">Actual</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded opacity-40"></div>
                                    <span className="text-gray-600">Target (8h)</span>
                                </div>
                            </div>
                        </div>

                        {/* Today's Progress & Priority Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Today's Progress */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    Today's Progress
                                </h2>

                                <div className="space-y-4">
                                    {/* Completion Rate */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">Task Completion</span>
                                            <span className="text-emerald-600 font-bold">{stats.completion_rate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${stats.completion_rate}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {stats.completed_today} of {stats.today_tasks} tasks
                                        </p>
                                    </div>

                                    {/* Hours Progress */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">Work Hours</span>
                                            <span className="text-purple-600 font-bold">{stats.hours_today.toFixed(1)}h / 8h</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((stats.hours_today / 8) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Priority Breakdown Pie Chart */}
                            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
                                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Priority Breakdown</h2>
                                {priorityData.length > 0 ? (
                                    <div className="h-40 sm:h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={priorityData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                    outerRadius={50}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    {priorityData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 sm:py-8">
                                        <p className="text-gray-500 text-xs sm:text-sm">No tasks for today</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Today's Tasks List */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    Upcoming Tasks
                                </h2>
                                <button
                                    onClick={() => router.push('/technician/tasks')}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    View All →
                                </button>
                            </div>

                            {today_tasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No upcoming tasks</p>
                                    <p className="text-sm text-gray-400 mt-1">Great job! You're all caught up.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {today_tasks.slice(0, 3).map((task) => (
                                        <div
                                            key={task.id}
                                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
                                            onClick={() => router.push(`/technician/tasks/${task.id}`)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{task.task_number}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1">{task.title}</p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                        {task.equipment && (
                                                            <span className="text-xs text-gray-500">{task.equipment}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/technician/tasks/${task.id}`);
                                                    }}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-medium"
                                                >
                                                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    Start
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/technician/tasks/${task.id}`);
                                                    }}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                                                >
                                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Summary & Activity */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Weekly Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">📊 Week Summary</h2>
                                <button
                                    onClick={() => router.push('/technician/work-hours')}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    View Report →
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.hours_this_week.toFixed(1)}h</p>
                                    <p className="text-xs text-gray-500 mt-1">of 40h target</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs text-gray-600 mb-1">Completion</p>
                                        <p className="text-xl font-bold text-blue-600">{stats.completion_rate}%</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <p className="text-xs text-gray-600 mb-1">Tasks Done</p>
                                        <p className="text-xl font-bold text-purple-600">{stats.completed_today}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">🕐 Recent Activity</h2>
                            {recent_activity.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No recent activity</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recent_activity.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">{item.action}</p>
                                                <p className="text-xs text-gray-500">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TechnicianLayout>
    );
}
