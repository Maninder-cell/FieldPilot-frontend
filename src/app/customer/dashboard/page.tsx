'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    Package,
    AlertCircle,
    Calendar,
    Activity,
    Wrench,
    RefreshCw,
    ArrowRight,
    ChevronRight,
} from 'lucide-react';
import { getCustomerDashboardData, type CustomerDashboardData } from '@/lib/customer-api';
import toast from 'react-hot-toast';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import Link from 'next/link';

export default function CustomerDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<CustomerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadDashboard();
        }
    }, [user]);

    const loadDashboard = async () => {
        try {
            setIsLoading(true);
            const data = await getCustomerDashboardData();
            setDashboardData(data);
        } catch (error: any) {
            console.error('Failed to load dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            completed: 'bg-emerald-100 text-emerald-800',
            in_progress: 'bg-blue-100 text-blue-800',
            pending: 'bg-orange-100 text-orange-800',
            under_review: 'bg-purple-100 text-purple-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    if (authLoading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                </div>
            </CustomerLayout>
        );
    }

    const stats = dashboardData?.metrics;
    const statusData = stats ? [
        { name: 'Completed', value: stats.completed_requests, color: '#10b981' },
        { name: 'In Progress', value: stats.in_progress_requests, color: '#3b82f6' },
        { name: 'Pending', value: stats.pending_requests, color: '#f59e0b' },
    ].filter(item => item.value > 0) : [];

    return (
        <CustomerLayout>
            <div className="bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    Welcome back, {user?.full_name || 'Customer'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={loadDashboard}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                                <Link
                                    href="/customer/requests/new"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Wrench className="h-4 w-4" />
                                    <span className="hidden sm:inline">New</span> Request
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1">
                                        {isLoading ? (
                                            <span className="inline-block animate-pulse bg-gray-200 rounded h-8 w-10"></span>
                                        ) : (
                                            stats?.pending_requests || 0
                                        )}
                                    </p>
                                </div>
                                <div className="bg-orange-100 p-2 sm:p-2.5 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
                                        {isLoading ? (
                                            <span className="inline-block animate-pulse bg-gray-200 rounded h-8 w-10"></span>
                                        ) : (
                                            stats?.in_progress_requests || 0
                                        )}
                                    </p>
                                </div>
                                <div className="bg-blue-100 p-2 sm:p-2.5 rounded-lg">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
                                        {isLoading ? (
                                            <span className="inline-block animate-pulse bg-gray-200 rounded h-8 w-10"></span>
                                        ) : (
                                            stats?.completed_requests || 0
                                        )}
                                    </p>
                                </div>
                                <div className="bg-emerald-100 p-2 sm:p-2.5 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">My Assets</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                                        {isLoading ? (
                                            <span className="inline-block animate-pulse bg-gray-200 rounded h-8 w-10"></span>
                                        ) : (
                                            stats?.total_equipment || 0
                                        )}
                                    </p>
                                </div>
                                <div className="bg-gray-100 p-2 sm:p-2.5 rounded-lg">
                                    <Package className="h-5 w-5 text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Request Status Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Request Status</h2>
                                <Link 
                                    href="/customer/requests" 
                                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                >
                                    View all <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                            {isLoading ? (
                                <div className="h-48 sm:h-56 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : statusData.length > 0 ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-full sm:w-1/2 h-40 sm:h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="45%"
                                                    outerRadius="75%"
                                                    dataKey="value"
                                                    paddingAngle={2}
                                                >
                                                    {statusData.map((entry, index) => (
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
                                        {statusData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
                                                <span className="text-xs sm:text-sm text-gray-600 flex-1">{entry.name}</span>
                                                <span className="text-xs sm:text-sm font-semibold text-gray-900">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 sm:h-56 flex flex-col items-center justify-center text-gray-500">
                                    <ClipboardList className="h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-sm">No requests yet</p>
                                    <Link 
                                        href="/customer/requests/new"
                                        className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                        Create your first request <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
                                <Link 
                                    href="/customer/requests" 
                                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                >
                                    View all <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                            {isLoading ? (
                                <div className="h-48 sm:h-56 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
                                <div className="space-y-2">
                                    {dashboardData.recent_activity.slice(0, 5).map((activity) => (
                                        <Link
                                            key={activity.id}
                                            href={`/customer/requests/${activity.id}`}
                                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0 mr-3">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {activity.request_number}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${getStatusColor(activity.status)}`}>
                                                {formatStatus(activity.status)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 sm:h-56 flex flex-col items-center justify-center text-gray-500">
                                    <Activity className="h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-sm">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Equipment Requiring Attention */}
                    {dashboardData?.equipment_requiring_attention && dashboardData.equipment_requiring_attention.length > 0 && (
                        <div className="bg-white rounded-xl border border-orange-200 p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Equipment Requiring Attention</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dashboardData.equipment_requiring_attention.map((equipment) => (
                                    <Link
                                        key={equipment.id}
                                        href={`/customer/equipment/${equipment.id}`}
                                        className="p-3 sm:p-4 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors"
                                    >
                                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{equipment.name}</p>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{equipment.location || 'No location'}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-[10px] sm:text-xs font-medium">
                                            {formatStatus(equipment.status)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Services */}
                    {dashboardData?.upcoming_services && dashboardData.upcoming_services.length > 0 && (
                        <div className="bg-white rounded-xl border border-blue-200 p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Services</h2>
                            </div>
                            <div className="space-y-2">
                                {dashboardData.upcoming_services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                                {service.equipment_name || 'Equipment Service'}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{service.task_number}</p>
                                        </div>
                                        <div className="text-right ml-3 shrink-0">
                                            <p className="text-sm font-medium text-blue-600">
                                                {formatDate(service.scheduled_start)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatTime(service.scheduled_start)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
