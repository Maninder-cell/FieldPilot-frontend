'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import { getTasks, type Task } from '@/lib/technician-tasks-api';
import {
    Search,
    Play,
    Eye,
    Clock,
    MapPin,
    Calendar,
    AlertCircle,
    Zap,
    AlertTriangle,
    Info,
    CheckCircle,
    CheckCircle2,
    Pause,
    FileText,
    ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TechnicianTasksPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadTasks();
        }
    }, [user, statusFilter, priorityFilter]);

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const response = await getTasks({
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                search: searchQuery || undefined,
            });

            // Handle both paginated and non-paginated responses
            const responseData = response as any;

            // Check for results.data structure (actual backend response)
            if (responseData.results?.data && Array.isArray(responseData.results.data)) {
                setTasks(responseData.results.data);
            } else if (response.data && Array.isArray(response.data)) {
                setTasks(response.data);
            } else if (responseData.results && Array.isArray(responseData.results)) {
                setTasks(responseData.results);
            } else if (responseData.data?.results && Array.isArray(responseData.data.results)) {
                setTasks(responseData.data.results);
            } else {
                console.warn('Unexpected response structure:', responseData);
                setTasks([]);
            }
        } catch (error: any) {
            console.error('Failed to load tasks:', error);
            toast.error('Failed to load tasks');
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        loadTasks();
    };

    const getPriorityConfig = (priority: string) => {
        const config = {
            critical: {
                bg: 'bg-gradient-to-r from-red-50 to-red-100',
                text: 'text-red-700',
                icon: AlertTriangle,
                label: 'Critical',
                badgeBg: 'bg-red-100',
                badgeText: 'text-red-700'
            },
            high: {
                bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
                text: 'text-orange-700',
                icon: AlertCircle,
                label: 'High',
                badgeBg: 'bg-orange-100',
                badgeText: 'text-orange-700'
            },
            medium: {
                bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
                text: 'text-yellow-700',
                icon: Info,
                label: 'Medium',
                badgeBg: 'bg-yellow-100',
                badgeText: 'text-yellow-700'
            },
            low: {
                bg: 'bg-gradient-to-r from-green-50 to-green-100',
                text: 'text-green-700',
                icon: CheckCircle,
                label: 'Low',
                badgeBg: 'bg-green-100',
                badgeText: 'text-green-700'
            },
        };
        return config[priority as keyof typeof config] || config.medium;
    };

    const getWorkStatusConfig = (status: string) => {
        const config = {
            open: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText, label: 'Open' },
            in_progress: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Zap, label: 'In Progress' },
            on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Pause, label: 'On Hold' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
        };
        return config[status as keyof typeof config] || config.open;
    };

    if (authLoading || isLoading) {
        return (
            <TechnicianLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            </TechnicianLayout>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <TechnicianLayout>
            <div className="p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h1>
                        <p className="mt-1 text-sm sm:text-base text-gray-600">View and manage your assigned tasks</p>
                    </div>
                    <div className="flex sm:hidden items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-emerald-700">{tasks.length} Active Tasks</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-emerald-700">{tasks.length} Active Tasks</span>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="block w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base transition-all"
                        />
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                        {/* Status Dropdown */}
                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => {
                                    setShowStatusDropdown(!showStatusDropdown);
                                    setShowPriorityDropdown(false);
                                }}
                                className={`w-full sm:w-auto inline-flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base font-medium shadow-sm transition-all whitespace-nowrap min-w-[120px] sm:min-w-[140px] ${statusFilter
                                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100'
                                    }`}
                            >
                                <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                                    {statusFilter === '' && 'All Status'}
                                    {statusFilter === 'open' && <><FileText className="h-4 w-4 flex-shrink-0" /><span className="truncate">Open</span></>}
                                    {statusFilter === 'in_progress' && <><Play className="h-4 w-4 flex-shrink-0" /><span className="truncate">In Progress</span></>}
                                    {statusFilter === 'on_hold' && <><Pause className="h-4 w-4 flex-shrink-0" /><span className="truncate">On Hold</span></>}
                                    {statusFilter === 'completed' && <><CheckCircle2 className="h-4 w-4 flex-shrink-0" /><span className="truncate">Completed</span></>}
                                </span>
                                <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            </button>

                            {showStatusDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10 sm:hidden"
                                        onClick={() => setShowStatusDropdown(false)}
                                    />
                                    <div className="absolute left-0 sm:left-auto right-0 z-20 mt-2 w-full sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                        {[
                                            { value: '', label: 'All Status', icon: null },
                                            { value: 'open', label: 'Open', icon: FileText },
                                            { value: 'in_progress', label: 'In Progress', icon: Play },
                                            { value: 'on_hold', label: 'On Hold', icon: Pause },
                                            { value: 'completed', label: 'Completed', icon: CheckCircle2 }
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setStatusFilter(option.value);
                                                        setShowStatusDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 sm:py-2 text-sm sm:text-base flex items-center gap-2 transition-colors active:bg-gray-100 ${statusFilter === option.value
                                                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {statusFilter === option.value && <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                                                    {statusFilter !== option.value && <span className="w-4 flex-shrink-0" />}
                                                    {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                                                    <span className="truncate">{option.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Priority Dropdown */}
                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => {
                                    setShowPriorityDropdown(!showPriorityDropdown);
                                    setShowStatusDropdown(false);
                                }}
                                className={`w-full sm:w-auto inline-flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base font-medium shadow-sm transition-all whitespace-nowrap min-w-[120px] sm:min-w-[140px] ${priorityFilter
                                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100'
                                    }`}
                            >
                                <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                                    {priorityFilter === '' && 'All Priority'}
                                    {priorityFilter === 'low' && (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            </div>
                                            <span className="truncate">Low</span>
                                        </>
                                    )}
                                    {priorityFilter === 'medium' && (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-yellow-500 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            </div>
                                            <span className="truncate">Medium</span>
                                        </>
                                    )}
                                    {priorityFilter === 'high' && (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            </div>
                                            <span className="truncate">High</span>
                                        </>
                                    )}
                                    {priorityFilter === 'critical' && (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            </div>
                                            <span className="truncate">Critical</span>
                                        </>
                                    )}
                                </span>
                                <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            </button>

                            {showPriorityDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10 sm:hidden"
                                        onClick={() => setShowPriorityDropdown(false)}
                                    />
                                    <div className="absolute left-0 sm:left-auto right-0 z-20 mt-2 w-full sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                        {[
                                            { value: '', label: 'All Priority', color: null },
                                            { value: 'low', label: 'Low', color: 'green' },
                                            { value: 'medium', label: 'Medium', color: 'yellow' },
                                            { value: 'high', label: 'High', color: 'orange' },
                                            { value: 'critical', label: 'Critical', color: 'red' }
                                        ].map((option) => {
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setPriorityFilter(option.value);
                                                        setShowPriorityDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 sm:py-2 text-sm sm:text-base flex items-center gap-2 transition-colors active:bg-gray-100 ${priorityFilter === option.value
                                                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {priorityFilter === option.value && <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                                                    {priorityFilter !== option.value && <span className="w-4 flex-shrink-0" />}
                                                    {option.color && (
                                                        <div className={`w-4 h-4 rounded-full border-2 border-${option.color}-500 flex items-center justify-center flex-shrink-0`}>
                                                            <div className={`w-2 h-2 rounded-full bg-${option.color}-500`}></div>
                                                        </div>
                                                    )}
                                                    <span className="truncate">{option.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasks Grid */}
                {tasks.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-500">You don't have any tasks matching the selected filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {tasks.map((task) => {
                            const priorityConfig = getPriorityConfig(task.priority);
                            const workStatusConfig = getWorkStatusConfig(task.work_status);
                            const PriorityIcon = priorityConfig.icon;
                            const StatusIcon = workStatusConfig.icon;

                            return (
                                <div
                                    key={task.id}
                                    className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                                >
                                    {/* Priority Indicator Bar */}
                                    <div className={`h-1.5 ${priorityConfig.bg}`}></div>

                                    <div className="p-5">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <PriorityIcon className={`h-5 w-5 ${priorityConfig.text}`} />
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityConfig.badgeBg} ${priorityConfig.badgeText}`}>
                                                        {priorityConfig.label}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                                                    {task.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">{task.task_number}</p>
                                            </div>
                                        </div>

                                        {/* Work Status */}
                                        <div className="mb-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${workStatusConfig.bg} ${workStatusConfig.text}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {workStatusConfig.label}
                                            </span>
                                        </div>

                                        {/* Equipment Info */}
                                        {task.equipment_name && (
                                            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-gray-900 truncate">{task.equipment_name}</p>
                                                        <p className="text-xs text-gray-500">{task.equipment_number}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Schedule */}
                                        {task.scheduled_start && (
                                            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">
                                                    {new Date(task.scheduled_start).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => router.push(`/technician/tasks/${task.id}`)}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hover Effect Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 transition-all duration-200 pointer-events-none rounded-xl"></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </TechnicianLayout>
    );
}
