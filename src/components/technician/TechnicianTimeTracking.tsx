'use client';

import { useState, useEffect } from 'react';
import {
    Clock,
    Car,
    MapPin,
    LogOut,
    Coffee,
    AlertCircle,
    User,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    startTravel,
    logArrival,
    logDeparture,
    startLunch,
    endLunch,
    getTimeLogs,
    TimeLog,
} from '@/lib/technician-tasks-api';

interface TechnicianTimeTrackingProps {
    taskId: string;
}

export default function TechnicianTimeTracking({ taskId }: TechnicianTimeTrackingProps) {
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadTimeLogs();
    }, [taskId]);

    const loadTimeLogs = async () => {
        try {
            setIsLoading(true);
            const response = await getTimeLogs(taskId);
            // Handle response.data which contains the array
            setTimeLogs(response.data || []);
        } catch (error) {
            console.error('Failed to load time logs:', error);
            setTimeLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTravel = async () => {
        try {
            setIsSubmitting(true);
            await startTravel(taskId);
            toast.success('Travel started');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to start travel');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArrival = async () => {
        try {
            setIsSubmitting(true);
            await logArrival(taskId);
            toast.success('Arrival logged');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to log arrival');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeparture = async (equipmentStatus: 'functional' | 'shutdown') => {
        try {
            setIsSubmitting(true);
            await logDeparture(taskId, equipmentStatus);
            toast.success('Departure logged');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to log departure');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLunchStart = async () => {
        try {
            setIsSubmitting(true);
            await startLunch(taskId);
            toast.success('Lunch break started');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to start lunch');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLunchEnd = async () => {
        try {
            setIsSubmitting(true);
            await endLunch(taskId);
            toast.success('Lunch break ended');
            await loadTimeLogs();
        } catch (error: any) {
            toast.error(error.message || 'Failed to end lunch');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return 'Not logged';
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

    const getCurrentStatus = () => {
        if (timeLogs.length === 0) return null;
        const latest = timeLogs[0];

        if (latest.departed_at) return 'departed';
        if (latest.lunch_ended_at) return 'working';
        if (latest.lunch_started_at) return 'lunch';
        if (latest.arrived_at) return 'on_site';
        if (latest.travel_started_at) return 'traveling';
        return null;
    };

    const currentStatus = getCurrentStatus();

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Time Tracking
            </h2>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={handleTravel}
                    disabled={isSubmitting || currentStatus === 'traveling'}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                >
                    <Car className="h-4 w-4" />
                    <span className="text-sm font-medium">Start Travel</span>
                </button>

                <button
                    onClick={handleArrival}
                    disabled={isSubmitting || currentStatus !== 'traveling'}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                >
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Log Arrival</span>
                </button>

                <button
                    onClick={handleLunchStart}
                    disabled={isSubmitting || currentStatus === 'lunch' || (currentStatus !== 'working' && currentStatus !== 'on_site')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200"
                >
                    <Coffee className="h-4 w-4" />
                    <span className="text-sm font-medium">Start Lunch</span>
                </button>

                <button
                    onClick={handleLunchEnd}
                    disabled={isSubmitting || currentStatus !== 'lunch'}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-200"
                >
                    <Coffee className="h-4 w-4" />
                    <span className="text-sm font-medium">End Lunch</span>
                </button>

                <button
                    onClick={() => handleDeparture('functional')}
                    disabled={isSubmitting || (currentStatus !== 'working' && currentStatus !== 'on_site')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 col-span-2"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Log Departure</span>
                </button>
            </div>

            {/* Time Logs List - Show only latest */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-spin" />
                        <p className="text-gray-500 text-sm">Loading time logs...</p>
                    </div>
                ) : timeLogs.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No time logs yet</p>
                        <p className="text-gray-400 text-xs mt-1">Start tracking your time above</p>
                    </div>
                ) : (
                    // Show only the latest time log (first item in array)
                    (() => {
                        const log = timeLogs[0];
                        return (
                            <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                            Technician
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Travel Start</p>
                                        <p className="text-gray-900 font-medium">{formatTime(log.travel_started_at || null)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Arrival</p>
                                        <p className="text-gray-900 font-medium">{formatTime(log.arrived_at || null)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Lunch Start</p>
                                        <p className="text-gray-900 font-medium">{formatTime(log.lunch_started_at || null)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Lunch End</p>
                                        <p className="text-gray-900 font-medium">{formatTime(log.lunch_ended_at || null)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Departure</p>
                                        <p className="text-gray-900 font-medium">{formatTime(log.departed_at || null)}</p>
                                    </div>
                                    {(log.normal_hours !== undefined || log.overtime_hours !== undefined) && (
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1">Total Hours</p>
                                            <p className="text-emerald-600 font-semibold">
                                                {(Number(log.normal_hours || 0) + Number(log.overtime_hours || 0)).toFixed(2)}h
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {log.equipment_status && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <span className="text-xs text-gray-600">
                                                Equipment Status: <span className="font-medium capitalize">{log.equipment_status}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
}
