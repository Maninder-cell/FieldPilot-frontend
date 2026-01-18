'use client';

import { useState, useEffect } from 'react';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import {
    Clock,
    Play,
    Pause,
    Coffee,
    MapPin,
    LogOut as LogOutIcon,
    Loader2,
    CheckCircle,
    Timer,
    Car
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

export default function TimeTrackingPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

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
            }) as any; // Cast to any to handle nested response structure

            // Handle nested response structure
            // API returns: { count, next, previous, results: { success, data: [...], message } }
            let taskList: Task[] = [];

            // The response structure is: response.results.data (not response.data.results.data)
            if (response.results && response.results.data && Array.isArray(response.results.data)) {
                taskList = response.results.data;
            } else if (Array.isArray(response.data)) {
                // Fallback: Direct array
                taskList = response.data;
            } else if (response.data && typeof response.data === 'object') {
                // Fallback: Check for other nested structures
                if (response.data.results && response.data.results.data) {
                    taskList = response.data.results.data;
                } else if ('results' in response.data && Array.isArray(response.data.results)) {
                    taskList = response.data.results as Task[];
                } else if ('data' in response.data && Array.isArray(response.data.data)) {
                    taskList = response.data.data;
                }
            }

            setTasks(taskList);

            // Auto-select first in-progress task
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

    const handleLogDeparture = async () => {
        if (!selectedTask) return;

        try {
            setActionLoading(true);
            await logDeparture(selectedTask.id, 'functional');
            toast.success('Departure logged');
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

    const getCurrentLog = () => {
        if (timeLogs.length === 0) return null;
        // Return the first item (most recent log) since API returns in reverse chronological order
        return timeLogs[0];
    };

    const currentLog = getCurrentLog();

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

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                    {/* Start Travel */}
                                    <button
                                        onClick={handleStartTravel}
                                        disabled={actionLoading || !!(currentLog?.travel_started_at && !currentLog?.arrived_at)}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 border-blue-500 text-blue-700 hover:bg-blue-50 active:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Car className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">Start Travel</span>
                                    </button>

                                    {/* Log Arrival */}
                                    <button
                                        onClick={handleLogArrival}
                                        disabled={actionLoading || !currentLog?.travel_started_at || !!currentLog?.arrived_at}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 border-green-500 text-green-700 hover:bg-green-50 active:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">Log Arrival</span>
                                    </button>

                                    {/* Start Lunch */}
                                    <button
                                        onClick={handleStartLunch}
                                        disabled={actionLoading || !currentLog?.arrived_at || !!(currentLog?.lunch_started_at && !currentLog?.lunch_ended_at)}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 border-orange-500 text-orange-700 hover:bg-orange-50 active:bg-orange-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">Start Lunch</span>
                                    </button>

                                    {/* End Lunch */}
                                    <button
                                        onClick={handleEndLunch}
                                        disabled={actionLoading || !currentLog?.lunch_started_at || !!currentLog?.lunch_ended_at}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 active:bg-yellow-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-center">End Lunch</span>
                                    </button>

                                    {/* Log Departure */}
                                    <button
                                        onClick={handleLogDeparture}
                                        disabled={actionLoading || !currentLog?.arrived_at || !!currentLog?.departed_at}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 border-red-500 text-red-700 hover:bg-red-50 active:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent col-span-2 lg:col-span-4"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
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
                                                    Log #{timeLogs.length - index}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDateTime(log.created_at)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                                {log.travel_started_at && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Car className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Travel Started</p>
                                                            <p className="font-medium text-gray-900">{formatDateTime(log.travel_started_at)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.arrived_at && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <MapPin className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Arrived</p>
                                                            <p className="font-medium text-gray-900">{formatDateTime(log.arrived_at)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.lunch_started_at && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Coffee className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Lunch Started</p>
                                                            <p className="font-medium text-gray-900">{formatDateTime(log.lunch_started_at)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.lunch_ended_at && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Coffee className="h-4 w-4 text-yellow-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Lunch Ended</p>
                                                            <p className="font-medium text-gray-900">{formatDateTime(log.lunch_ended_at)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.departed_at && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <LogOutIcon className="h-4 w-4 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Departed</p>
                                                            <p className="font-medium text-gray-900">{formatDateTime(log.departed_at)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {log.notes && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                                    <p className="text-xs sm:text-sm text-gray-700">{log.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </TechnicianLayout>
    );
}
