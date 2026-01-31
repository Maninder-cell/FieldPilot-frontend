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

// Status type for time tracking flow
type TimeTrackingStatus = 
    | 'not_started'    // No time log exists or previous visit completed
    | 'traveling'      // Travel started, not arrived yet
    | 'on_site'        // Arrived, working (no lunch or lunch ended)
    | 'on_lunch'       // On lunch break
    | 'completed';     // Departed

export default function TechnicianTimeTracking({ taskId }: TechnicianTimeTrackingProps) {
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDepartureModal, setShowDepartureModal] = useState(false);

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
            setShowDepartureModal(false);
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

    const formatTime = (dateString: string | null | undefined) => {
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

    // Get the active (not departed) time log
    const getActiveTimeLog = (): TimeLog | null => {
        if (timeLogs.length === 0) return null;
        // Find the first log that hasn't departed yet
        const activeLog = timeLogs.find(log => !log.departed_at);
        return activeLog || null;
    };

    // Determine current status based on the active time log
    const getCurrentStatus = (): TimeTrackingStatus => {
        const activeLog = getActiveTimeLog();
        
        // No active log - either no logs exist or all visits are completed
        if (!activeLog) {
            return 'not_started';
        }

        // Check status in order of the workflow
        // 1. If departed - visit is complete (shouldn't happen since we filter for active)
        if (activeLog.departed_at) {
            return 'completed';
        }

        // 2. If on lunch (lunch started but not ended)
        if (activeLog.lunch_started_at && !activeLog.lunch_ended_at) {
            return 'on_lunch';
        }

        // 3. If arrived (on site - either never took lunch or lunch ended)
        if (activeLog.arrived_at) {
            return 'on_site';
        }

        // 4. If travel started but not arrived
        if (activeLog.travel_started_at) {
            return 'traveling';
        }

        // Shouldn't reach here, but default to not_started
        return 'not_started';
    };

    const currentStatus = getCurrentStatus();

    // Button enable/disable logic based on current status
    const canStartTravel = currentStatus === 'not_started' || currentStatus === 'completed';
    const canLogArrival = currentStatus === 'traveling';
    const canStartLunch = currentStatus === 'on_site';
    const canEndLunch = currentStatus === 'on_lunch';
    const canLogDeparture = currentStatus === 'on_site';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Time Tracking
            </h2>

            {/* Current Status Indicator */}
            {currentStatus !== 'not_started' && currentStatus !== 'completed' && (
                <div className={`mb-4 p-3 rounded-lg border ${
                    currentStatus === 'traveling' ? 'bg-blue-50 border-blue-200' :
                    currentStatus === 'on_site' ? 'bg-green-50 border-green-200' :
                    currentStatus === 'on_lunch' ? 'bg-orange-50 border-orange-200' :
                    'bg-gray-50 border-gray-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {currentStatus === 'traveling' && <Car className="h-4 w-4 text-blue-600" />}
                        {currentStatus === 'on_site' && <MapPin className="h-4 w-4 text-green-600" />}
                        {currentStatus === 'on_lunch' && <Coffee className="h-4 w-4 text-orange-600" />}
                        <span className={`text-sm font-medium ${
                            currentStatus === 'traveling' ? 'text-blue-700' :
                            currentStatus === 'on_site' ? 'text-green-700' :
                            currentStatus === 'on_lunch' ? 'text-orange-700' :
                            'text-gray-700'
                        }`}>
                            {currentStatus === 'traveling' && 'Currently Traveling'}
                            {currentStatus === 'on_site' && 'On Site - Working'}
                            {currentStatus === 'on_lunch' && 'On Lunch Break'}
                        </span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={handleTravel}
                    disabled={isSubmitting || !canStartTravel}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors border ${
                        canStartTravel 
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' 
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <Car className="h-4 w-4" />
                    <span className="text-sm font-medium">Start Travel</span>
                </button>

                <button
                    onClick={handleArrival}
                    disabled={isSubmitting || !canLogArrival}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors border ${
                        canLogArrival 
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' 
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Log Arrival</span>
                </button>

                <button
                    onClick={handleLunchStart}
                    disabled={isSubmitting || !canStartLunch}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors border ${
                        canStartLunch 
                            ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' 
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <Coffee className="h-4 w-4" />
                    <span className="text-sm font-medium">Start Lunch</span>
                </button>

                <button
                    onClick={handleLunchEnd}
                    disabled={isSubmitting || !canEndLunch}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors border ${
                        canEndLunch 
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200' 
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <Coffee className="h-4 w-4" />
                    <span className="text-sm font-medium">End Lunch</span>
                </button>

                <button
                    onClick={() => setShowDepartureModal(true)}
                    disabled={isSubmitting || !canLogDeparture}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors border col-span-2 ${
                        canLogDeparture 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' 
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                            Current Visit
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    {/* Travel Start */}
                                    <div className="flex items-start gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            log.travel_started_at ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            <Car className={`h-4 w-4 ${log.travel_started_at ? 'text-blue-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-xs mb-0.5">Travel Start</p>
                                            <p className={`font-medium ${log.travel_started_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {formatTime(log.travel_started_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrival */}
                                    <div className="flex items-start gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            log.arrived_at ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                            <MapPin className={`h-4 w-4 ${log.arrived_at ? 'text-green-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-xs mb-0.5">Arrival</p>
                                            <p className={`font-medium ${log.arrived_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {formatTime(log.arrived_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lunch Start */}
                                    <div className="flex items-start gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            log.lunch_started_at ? 'bg-orange-100' : 'bg-gray-100'
                                        }`}>
                                            <Coffee className={`h-4 w-4 ${log.lunch_started_at ? 'text-orange-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-xs mb-0.5">Lunch Start</p>
                                            <p className={`font-medium ${log.lunch_started_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {formatTime(log.lunch_started_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lunch End */}
                                    <div className="flex items-start gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            log.lunch_ended_at ? 'bg-yellow-100' : 'bg-gray-100'
                                        }`}>
                                            <Coffee className={`h-4 w-4 ${log.lunch_ended_at ? 'text-yellow-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-xs mb-0.5">Lunch End</p>
                                            <p className={`font-medium ${log.lunch_ended_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {formatTime(log.lunch_ended_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Departure */}
                                    <div className="flex items-start gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            log.departed_at ? 'bg-red-100' : 'bg-gray-100'
                                        }`}>
                                            <LogOut className={`h-4 w-4 ${log.departed_at ? 'text-red-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-xs mb-0.5">Departure</p>
                                            <p className={`font-medium ${log.departed_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {formatTime(log.departed_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Total Hours */}
                                    <div className="flex items-start gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            log.departed_at ? 'bg-emerald-100' : 'bg-gray-100'
                                        }`}>
                                            <Clock className={`h-4 w-4 ${log.departed_at ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-xs mb-0.5">Total Hours</p>
                                            <p className={`font-semibold ${log.departed_at ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {log.departed_at 
                                                    ? `${(Number(log.normal_hours || 0) + Number(log.overtime_hours || 0)).toFixed(2)}h`
                                                    : 'In progress'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {log.equipment_status_at_departure && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <span className="text-xs text-gray-600">
                                                Equipment Status: <span className="font-medium capitalize">{log.equipment_status_at_departure}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()
                )}
            </div>

            {/* Departure Modal */}
            {showDepartureModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Log Departure</h3>
                                <p className="text-sm text-gray-500">Select equipment status</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">
                            What is the current status of the equipment?
                        </p>

                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => handleDeparture('functional')}
                                disabled={isSubmitting}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-50"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-medium">Functional</p>
                                    <p className="text-xs text-green-600">Equipment is working properly</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleDeparture('shutdown')}
                                disabled={isSubmitting}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                            >
                                <AlertCircle className="h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-medium">Shutdown</p>
                                    <p className="text-xs text-red-600">Equipment is not operational</p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowDepartureModal(false)}
                            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
