'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import { getTasks } from '@/lib/tasks-api';
import { Task, TaskStatus, TaskPriority } from '@/types/tasks';
import TaskModal from '@/components/organization/TaskModal';
import DeleteTaskModal from '@/components/organization/DeleteTaskModal';
import { ClipboardList, Plus, Search, Edit, Trash2, Filter, X, AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle, Eye, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TasksPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Debounced search
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      loadTasks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, priorityFilter]);

  const loadTasks = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await getTasks({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        page_size: size,
      });
      setTasks(response.data || []);
      setTotalCount(response.count || 0);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter || priorityFilter;

  const handleCreate = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleView = (task: Task) => {
    router.push(`/organization/tasks/${task.id}`);
  };

  const handleEdit = async (item: Task) => {
    try {
      setIsFetchingDetails(true);
      toast.loading('Loading task details...', { id: 'fetch-task' });

      // Fetch complete task data from detail endpoint
      const { getTask } = await import('@/lib/tasks-api');
      const response = await getTask(item.id);
      setSelectedTask(response.data);
      setIsModalOpen(true);

      toast.dismiss('fetch-task');
    } catch (error: any) {
      console.error('Failed to load task details:', error);
      toast.error('Failed to load task details', { id: 'fetch-task' });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleDelete = (item: Task) => {
    setTaskToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setTimeout(() => loadTasks(), 100);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
    setTimeout(() => loadTasks(), 100);
  };

  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'reopened':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <OrganizationLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Tasks</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Manage field service tasks and assignments
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Task
            </button>
          </div>

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
                className="block w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm font-medium shadow-sm transition-all whitespace-nowrap ${showFilters || hasActiveFilters
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xs:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                    {[statusFilter, priorityFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 sm:flex-none lg:hidden inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2.5">
                <label className="text-xs font-medium text-gray-700">Status</label>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full xs:w-auto"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {['', 'new', 'pending', 'closed', 'reopened', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as TaskStatus | '');
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${statusFilter === status
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                  >
                    {status === '' && 'All Status'}
                    {status === 'new' && <><AlertCircle className="h-4 w-4" />New</>}
                    {status === 'pending' && <><Clock className="h-4 w-4" />Pending</>}
                    {status === 'closed' && <><CheckCircle2 className="h-4 w-4" />Closed</>}
                    {status === 'reopened' && 'Reopened'}
                    {status === 'rejected' && <><XCircle className="h-4 w-4" />Rejected</>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Priority</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {['', 'low', 'medium', 'high', 'critical'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => {
                      setPriorityFilter(priority as TaskPriority | '');
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${priorityFilter === priority
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                      }`}
                  >
                    {priority === '' && 'All Priorities'}
                    {priority === 'low' && 'Low'}
                    {priority === 'medium' && 'Medium'}
                    {priority === 'high' && <><AlertTriangle className="h-4 w-4" />High</>}
                    {priority === 'critical' && <><AlertTriangle className="h-4 w-4" />Critical</>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">No tasks</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchQuery || statusFilter || priorityFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new task'}
                </p>
                {!searchQuery && !statusFilter && !priorityFilter && (
                  <div className="mt-6">
                    <button
                      onClick={handleCreate}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      New Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignees</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleView(task)}>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.task_number}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {task.equipment_name || task.equipment?.name || '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.equipment_number || task.equipment?.equipment_number || ''}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {task.assignment_count && task.assignment_count > 0 ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">{task.assignment_count}</span>
                                <span className="text-xs">assigned</span>
                              </div>
                            ) : task.assignments && task.assignments.length > 0 ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">{task.assignments.length}</span>
                                <span className="text-xs">assigned</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900">{formatDate(task.scheduled_start)}</div>
                          {task.scheduled_end && (
                            <div className="text-sm text-gray-500">to {formatDate(task.scheduled_end)}</div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleView(task)} className="text-blue-600 hover:text-blue-900 mr-3" title="View Details">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleEdit(task)} disabled={isFetchingDetails} className="text-emerald-600 hover:text-emerald-900 mr-3 disabled:opacity-50" title="Edit">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(task)} disabled={isFetchingDetails} className="text-red-600 hover:text-red-900 disabled:opacity-50" title="Delete">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-gray-200">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleView(task)}>
                    <div className="flex justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-xs text-gray-500">{task.task_number}</p>
                      </div>
                      <div className="ml-2 flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Equipment:</span>{' '}
                        {task.equipment_name || task.equipment?.name || '-'}
                        {task.equipment_number && ` (${task.equipment_number})`}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 font-medium">Assignees:</span>
                        {task.assignment_count && task.assignment_count > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                            <Users className="h-3 w-3" />
                            {task.assignment_count}
                          </div>
                        ) : task.assignments && task.assignments.length > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                            <Users className="h-3 w-3" />
                            {task.assignments.length}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Unassigned</span>
                        )}
                      </div>
                      {task.scheduled_start && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Scheduled:</span> {formatDate(task.scheduled_start)}
                          {task.scheduled_end && ` - ${formatDate(task.scheduled_end)}`}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleView(task)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                        <Eye className="h-4 w-4" />View
                      </button>
                      <button onClick={() => handleEdit(task)} disabled={isFetchingDetails} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                        <Edit className="h-4 w-4" />Edit
                      </button>
                      <button onClick={() => handleDelete(task)} disabled={isFetchingDetails} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!isLoading && tasks.length > 0 && totalCount > pageSize && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 order-2 sm:order-1">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                <span className="font-medium">{totalCount}</span> results
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    loadTasks(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                  className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    loadTasks(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                  className="sm:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>

                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          loadTasks(pageNum);
                        }}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <span className="md:hidden text-sm text-gray-700 px-2">
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>

                <button
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    loadTasks(currentPage + 1);
                  }}
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          onClose={handleModalClose}
        />
      )}

      {isDeleteModalOpen && taskToDelete && (
        <DeleteTaskModal
          task={taskToDelete}
          onClose={handleDeleteModalClose}
        />
      )}
    </OrganizationLayout>
  );
}
