'use client';

import { useState, useEffect } from 'react';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import {
    Clock,
    Coffee,
    MapPin,
    LogOut as LogOutIcon,
    Loader2,
    CheckCircle,
    CheckCircle2,
    Timer,
    Car,
    AlertCircle
} from 'lucide-react';
import {
    getTasks,
    Task,
    startTravel,
    logArrival,
    logDeparture,
    startLunch,
    endLunch,
    getTimeLogs,
    TimeLog
} from '@/lib/technician-tasks-api';
import toast from 'react-hot-toast';

// Status type for time tracking flow
type TimeTrackingStatus = 
    | 'not_started'    // No time log exists or previous visit completed
    | 'traveling'      // Travel started, not arrived yet
    | 'on_site'        // Arrived, working (no lunch or lunch ended)
    | 'on_lunch'       // On lunch break
    | 'completed';     // Departed

export default function TimeTrackingPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showDepartureModal, setShowDepartureModal] = useState(false);

    useEffect(() => {
        loadTasks();
        // Update current time every second
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedTask) {
            loadTimeLogs(selectedTask.id);
        }
    }, [selectedTask]);

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const response = await getTasks({
                work_status: 'in_progress',
            }) as any;

            let taskList: Task[] = [];

            if (response.results && response.results.data && Array.isArray(response.results.data)) {
                taskList = response.results.data;
            } else if (Array.isArray(response.data)) {
                taskList = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (response.data.results && response.data.results.data) {
                    taskList = response.data.results.data;
                } else if ('results' in response.data && Array.isArray(response.data.results)) {
                    taskList = response.data.results as Task[];
                } else if ('data' in response.data && Array.isArray(response.data.data)) {
                    taskList = response.data.data;
                }
            }

            setTasks(taskList);

            const inProgressTask = taskList.find((t: Task) => t.work_status === 'in_progress');
            if (inProgressTask) {
                setSelectedTask(inProgressTask);
            } else if (taskList.length > 0) {
                setSelectedTask(taskList[0]);
            }
        } catch (error: any) {
            console.error('Failed to load tasks:', error);
            toast.error(error.message || 'Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const loadTimeLogs = async (taskId: string) => {
        try {
            const response = await getTimeLogs(taskId);
            setTimeLogs(response.data || []);
        } catch (error: any) {
            console.error('Failed to load time logs:', error);
        }
    };

    // Get the active (not departed) time log
    const getActiveTimeLog = (): TimeLog | null => {
        if (timeLogs.length === 0) return null;
        const activeLog = timeLogs.find(log => !log.departed_at);
        return activeLog || null;
    };

    // Determine current status based on the active time log
    const getCurrentStatus = (): TimeTrackingStatus => {
        const activeLog = getActiveTimeLog();
        
        if (!activeLog) {
            return 'not_started';
        }

        if (activeLog.departed_at) {
            return 'completed';
        }

        if (activeLog.lunch_started_at && !activeLog.lunch_ended_at) {
            return 'on_lunch';
        }

        if (activeLog.arrived_at) {
            return 'on_site';
        }

        if (activeLog.travel_started_at) {
            return 'traveling';
        }

        return 'not_started';
    };

    const currentStatus = getCurrentStatus();
    const activeTimeLog = getActiveTimeLog();

    // Button enable/disable logic
    const canStartTravel = currentStatus === 'not_started' || currentStatus === 'completed';
    const canLogArrival = currentStatus === 'traveling';
    const canStartLunch = currentStatus === 'on_site' && !activeTimeLog?.lunch_started_at;
    const canEndLunch = currentStatus === 'on_lunch';
    const canLogDeparture = currentStatus === 'on_site';

    const handleStartTravel = async () => {
        if (!selectedTask) return;

        try {
            setActionLoading(true);
            await startTravel(selectedTask.id);
            toast.success('Travel started');
            await loadTimeLogs(selectedTask.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to start travel');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogArrival = async () => {
        if (!selectedTask) return;

        try {
            setActionLoading(true);
            await logArrival(selectedTask.id);
            toast.success('Arrival logged');
            await loadTimeLogs(selectedTask.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to log arrival');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogDeparture = async (equipmentStatus: 'functional' | 'shutdown') => {
        if (!selectedTask) return;

        try {
            setActionLoading(true);
            await logDeparture(selectedTask.id, equipmentStatus);
            toast.success('Departure logged');
            setShowDepartureModal(false);
            await loadTimeLogs(selectedTask.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to log departure');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartLunch = async () => {
        if (!selectedTask) return;

        try {
            setActionLoading(true);
            await startLunch(selectedTask.id);
            toast.success('Lunch break started');
            await loadTimeLogs(selectedTask.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to start lunch');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndLunch = async () => {
        if (!selectedTask) return;

        try {
            setActionLoading(true);
            await endLunch(selectedTask.id);
            toast.success('Lunch break ended');
            await loadTimeLogs(selectedTask.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to end lunch');
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusLabel = () => {
        switch (currentStatus) {
            case 'traveling': return 'Currently Traveling';
            case 'on_site': return 'On Site - Working';
            case 'on_lunch': return 'On Lunch Break';
            default: return null;
        }
    };

    return (
        <TechnicianLayout>
            <div className="p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Time Tracking</h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">Track your work hours and activities</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <>
                        {/* Current Time Display */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-90 mb-1">Current Time</p>
                                    <p className="text-3xl sm:text-4xl font-bold">{formatTime(currentTime)}</p>
                                    <p className="text-xs sm:text-sm opacity-75 mt-1">
                                        {currentTime.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <Timer className="h-12 w-12 sm:h-16 sm:w-16 opacity-50" />
                            </div>
                        </div>

                        {/* Task Selection */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Select Active Task</h3>
                            {tasks.length === 0 ? (
                                <p className="text-sm sm:text-base text-gray-600 text-center py-4">No active tasks assigned to you</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {tasks.map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all active:scale-98 ${selectedTask?.id === task.id
                                                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{task.task_number}</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{task.title}</p>
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${task.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                        <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedTask?.id === task.id && (
                                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Time Tracking Actions */}
                        {selectedTask && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                                    Time Tracking for: <span className="text-emerald-600">{selectedTask.task_number}</span>
                                </h3>

                                {/* Current Status Indicator */}
                                {getStatusLabel() && (
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
                                                {getStatusLabel()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                    {/* Start Travel */}
                                    <button
                                        onClick={handleStartTravel}
                                        disabled={actionLoading || !canStartTravel}
                                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                                            canStartTravel
                                                ? 'border-blue-500 text-blue-700 hover:bg-blue-50 active:bg-blue-100'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                                            canStartTravel ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            <Car className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">Start Travel</span>
                                    </button>

                                    {/* Log Arrival */}
                                    <button
                                        onClick={handleLogArrival}
                                        disabled={actionLoading || !canLogArrival}
                                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                                            canLogArrival
                                                ? 'border-green-500 text-green-700 hover:bg-green-50 active:bg-green-100'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                                            canLogArrival ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                            <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">Log Arrival</span>
                                    </button>

                                    {/* Start Lunch */}
                                    <button
                                        onClick={handleStartLunch}
                                        disabled={actionLoading || !canStartLunch}
                                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                                            canStartLunch
                                                ? 'border-orange-500 text-orange-700 hover:bg-orange-50 active:bg-orange-100'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                                            canStartLunch ? 'bg-orange-100' : 'bg-gray-100'
                                        }`}>
                                            <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">Start Lunch</span>
                                    </button>

                                    {/* End Lunch */}
                                    <button
                                        onClick={handleEndLunch}
                                        disabled={actionLoading || !canEndLunch}
                                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                                            canEndLunch
                                                ? 'border-yellow-500 text-yellow-700 hover:bg-yellow-50 active:bg-yellow-100'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                                            canEndLunch ? 'bg-yellow-100' : 'bg-gray-100'
                                        }`}>
                                            <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">End Lunch</span>
                                    </button>

                                    {/* Log Departure */}
                                    <button
                                        onClick={() => setShowDepartureModal(true)}
                                        disabled={actionLoading || !canLogDeparture}
                                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all col-span-2 lg:col-span-4 ${
                                            canLogDeparture
                                                ? 'border-red-500 text-red-700 hover:bg-red-50 active:bg-red-100'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                                            canLogDeparture ? 'bg-red-100' : 'bg-gray-100'
                                        }`}>
                                            <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">Log Departure</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Time Log History */}
                        {selectedTask && timeLogs.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Time Log History</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {timeLogs.map((log, index) => (
                                        <div key={log.id} className="p-3 sm:p-4 lg:p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Visit #{timeLogs.length - index}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    log.departed_at 
                                                        ? 'bg-gray-100 text-gray-600' 
                                                        : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {log.departed_at ? 'Completed' : 'Active'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        log.travel_started_at ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                        <Car className={`h-4 w-4 ${log.travel_started_at ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Travel Started</p>
                                                        <p className={`font-medium ${log.travel_started_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {log.travel_started_at ? formatDateTime(log.travel_started_at) : 'Not logged'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        log.arrived_at ? 'bg-green-100' : 'bg-gray-100'
                                                    }`}>
                                                        <MapPin className={`h-4 w-4 ${log.arrived_at ? 'text-green-600' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Arrived</p>
                                                        <p className={`font-medium ${log.arrived_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {log.arrived_at ? formatDateTime(log.arrived_at) : 'Not logged'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        log.lunch_started_at ? 'bg-orange-100' : 'bg-gray-100'
                                                    }`}>
                                                        <Coffee className={`h-4 w-4 ${log.lunch_started_at ? 'text-orange-600' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Lunch</p>
                                                        <p className={`font-medium ${log.lunch_started_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {log.lunch_started_at 
                                                                ? `${formatDateTime(log.lunch_started_at)}${log.lunch_ended_at ? ' - ' + formatDateTime(log.lunch_ended_at) : ' (ongoing)'}`
                                                                : 'Not taken'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        log.departed_at ? 'bg-red-100' : 'bg-gray-100'
                                                    }`}>
                                                        <LogOutIcon className={`h-4 w-4 ${log.departed_at ? 'text-red-600' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Departed</p>
                                                        <p className={`font-medium ${log.departed_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {log.departed_at ? formatDateTime(log.departed_at) : 'Not logged'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                        log.departed_at ? 'bg-emerald-100' : 'bg-gray-100'
                                                    }`}>
                                                        <Clock className={`h-4 w-4 ${log.departed_at ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Total Hours</p>
                                                        <p className={`font-semibold ${log.departed_at ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                            {log.departed_at 
                                                                ? `${(Number(log.normal_hours || 0) + Number(log.overtime_hours || 0)).toFixed(2)}h`
                                                                : 'In progress'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                {log.equipment_status_at_departure && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Equipment Status</p>
                                                            <p className="font-medium text-gray-900 capitalize">{log.equipment_status_at_departure}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Departure Modal */}
            {showDepartureModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDepartureModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <LogOutIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Log Departure</h3>
                                    <p className="text-red-100 text-sm">Complete your site visit</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-5 text-center">
                                Select the equipment status before leaving
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleLogDeparture('functional')}
                                    disabled={actionLoading}
                                    className="w-full flex items-center gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all border-2 border-emerald-200 hover:border-emerald-400 disabled:opacity-50 group"
                                >
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-semibold text-emerald-800">Functional</p>
                                        <p className="text-xs text-emerald-600">Equipment is working properly</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleLogDeparture('shutdown')}
                                    disabled={actionLoading}
                                    className="w-full flex items-center gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all border-2 border-red-200 hover:border-red-400 disabled:opacity-50 group"
                                >
                                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-semibold text-red-800">Shutdown</p>
                                        <p className="text-xs text-red-600">Equipment is not operational</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => setShowDepartureModal(false)}
                                className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TechnicianLayout>
    );
}
