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
    Plus,
    TrendingUp,
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
            completed: 'bg-emerald-100 text-emerald-700',
            in_progress: 'bg-blue-100 text-blue-700',
            pending: 'bg-orange-100 text-orange-700',
            under_review: 'bg-purple-100 text-purple-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const formatStatus = (status: string) =>
        status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
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
    const totalRequests = (stats?.pending_requests || 0) + (stats?.in_progress_requests || 0) + (stats?.completed_requests || 0);
    const statusData = stats ? [
        { name: 'Completed', value: stats.completed_requests, color: '#10b981' },
        { name: 'In Progress', value: stats.in_progress_requests, color: '#3b82f6' },
        { name: 'Pending', value: stats.pending_requests, color: '#f59e0b' },
    ].filter(item => item.value > 0) : [];

    return (
        <CustomerLayout>
            <div className="bg-gray-50 min-h-full">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">
                                {getGreeting()}, {user?.first_name || 'there'}
                            </h1>
                            <p className="text-emerald-100 text-sm mt-1">
                                Here&apos;s an overview of your service requests and equipment
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadDashboard}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <Link
                                href="/customer/requests/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                New Request
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: 'Pending', value: stats?.pending_requests, color: 'orange', icon: Clock },
                            { label: 'In Progress', value: stats?.in_progress_requests, color: 'blue', icon: Activity },
                            { label: 'Completed', value: stats?.completed_requests, color: 'emerald', icon: CheckCircle2 },
                            { label: 'My Assets', value: stats?.total_equipment, color: 'violet', icon: Package },
                        ].map((stat) => {
                            const Icon = stat.icon;
                            const colorMap: Record<string, { iconBg: string; text: string }> = {
                                orange: { iconBg: 'bg-orange-100', text: 'text-orange-600' },
                                blue: { iconBg: 'bg-blue-100', text: 'text-blue-600' },
                                emerald: { iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
                                violet: { iconBg: 'bg-violet-100', text: 'text-violet-600' },
                            };
                            const c = colorMap[stat.color];
                            return (
                                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</p>
                                            <p className={`text-2xl sm:text-3xl font-bold ${c.text} mt-1`}>
                                                {isLoading ? (
                                                    <span className="inline-block animate-pulse bg-gray-200 rounded h-8 w-10"></span>
                                                ) : (stat.value || 0)}
                                            </p>
                                        </div>
                                        <div className={`${c.iconBg} p-2.5 rounded-xl`}>
                                            <Icon className={`h-5 w-5 ${c.text}`} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Request Status Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    <h2 className="text-sm sm:text-base font-semibold text-gray-900">Request Overview</h2>
                                </div>
                                <Link href="/customer/requests" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    View all <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            <div className="p-5">
                                {isLoading ? (
                                    <div className="h-52 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                    </div>
                                ) : statusData.length > 0 ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="w-full sm:w-1/2 h-44 sm:h-52 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" dataKey="value" paddingAngle={3} strokeWidth={0}>
                                                        {statusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-2xl font-bold text-gray-900">{totalRequests}</span>
                                                <span className="text-xs text-gray-500">Total</span>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2 space-y-3">
                                            {statusData.map((entry, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
                                                    <span className="text-sm text-gray-600 flex-1">{entry.name}</span>
                                                    <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-52 flex flex-col items-center justify-center">
                                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <ClipboardList className="h-7 w-7 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No requests yet</p>
                                        <Link href="/customer/requests/new" className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                            Create your first request <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-sm sm:text-base font-semibold text-gray-900">Recent Activity</h2>
                                </div>
                                <Link href="/customer/requests" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    View all <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            <div className="p-4 sm:p-5">
                                {isLoading ? (
                                    <div className="h-52 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                    </div>
                                ) : dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
                                    <div className="space-y-2">
                                        {dashboardData.recent_activity.slice(0, 5).map((activity) => (
                                            <Link key={activity.id} href={`/customer/requests/${activity.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{activity.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{activity.request_number}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${getStatusColor(activity.status)}`}>
                                                    {formatStatus(activity.status)}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-52 flex flex-col items-center justify-center">
                                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <Activity className="h-7 w-7 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Equipment Requiring Attention */}
                    {dashboardData?.equipment_requiring_attention && dashboardData.equipment_requiring_attention.length > 0 && (
                        <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-orange-100 bg-orange-50/50">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                <h2 className="text-sm sm:text-base font-semibold text-gray-900">Equipment Requiring Attention</h2>
                                <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                    {dashboardData.equipment_requiring_attention.length}
                                </span>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {dashboardData.equipment_requiring_attention.map((equipment) => (
                                        <Link key={equipment.id} href={`/customer/equipment/${equipment.id}`} className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                                                    <Wrench className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 text-sm truncate group-hover:text-orange-700 transition-colors">{equipment.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{equipment.location || 'No location'}</p>
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] sm:text-xs font-semibold">
                                                        {formatStatus(equipment.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Services */}
                    {dashboardData?.upcoming_services && dashboardData.upcoming_services.length > 0 && (
                        <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-blue-100 bg-blue-50/50">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <h2 className="text-sm sm:text-base font-semibold text-gray-900">Upcoming Services</h2>
                                <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                    {dashboardData.upcoming_services.length}
                                </span>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="space-y-2">
                                    {dashboardData.upcoming_services.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between p-3 sm:p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{service.equipment_name || 'Equipment Service'}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{service.task_number}</p>
                                                </div>
                                            </div>
                                            <div className="text-right ml-3 shrink-0">
                                                <p className="text-sm font-semibold text-blue-600">{formatDate(service.scheduled_start)}</p>
                                                <p className="text-xs text-gray-400">{formatTime(service.scheduled_start)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
