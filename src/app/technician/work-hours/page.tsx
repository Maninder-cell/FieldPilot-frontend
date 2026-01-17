'use client';

import { useState, useEffect } from 'react';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import {
    BarChart3,
    Clock,
    Calendar,
    TrendingUp,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { getWorkHoursReport, WorkHoursSummary } from '@/lib/technician-tasks-api';
import toast from 'react-hot-toast';

export default function WorkHoursPage() {
    const [workHours, setWorkHours] = useState<WorkHoursSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        // Set default date range based on selection
        const today = new Date();
        let start: Date;
        let end: Date = today;

        if (dateRange === 'week') {
            start = new Date(today);
            start.setDate(today.getDate() - 7);
        } else if (dateRange === 'month') {
            start = new Date(today);
            start.setDate(today.getDate() - 30);
        } else {
            // Custom range - don't auto-load
            return;
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, [dateRange]);

    useEffect(() => {
        if (startDate && endDate) {
            loadWorkHours();
        }
    }, [startDate, endDate]);

    const loadWorkHours = async () => {
        try {
            setIsLoading(true);
            const response = await getWorkHoursReport(startDate, endDate);
            setWorkHours(response.data);
        } catch (error: any) {
            console.error('Failed to load work hours:', error);
            toast.error(error.message || 'Failed to load work hours');
        } finally {
            setIsLoading(false);
        }
    };

    const formatHours = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    return (
        <TechnicianLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Work Hours Report</h1>
                    <p className="mt-1 text-gray-600">View your work hours and overtime</p>
                </div>

                {/* Date Range Selector */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Quick Select */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDateRange('week')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateRange === 'week'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Last 7 Days
                            </button>
                            <button
                                onClick={() => setDateRange('month')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateRange === 'month'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Last 30 Days
                            </button>
                            <button
                                onClick={() => setDateRange('custom')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateRange === 'custom'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Custom Range
                            </button>
                        </div>

                        {/* Custom Date Inputs */}
                        {dateRange === 'custom' && (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <button
                                    onClick={loadWorkHours}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : workHours ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Hours */}
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="h-8 w-8 opacity-80" />
                                    <TrendingUp className="h-5 w-5 opacity-60" />
                                </div>
                                <p className="text-sm opacity-90 mb-1">Total Hours</p>
                                <p className="text-3xl font-bold">{formatHours(workHours.total_hours)}</p>
                            </div>

                            {/* Normal Hours */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Normal Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatHours(workHours.normal_hours)}</p>
                            </div>

                            {/* Overtime Hours */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Overtime Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatHours(workHours.overtime_hours)}</p>
                            </div>

                            {/* Travel Hours */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Travel Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatHours(workHours.travel_hours)}</p>
                            </div>
                        </div>

                        {/* Daily Breakdown */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    Daily Breakdown
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Normal Hours
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Overtime Hours
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Travel Hours
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {workHours.by_date.length > 0 ? (
                                            workHours.by_date.map((day, index) => {
                                                const total = day.normal_hours + day.overtime_hours + day.travel_hours;
                                                return (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {new Date(day.date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {formatHours(day.normal_hours)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {formatHours(day.overtime_hours)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {formatHours(day.travel_hours)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                            {formatHours(total)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    No work hours recorded for this period
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                        <p className="text-gray-600">Select a date range to view your work hours</p>
                    </div>
                )}
            </div>
        </TechnicianLayout>
    );
}
