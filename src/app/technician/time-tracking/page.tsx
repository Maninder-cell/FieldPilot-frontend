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
    Timer
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
                status: 'assigned,in_progress',
            });

            const responseData = response as any;
            const taskList = response.data || responseData.results || [];
            setTasks(taskList);

            // Auto-select first in-progress task
            const inProgressTask = taskList.find((t: Task) => t.status === 'in_progress');
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
            await logDeparture(selectedTask.id, {
                equipment_status: 'operational',
                notes: ''
            });
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
        return timeLogs[timeLogs.length - 1];
    };

    const currentLog = getCurrentLog();

    return (
        <TechnicianLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Time Tracking</h1>
                    <p className="mt-1 text-gray-600">Track your work hours and activities</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <>
                        {/* Current Time Display */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Current Time</p>
                                    <p className="text-4xl font-bold">{formatTime(currentTime)}</p>
                                    <p className="text-sm opacity-75 mt-1">
                                        {currentTime.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <Timer className="h-16 w-16 opacity-50" />
                            </div>
                        </div>

                        {/* Task Selection */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Active Task</h3>
                            {tasks.length === 0 ? (
                                <p className="text-gray-600 text-center py-4">No active tasks assigned to you</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tasks.map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className={`p-4 rounded-lg border-2 text-left transition-all ${selectedTask?.id === task.id
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{task.task_number}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{task.title}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedTask?.id === task.id && (
                                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Time Tracking Actions */}
                        {selectedTask && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Time Tracking for: {selectedTask.task_number}
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={handleStartTravel}
                                        disabled={actionLoading || !!(currentLog?.travel_started_at && !currentLog?.arrived_at)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <MapPin className="h-8 w-8" />
                                        <span className="font-medium">Start Travel</span>
                                    </button>

                                    <button
                                        onClick={handleLogArrival}
                                        disabled={actionLoading || !currentLog?.travel_started_at || !!currentLog?.arrived_at}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-blue-500 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Play className="h-8 w-8" />
                                        <span className="font-medium">Log Arrival</span>
                                    </button>

                                    <button
                                        onClick={handleStartLunch}
                                        disabled={actionLoading || !currentLog?.arrived_at || !!(currentLog?.lunch_started_at && !currentLog?.lunch_ended_at)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-orange-500 text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Coffee className="h-8 w-8" />
                                        <span className="font-medium">Start Lunch</span>
                                    </button>

                                    <button
                                        onClick={handleEndLunch}
                                        disabled={actionLoading || !currentLog?.lunch_started_at || !!currentLog?.lunch_ended_at}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Pause className="h-8 w-8" />
                                        <span className="font-medium">End Lunch</span>
                                    </button>

                                    <button
                                        onClick={handleLogDeparture}
                                        disabled={actionLoading || !currentLog?.arrived_at || !!currentLog?.departed_at}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-red-500 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed col-span-2 md:col-span-4"
                                    >
                                        <LogOutIcon className="h-8 w-8" />
                                        <span className="font-medium">Log Departure</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Time Log History */}
                        {selectedTask && timeLogs.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Time Log History</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {timeLogs.map((log, index) => (
                                        <div key={log.id} className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-500">
                                                    Log #{timeLogs.length - index}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDateTime(log.created_at)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                {log.travel_started_at && (
                                                    <div>
                                                        <p className="text-gray-500">Travel Started</p>
                                                        <p className="font-medium text-gray-900">{formatDateTime(log.travel_started_at)}</p>
                                                    </div>
                                                )}
                                                {log.arrived_at && (
                                                    <div>
                                                        <p className="text-gray-500">Arrived</p>
                                                        <p className="font-medium text-gray-900">{formatDateTime(log.arrived_at)}</p>
                                                    </div>
                                                )}
                                                {log.lunch_started_at && (
                                                    <div>
                                                        <p className="text-gray-500">Lunch Started</p>
                                                        <p className="font-medium text-gray-900">{formatDateTime(log.lunch_started_at)}</p>
                                                    </div>
                                                )}
                                                {log.lunch_ended_at && (
                                                    <div>
                                                        <p className="text-gray-500">Lunch Ended</p>
                                                        <p className="font-medium text-gray-900">{formatDateTime(log.lunch_ended_at)}</p>
                                                    </div>
                                                )}
                                                {log.departed_at && (
                                                    <div>
                                                        <p className="text-gray-500">Departed</p>
                                                        <p className="font-medium text-gray-900">{formatDateTime(log.departed_at)}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {log.notes && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">{log.notes}</p>
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
