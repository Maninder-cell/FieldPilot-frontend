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
} from 'lucide-react';
import { getCustomerDashboardData, type CustomerDashboardData } from '@/lib/customer-api';
import toast from 'react-hot-toast';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
} from 'recharts';

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

    // Load dashboard data
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

    if (authLoading || isLoading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                    <div className="text-center">
                        <Clock className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (!dashboardData) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                        <p className="text-gray-600">Failed to load dashboard</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    const stats = dashboardData.metrics;

    // Prepare chart data
    const statusData = [
        { name: 'Completed', value: stats.completed_requests, color: '#10b981' },
        { name: 'In Progress', value: stats.in_progress_requests, color: '#3b82f6' },
        { name: 'Pending', value: stats.pending_requests, color: '#f59e0b' },
    ].filter(item => item.value > 0);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-100 text-emerald-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-orange-100 text-orange-800';
            case 'under_review':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    Welcome back, {user?.full_name || user?.email}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/customer/requests/new')}
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Wrench className="h-5 w-5" />
                                New Service Request
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Pending Requests */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-2">
                                        {stats.pending_requests}
                                    </p>
                                </div>
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                                        {stats.in_progress_requests}
                                    </p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Activity className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Completed */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
                                        {stats.completed_requests}
                                    </p>
                                </div>
                                <div className="bg-emerald-100 p-3 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Equipment */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Assets</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                                        {stats.total_equipment}
                                    </p>
                                </div>
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <Package className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Request Status Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Status</h2>
                            {statusData.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    No requests yet
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                {dashboardData.recent_activity.length > 0 ? (
                                    dashboardData.recent_activity.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/customer/requests/${activity.id}`)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {activity.request_number}
                                                </p>
                                            </div>
                                            <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(activity.status)}`}>
                                                {formatStatus(activity.status)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Equipment Requiring Attention */}
                    {dashboardData.equipment_requiring_attention.length > 0 && (
                        <div className="mt-6 sm:mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                Equipment Requiring Attention
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dashboardData.equipment_requiring_attention.map((equipment) => (
                                    <div
                                        key={equipment.id}
                                        className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/customer/equipment/${equipment.id}`)}
                                    >
                                        <p className="font-medium text-gray-900">{equipment.name}</p>
                                        <p className="text-sm text-gray-600 mt-1">{equipment.location || 'No location'}</p>
                                        <span className="inline-block mt-2 px-2.5 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">
                                            {formatStatus(equipment.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Services */}
                    {dashboardData.upcoming_services.length > 0 && (
                        <div className="mt-6 sm:mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                Upcoming Services
                            </h2>
                            <div className="space-y-3">
                                {dashboardData.upcoming_services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{service.equipment_name || 'Equipment'}</p>
                                            <p className="text-sm text-gray-600 mt-1">{service.task_number}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-blue-600">
                                                {new Date(service.scheduled_start).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(service.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
