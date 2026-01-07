'use client';

import { useState, useEffect } from 'react';
import { X, CheckSquare, FileText, Calendar, Settings } from 'lucide-react';
import { createTask, updateTask } from '@/lib/tasks-api';
import { getEquipment } from '@/lib/equipment-api';
import { Task, CreateTaskRequest, TaskPriority, TaskStatus } from '@/types/tasks';
import { toast } from 'react-hot-toast';
import LazySelect from '@/components/common/LazySelect';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

// Priority Options
const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low', icon: '🟢' },
  { value: 'medium', label: 'Medium', icon: '🟡' },
  { value: 'high', label: 'High', icon: '🟠' },
  { value: 'critical', label: 'Critical', icon: '🔴' },
];

// Status Options
const statusOptions: SelectOption[] = [
  { value: 'new', label: 'New', icon: '🆕' },
  { value: 'pending', label: 'Pending', icon: '⏳' },
  { value: 'closed', label: 'Closed', icon: '✅' },
  { value: 'reopened', label: 'Reopened', icon: '🔄' },
  { value: 'rejected', label: 'Rejected', icon: '❌' },
];

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    equipment_id: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'new',
    assignee_ids: [],
    team_ids: [],
    scheduled_start: undefined,
    scheduled_end: undefined,
    materials_needed: [],
    notes: '',
    section_id: undefined,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        equipment_id: task.equipment_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee_ids: task.assignments
          ? task.assignments.filter(a => a.assignee).map(a => a.assignee!.id)
          : [],
        team_ids: task.assignments
          ? task.assignments.filter(a => a.team).map(a => a.team!.id)
          : [],
        scheduled_start: task.scheduled_start || undefined,
        scheduled_end: task.scheduled_end || undefined,
        materials_needed: task.materials_needed || [],
        notes: task.notes,
        section_id: task.section_id || undefined,
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (task) {
        await updateTask(task.id, formData);
        toast.success('Task updated successfully');
      } else {
        await createTask(formData);
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Equipment & Task Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Equipment & Task Information</h3>
                </div>

                <LazySelect
                  label="Equipment"
                  value={formData.equipment_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, equipment_id: value }))}
                  fetchItems={getEquipment}
                  fetchItemById={async (id) => {
                    const { getEquipmentById } = await import('@/lib/equipment-api');
                    const response = await getEquipmentById(id);
                    return { data: { id: response.data.id, name: response.data.name, equipment_number: response.data.equipment_number } };
                  }}
                  placeholder="Select equipment"
                  required
                  disabled={false}
                  pageSize={5}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter task title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Provide a detailed description of the task..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Priority
                    </label>
                    <CustomSelect
                      options={priorityOptions}
                      value={formData.priority || null}
                      onChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
                      placeholder="Select priority"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Status
                    </label>
                    <CustomSelect
                      options={statusOptions}
                      value={formData.status || null}
                      onChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
                      placeholder="Select status"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Assignment</h3>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">Required:</span> Assign at least one technician or team to this task
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Assign Technicians
                  </label>
                  <LazySelect
                    label=""
                    value={(formData.assignee_ids?.length ?? 0) > 0 ? formData.assignee_ids![0] : ''}
                    onChange={(value) => {
                      if (value && !(formData.assignee_ids ?? []).includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          assignee_ids: [...(prev.assignee_ids ?? []), value]
                        }));
                      }
                    }}
                    fetchItems={async (params) => {
                      const { getTechnicians } = await import('@/lib/teams-api');
                      return getTechnicians(params);
                    }}
                    fetchItemById={async (id) => {
                      const { getTechnicians } = await import('@/lib/teams-api');
                      const response = await getTechnicians({ page_size: 100 });
                      const technician = response.data?.find((t: any) => t.id === id);
                      return { data: technician };
                    }}
                    placeholder="Select technicians to assign"
                    required={false}
                    disabled={loading}
                    pageSize={10}
                  />

                  {/* Selected Technicians */}
                  {(formData.assignee_ids?.length ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(formData.assignee_ids ?? []).map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                        >
                          Technician
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                assignee_ids: (prev.assignee_ids ?? []).filter(aid => aid !== id)
                              }));
                            }}
                            className="hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Assign Teams
                  </label>
                  <LazySelect
                    label=""
                    value={(formData.team_ids?.length ?? 0) > 0 ? formData.team_ids![0] : ''}
                    onChange={(value) => {
                      if (value && !(formData.team_ids ?? []).includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          team_ids: [...(prev.team_ids ?? []), value]
                        }));
                      }
                    }}
                    fetchItems={async (params) => {
                      const { getTeams } = await import('@/lib/teams-api');
                      const response = await getTeams(params);
                      return { data: (response.results as any)?.data ?? [], count: response.count ?? 0 };
                    }}
                    fetchItemById={async (id) => {
                      const { getTeam } = await import('@/lib/teams-api');
                      const response = await getTeam(id);
                      return { data: response.data };
                    }}
                    placeholder="Select teams to assign"
                    required={false}
                    disabled={loading}
                    pageSize={10}
                  />

                  {/* Selected Teams */}
                  {(formData.team_ids?.length ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(formData.team_ids ?? []).map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                        >
                          Team
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                team_ids: (prev.team_ids ?? []).filter(tid => tid !== id)
                              }));
                            }}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduling Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Scheduling</h3>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Optional:</span> Set start and end dates for this task
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Scheduled Start
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduled_start"
                      value={formData.scheduled_start || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Scheduled End
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduled_end"
                      value={formData.scheduled_end || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any additional notes or instructions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-between items-center shadow-lg">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
