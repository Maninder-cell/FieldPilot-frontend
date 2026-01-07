'use client';

import { useState, useEffect } from 'react';
import {
    Clock,
    Car,
    MapPin,
    LogOut,
    Coffee,
    Play,
    CheckCircle2,
    AlertCircle,
    Timer,
    User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    logTravel,
    logArrival,
    logDeparture,
    logLunchStart,
    logLunchEnd,
    getTimeLogs,
} from '@/lib/tasks-api';
import { TimeLog } from '@/types/tasks';

interface TaskTimeTrackingProps {
    taskId: string;
}

export default function TaskTimeTracking({ taskId }: TaskTimeTrackingProps) {
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showDepartureModal, setShowDepartureModal] = useState(false);

    // Get the active (current) time log - one that has travel started but not departed
    const activeLog = timeLogs.find((log) => log.travel_started_at && !log.departed_at);

    useEffect(() => {
        loadTimeLogs();
    }, [taskId]);

    const loadTimeLogs = async () => {
        try {
            setIsLoading(true);
            const response = await getTimeLogs(taskId);
            setTimeLogs(response.data || []);
        } catch (error: any) {
            console.error('Failed to load time logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTravel = async () => {
        try {
            setActionLoading('travel');
            await logTravel(taskId);
            toast.success('Travel started');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to log travel');
        } finally {
            setActionLoading(null);
        }
    };

    const handleArrival = async () => {
        try {
            setActionLoading('arrival');
            await logArrival(taskId);
            toast.success('Arrival logged');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to log arrival');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeparture = async (equipmentStatus: 'functional' | 'shutdown') => {
        try {
            setActionLoading('departure');
            await logDeparture(taskId, equipmentStatus);
            toast.success('Departure logged');
            setShowDepartureModal(false);
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to log departure');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLunchStart = async () => {
        try {
            setActionLoading('lunch_start');
            await logLunchStart(taskId);
            toast.success('Lunch break started');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to start lunch');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLunchEnd = async () => {
        try {
            setActionLoading('lunch_end');
            await logLunchEnd(taskId);
            toast.success('Lunch break ended');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to end lunch');
        } finally {
            setActionLoading(null);
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatHours = (hours: number) => {
        return hours.toFixed(2) + 'h';
    };

    const getCurrentStatus = () => {
        if (!activeLog) return 'not_started';
        if (activeLog.is_on_lunch) return 'on_lunch';
        if (activeLog.is_on_site) return 'on_site';
        if (activeLog.is_traveling) return 'traveling';
        return 'not_started';
    };

    const status = getCurrentStatus();

    // Calculate total hours from all logs
    const totalHours = timeLogs.reduce((sum, log) => sum + (log.total_work_hours || 0), 0);
    const totalNormalHours = timeLogs.reduce((sum, log) => sum + (log.normal_hours || 0), 0);
    const totalOvertimeHours = timeLogs.reduce((sum, log) => sum + (log.overtime_hours || 0), 0);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Time Tracking</h2>
                </div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Time Tracking
                </h2>
                {status !== 'not_started' && (
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            status === 'on_site'
                                ? 'bg-green-100 text-green-800'
                                : status === 'traveling'
                                  ? 'bg-blue-100 text-blue-800'
                                  : status === 'on_lunch'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {status === 'on_site'
                            ? '🟢 On Site'
                            : status === 'traveling'
                              ? '🚗 Traveling'
                              : status === 'on_lunch'
                                ? '☕ On Lunch'
                                : 'Not Started'}
                    </span>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                    {/* Start Travel */}
                    <button
                        onClick={handleTravel}
                        disabled={actionLoading !== null || status !== 'not_started'}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Car className="h-4 w-4" />
                        <span className="text-sm font-medium">Start Travel</span>
                    </button>

                    {/* Log Arrival */}
                    <button
                        onClick={handleArrival}
                        disabled={actionLoading !== null || status !== 'traveling'}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Log Arrival</span>
                    </button>

                    {/* Lunch Start/End */}
                    {status === 'on_lunch' ? (
                        <button
                            onClick={handleLunchEnd}
                            disabled={actionLoading !== null}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Play className="h-4 w-4" />
                            <span className="text-sm font-medium">End Lunch</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleLunchStart}
                            disabled={actionLoading !== null || status !== 'on_site'}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Coffee className="h-4 w-4" />
                            <span className="text-sm font-medium">Start Lunch</span>
                        </button>
                    )}

                    {/* Log Departure */}
                    <button
                        onClick={() => setShowDepartureModal(true)}
                        disabled={actionLoading !== null || status !== 'on_site'}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Log Departure</span>
                    </button>
                </div>
            </div>

            {/* Hours Summary */}
            {timeLogs.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Hours Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{formatHours(totalHours)}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{formatHours(totalNormalHours)}</p>
                            <p className="text-xs text-gray-500">Normal</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{formatHours(totalOvertimeHours)}</p>
                            <p className="text-xs text-gray-500">Overtime</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Logs List */}
            {timeLogs.length === 0 ? (
                <div className="text-center py-6">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No time logs yet</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {timeLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">
                                        {log.technician_name || 'Technician'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                                <div>
                                    <p className="text-gray-500">Travel</p>
                                    <p className="font-medium">{formatTime(log.travel_started_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Arrived</p>
                                    <p className="font-medium">{formatTime(log.arrived_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Departed</p>
                                    <p className="font-medium">{formatTime(log.departed_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Hours</p>
                                    <p className="font-medium text-emerald-600">
                                        {log.total_work_hours ? formatHours(log.total_work_hours) : '-'}
                                    </p>
                                </div>
                            </div>
                            {log.equipment_status_at_departure && (
                                <div className="mt-2 flex items-center gap-1">
                                    {log.equipment_status_at_departure === 'functional' ? (
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-3 w-3 text-red-600" />
                                    )}
                                    <span
                                        className={`text-xs ${log.equipment_status_at_departure === 'functional' ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        Equipment: {log.equipment_status_at_departure}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Departure Modal */}
            {showDepartureModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDepartureModal(false)} />
                        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Departure</h3>
                            <p className="text-sm text-gray-600 mb-4">What is the equipment status?</p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleDeparture('functional')}
                                    disabled={actionLoading !== null}
                                    className="w-full flex items-center gap-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Functional</p>
                                        <p className="text-sm text-gray-500">Equipment is working properly</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleDeparture('shutdown')}
                                    disabled={actionLoading !== null}
                                    className="w-full flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Shutdown</p>
                                        <p className="text-sm text-gray-500">Equipment is not working</p>
                                    </div>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowDepartureModal(false)}
                                className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
