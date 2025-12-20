'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    Clock,
    User,
    Calendar,
    Timer,
    TrendingUp,
    Search,
    Filter,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getWorkHoursReport, getTechnicians } from '@/lib/tasks-api';

interface Technician {
    id: string;
    full_name: string;
    email: string;
}

interface TimeLogEntry {
    id: string;
    task_number: string;
    travel_started_at: string | null;
    arrived_at: string | null;
    departed_at: string | null;
    total_work_hours: number;
    normal_hours: number;
    overtime_hours: number;
}

interface ReportData {
    technician: {
        id: string;
        name: string;
        email: string;
    };
    summary: {
        total_work_hours: number;
        normal_hours: number;
        overtime_hours: number;
        total_tasks: number;
    };
    time_logs: TimeLogEntry[];
}

export default function WorkHoursReportPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedTechnician, setSelectedTechnician] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadTechnicians();
            // Set default date range (last 30 days)
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            setEndDate(end.toISOString().split('T')[0]);
            setStartDate(start.toISOString().split('T')[0]);
        }
    }, [user]);

    const loadTechnicians = async () => {
        try {
            setIsLoadingTechnicians(true);
            const response = await getTechnicians();
            setTechnicians(response.data || []);
        } catch (error: any) {
            console.error('Failed to load technicians:', error);
            toast.error('Failed to load technicians');
        } finally {
            setIsLoadingTechnicians(false);
        }
    };

    const loadReport = async () => {
        if (!selectedTechnician) {
            toast.error('Please select a technician');
            return;
        }

        try {
            setIsLoading(true);
            const response = await getWorkHoursReport(
                selectedTechnician,
                startDate || undefined,
                endDate || undefined
            );
            setReportData(response.data);
        } catch (error: any) {
            console.error('Failed to load report:', error);
            toast.error(error.message || 'Failed to load report');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatHours = (hours: number) => {
        return hours.toFixed(2) + 'h';
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="h-7 w-7 text-emerald-600" />
                            Work Hours Report
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View technician work hours and time logs
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-emerald-600" />
                        Report Filters
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Technician *
                            </label>
                            <select
                                value={selectedTechnician}
                                onChange={(e) => setSelectedTechnician(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                disabled={isLoadingTechnicians}
                            >
                                <option value="">Select technician...</option>
                                {technicians.map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={loadReport}
                                disabled={isLoading || !selectedTechnician}
                                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Results */}
                {reportData && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-100 rounded-lg">
                                        <User className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Technician</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {reportData.technician.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Timer className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Hours</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatHours(reportData.summary.total_work_hours || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Normal Hours</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatHours(reportData.summary.normal_hours || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Overtime Hours</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {formatHours(reportData.summary.overtime_hours || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Time Logs Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    Time Logs ({reportData.time_logs?.length || 0})
                                </h2>
                            </div>

                            {reportData.time_logs && reportData.time_logs.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Task
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Travel Start
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Arrived
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Departed
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Normal
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Overtime
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {reportData.time_logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-emerald-600">
                                                            {log.task_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(log.departed_at || log.arrived_at || log.travel_started_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatTime(log.travel_started_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatTime(log.arrived_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatTime(log.departed_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                        {formatHours(log.total_work_hours || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                                                        {formatHours(log.normal_hours || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 text-right">
                                                        {formatHours(log.overtime_hours || 0)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-900">
                                                    Total
                                                </td>
                                                <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                                                    {formatHours(reportData.summary.total_work_hours || 0)}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-bold text-green-600 text-right">
                                                    {formatHours(reportData.summary.normal_hours || 0)}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-bold text-orange-600 text-right">
                                                    {formatHours(reportData.summary.overtime_hours || 0)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No time logs found for the selected period</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!reportData && !isLoading && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Generate a Work Hours Report
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Select a technician and date range above, then click "Generate Report" to view their work hours summary and detailed time logs.
                        </p>
                    </div>
                )}
            </div>
        </OrganizationLayout>
    );
}
