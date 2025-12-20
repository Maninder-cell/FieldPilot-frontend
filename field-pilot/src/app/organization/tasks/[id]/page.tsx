'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import { getTask } from '@/lib/tasks-api';
import { Task } from '@/types/tasks';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Clock,
    User,
    Users,
    MapPin,
    Calendar,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Paperclip,
    History,
    Wrench,
    UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import TaskModal from '@/components/organization/TaskModal';
import DeleteTaskModal from '@/components/organization/DeleteTaskModal';
import ManageAssignmentsModal from '@/components/organization/ManageAssignmentsModal';
import TaskComments from '@/components/organization/TaskComments';
import TaskAttachments from '@/components/organization/TaskAttachments';
import TaskTimeTracking from '@/components/organization/TaskTimeTracking';
import TaskHistory from '@/components/organization/TaskHistory';
import TaskMaterials from '@/components/organization/TaskMaterials';

export default function TaskDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const taskId = params?.id as string;

    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isManageAssignmentsOpen, setIsManageAssignmentsOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && taskId) {
            loadTask();
        }
    }, [user, taskId]);

    const loadTask = async () => {
        try {
            setIsLoading(true);
            const response = await getTask(taskId);
            setTask(response.data);
        } catch (error: any) {
            console.error('Failed to load task:', error);
            toast.error('Failed to load task details');
            router.push('/organization/tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const updateCommentsCount = (delta: number) => {
        if (task) {
            setTask({
                ...task,
                comments_count: (task.comments_count || 0) + delta
            });
        }
    };

    const updateAttachmentsCount = (delta: number) => {
        if (task) {
            setTask({
                ...task,
                attachments_count: (task.attachments_count || 0) + delta
            });
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        loadTask();
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        router.push('/organization/tasks');
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            new: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            closed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            reopened: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
        };
        const badge = badges[status as keyof typeof badges] || badges.new;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Icon className="h-4 w-4" />
                {status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[priority as keyof typeof colors]}`}>
                {priority}
            </span>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not scheduled';
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!user || !task) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        <button
                            onClick={() => router.push('/organization/tasks')}
                            className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900 truncate">{task.title}</h1>
                                {getStatusBadge(task.status)}
                                {getPriorityBadge(task.priority)}
                            </div>
                            <p className="text-sm text-gray-500">{task.task_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{task.description || 'No description provided'}</p>
                        </div>

                        {/* Equipment Details */}
                        {task.equipment && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-emerald-600" />
                                    Equipment Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Equipment Name</p>
                                        <p className="text-sm font-medium text-gray-900">{task.equipment.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Equipment Number</p>
                                        <p className="text-sm font-medium text-gray-900">{task.equipment.equipment_number}</p>
                                    </div>
                                    {task.equipment.building && typeof task.equipment.building === 'object' && (
                                        <>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Building</p>
                                                <p className="text-sm font-medium text-gray-900">{task.equipment.building.name}</p>
                                            </div>
                                            {task.equipment.building.facility && typeof task.equipment.building.facility === 'object' && (
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Facility</p>
                                                    <p className="text-sm font-medium text-gray-900">{task.equipment.building.facility.name}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {task.equipment.location && (
                                        <div className="sm:col-span-2">
                                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                Location
                                            </p>
                                            <p className="text-sm font-medium text-gray-900">{task.equipment.location}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                        {/* Assignments */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-emerald-600" />
                                    Assignments ({task.assignments?.length || 0})
                                </h2>
                                <button
                                    onClick={() => setIsManageAssignmentsOpen(true)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Manage
                                </button>
                            </div>
                            {task.assignments && task.assignments.length > 0 ? (
                                <div className="space-y-3">
                                    {task.assignments.map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {assignment.assignee ? (
                                                    <>
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                            <User className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{assignment.assignee.full_name}</p>
                                                            <p className="text-xs text-gray-500">{assignment.assignee.email}</p>
                                                        </div>
                                                    </>
                                                ) : assignment.team_name ? (
                                                    <>
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{assignment.team_name}</p>
                                                            <p className="text-xs text-gray-500">Team</p>
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${assignment.work_status === 'done' ? 'bg-green-100 text-green-800' :
                                                assignment.work_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    assignment.work_status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {assignment.work_status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm mb-4">No assignments yet</p>
                                    <button
                                        onClick={() => setIsManageAssignmentsOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Assign Task
                                    </button>
                                </div>
                            )}
                        </div>


                        {/* Materials Section */}
                        <TaskMaterials taskId={task.id} />

                        {/* Attachments Section */}
                        <TaskAttachments
                            taskId={task.id}
                            currentCount={task.attachments_count}
                            onAttachmentChange={updateAttachmentsCount}
                        />

                        {/* Time Tracking Section */}
                        <TaskTimeTracking taskId={task.id} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Schedule */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                Schedule
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Start</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(task.scheduled_start)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">End</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(task.scheduled_end)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <History className="h-5 w-5 text-emerald-600" />
                                Activity
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MessageSquare className="h-4 w-4" />
                                        Comments
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{task.comments_count || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Paperclip className="h-4 w-4" />
                                        Attachments
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{task.attachments_count || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <TaskComments
                            taskId={task.id}
                            currentCount={task.comments_count}
                            onCommentChange={updateCommentsCount}
                        />

                        {/* Created By */}
                        {task.created_by && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Created By</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{task.created_by.full_name}</p>
                                        <p className="text-xs text-gray-500">{new Date(task.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {task.notes && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{task.notes}</p>
                            </div>
                        )}

                        {/* Last Updated */}
                        {task.updated_by && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Last Updated</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{task.updated_by.full_name}</p>
                                        <p className="text-xs text-gray-500">{new Date(task.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task History Section */}
                        <TaskHistory taskId={task.id} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && task && (
                <TaskModal
                    task={task}
                    onClose={handleModalClose}
                />
            )}

            {isDeleteModalOpen && task && (
                <DeleteTaskModal
                    task={task}
                    onClose={handleDeleteModalClose}
                />
            )}

            {isManageAssignmentsOpen && task && (
                <ManageAssignmentsModal
                    taskId={task.id}
                    currentAssignments={task.assignments || []}
                    onClose={() => setIsManageAssignmentsOpen(false)}
                    onSuccess={loadTask}
                />
            )}
        </OrganizationLayout>
    );
}
