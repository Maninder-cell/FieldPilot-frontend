'use client';

import { useState, useEffect } from 'react';
import { X, CheckSquare, FileText, Calendar, Settings } from 'lucide-react';
import { createTask, updateTask } from '@/lib/tasks-api';
import { getEquipment } from '@/lib/equipment-api';
import { Task, CreateTaskRequest, TaskPriority, TaskStatus } from '@/types/tasks';
import { toast } from 'react-hot-toast';
import LazySelect from '@/components/common/LazySelect';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';
import CustomFieldsManager from '@/components/common/CustomFieldsManager';

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
    custom_fields: {},
  });

  useEffect(() => {
    if (task) {
      // Extract technician IDs from assignments
      const techIds = task.assignments
        ? task.assignments
          .filter(a => a.assignee)
          .map(a => a.assignee!.id)
        : [];

      // Extract team IDs from assignments
      // Note: team can be either a string ID or an object with id
      const teamIds = task.assignments
        ? task.assignments
          .filter(a => a.team)
          .map(a => typeof a.team === 'string' ? a.team : a.team!.id)
        : [];

      // Handle equipment_id - it can be a string or we need to extract it from equipment object
      let equipmentId: string = task.equipment_id;
      if (typeof task.equipment === 'object' && task.equipment !== null) {
        equipmentId = task.equipment.id;
      }

      setFormData({
        equipment_id: equipmentId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee_ids: techIds,
        team_ids: teamIds,
        scheduled_start: task.scheduled_start || undefined,
        scheduled_end: task.scheduled_end || undefined,
        materials_needed: task.materials_needed || [],
        notes: task.notes,
        section_id: task.section_id || undefined,
        custom_fields: task.custom_fields || {},
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Clean up the form data - filter out null, undefined, and empty values from arrays
      const cleanedAssigneeIds = (formData.assignee_ids || []).filter(id => id && id !== null && id !== '');
      const cleanedTeamIds = (formData.team_ids || []).filter(id => id && id !== null && id !== '');

      const cleanedData: any = {
        ...formData,
      };

      // Only include assignment fields if editing a task and they were actually changed
      if (task) {
        const originalAssigneeIds = task.assignments
          ?.filter(a => a.assignee)
          .map(a => a.assignee!.id)
          .sort() || [];
        const originalTeamIds = task.assignments
          ?.filter(a => a.team)
          .map(a => a.team!.id)
          .sort() || [];

        const currentAssigneeIds = [...cleanedAssigneeIds].sort();
        const currentTeamIds = [...cleanedTeamIds].sort();

        // Only send assignee_ids if they changed
        if (JSON.stringify(originalAssigneeIds) !== JSON.stringify(currentAssigneeIds)) {
          cleanedData.assignee_ids = cleanedAssigneeIds;
        } else {
          delete cleanedData.assignee_ids;
        }

        // Only send team_ids if they changed
        if (JSON.stringify(originalTeamIds) !== JSON.stringify(currentTeamIds)) {
          cleanedData.team_ids = cleanedTeamIds;
        } else {
          delete cleanedData.team_ids;
        }
      } else {
        // For new tasks, always include the cleaned arrays
        cleanedData.assignee_ids = cleanedAssigneeIds;
        cleanedData.team_ids = cleanedTeamIds;
      }

      if (task) {
        await updateTask(task.id, cleanedData);
        toast.success('Task updated successfully');
      } else {
        await createTask(cleanedData);
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
                  onChange={(value) => {
                    const id = typeof value === 'string' ? value : '';
                    setFormData(prev => ({ ...prev, equipment_id: id }));
                  }}
                  fetchItems={async (params) => {
                    const response = await getEquipment(params);
                    // Map equipment to include code field for display
                    const mappedData = (response.data || []).map((eq: any) => ({
                      id: eq.id,
                      name: eq.name,
                      code: eq.equipment_number
                    }));
                    return { data: mappedData, count: response.count || 0 };
                  }}
                  fetchItemById={async (id) => {
                    const { getEquipmentById } = await import('@/lib/equipment-api');
                    const response = await getEquipmentById(id);
                    return { 
                      data: { 
                        id: response.data.id, 
                        name: response.data.name, 
                        code: response.data.equipment_number 
                      } 
                    };
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
                    value={(formData.assignee_ids || []).filter(id => id && id.trim())}
                    multiple={true}
                    onChange={(value) => {
                      const ids = Array.isArray(value) ? value.filter(id => id && id.trim()) : [];
                      setFormData(prev => ({ ...prev, assignee_ids: ids }));
                    }}
                    fetchItems={async (params) => {
                      try {
                        const { getTechnicians } = await import('@/lib/teams-api');
                        const response = await getTechnicians(params);
                        const technicians = (response.results as any)?.data ?? response.data ?? [];
                        // Ensure technicians is an array
                        const techArray = Array.isArray(technicians) ? technicians : [];
                        // Map full_name to name for LazySelect
                        const mappedData = techArray.map((t: any) => ({
                          id: t.id,
                          name: t.full_name || t.name,
                          code: t.email
                        }));
                        return { data: mappedData, count: response.count ?? 0 };
                      } catch (error) {
                        console.error('Error fetching technicians:', error);
                        return { data: [], count: 0 };
                      }
                    }}
                    fetchItemById={async (id) => {
                      try {
                        const { getTechnicians } = await import('@/lib/teams-api');
                        const response = await getTechnicians({ page_size: 100 });
                        const technicians = (response.results as any)?.data ?? response.data ?? [];
                        const technician = technicians.find((t: any) => t.id === id);
                        if (technician) {
                          return { 
                            data: { 
                              id: technician.id, 
                              name: technician.full_name || technician.name,
                              code: technician.email
                            } 
                          };
                        }
                        return { data: { id, name: 'Unknown', code: '' } };
                      } catch (error) {
                        console.error('Error fetching technician by ID:', id, error);
                        return { data: { id, name: 'Unknown', code: '' } };
                      }
                    }}
                    placeholder="Select technicians (multiple allowed)"
                    required={false}
                    disabled={loading}
                    pageSize={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Assign Teams
                  </label>
                  <LazySelect
                    label=""
                    value={(formData.team_ids || []).filter(id => id && id.trim())}
                    multiple={true}
                    onChange={(value) => {
                      const ids = Array.isArray(value) ? value.filter(id => id && id.trim()) : [];
                      setFormData(prev => ({ ...prev, team_ids: ids }));
                    }}
                    fetchItems={async (params) => {
                      try {
                        const { getTeams } = await import('@/lib/teams-api');
                        const response = await getTeams(params);
                        // Handle nested structure: results.data contains the array
                        const teams = Array.isArray((response.results as any)?.data) 
                          ? (response.results as any).data 
                          : Array.isArray(response.results) 
                            ? response.results 
                            : [];
                        return { data: teams, count: response.count ?? 0 };
                      } catch (error) {
                        console.error('Error fetching teams:', error);
                        return { data: [], count: 0 };
                      }
                    }}
                    fetchItemById={async (id) => {
                      try {
                        const { getTeam } = await import('@/lib/teams-api');
                        const response = await getTeam(id);
                        return { data: response.data };
                      } catch (error) {
                        console.error('Error fetching team by ID:', id, error);
                        return { data: { id, name: 'Unknown Team', code: '' } };
                      }
                    }}
                    placeholder="Select teams (multiple allowed)"
                    required={false}
                    disabled={loading}
                    pageSize={10}
                  />
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

              {/* Custom Fields Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Custom Fields</h3>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Add custom key-value pairs to store additional task information
                  </p>
                </div>

                <CustomFieldsManager
                  value={formData.custom_fields || {}}
                  onChange={(value) => setFormData(prev => ({ ...prev, custom_fields: value }))}
                  disabled={loading}
                />
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
