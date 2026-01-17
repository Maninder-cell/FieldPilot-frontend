'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import {
    Search,
    Filter,
    Play,
    Eye,
    Clock,
    AlertCircle,
    CheckCircle2,
    Building2,
    Calendar,
} from 'lucide-react';
import { getTasks, type Task } from '@/lib/technician-tasks-api';
import { toast } from 'react-hot-toast';

export default function MyTasksPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

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
            if (response.data && Array.isArray(response.data)) {
                setTasks(response.data);
            } else if (responseData.results && Array.isArray(responseData.results)) {
                setTasks(responseData.results);
            } else if (responseData.data?.results && Array.isArray(responseData.data.results)) {
                setTasks(responseData.data.results);
            } else {
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

    const getPriorityBadge = (priority: string) => {
        const config = {
            critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
            high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
            medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
            low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' },
        };

        const style = config[priority as keyof typeof config] || config.medium;

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                {style.label}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const config = {
            new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
            assigned: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Assigned' },
            in_progress: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'In Progress' },
            on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'On Hold' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
        };

        const style = config[status as keyof typeof config] || config.new;

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                {style.label}
            </span>
        );
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
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h1>
                    <p className="mt-1 text-gray-600">View and manage your assigned tasks</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Priority</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                    {tasks.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                            <p className="text-gray-600">You don't have any tasks matching the selected filters.</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-emerald-200 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {task.task_number}: {task.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {getPriorityBadge(task.priority)}
                                            {getStatusBadge(task.status)}
                                            {task.equipment && (
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                    <Building2 className="h-3 w-3" />
                                                    {task.equipment.name}
                                                </span>
                                            )}
                                            {task.scheduled_start && (
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(task.scheduled_start).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {task.work_status !== 'in_progress' && task.work_status !== 'completed' && (
                                        <button
                                            onClick={() => router.push(`/technician/tasks/${task.id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            <Play className="h-4 w-4" />
                                            Start
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push(`/technician/tasks/${task.id}`)}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </TechnicianLayout>
    );
}
