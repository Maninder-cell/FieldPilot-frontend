'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { deleteTask } from '@/lib/tasks-api';
import { Task } from '@/types/tasks';
import { toast } from 'react-hot-toast';

interface DeleteTaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function DeleteTaskModal({ task, onClose }: DeleteTaskModalProps) {
  const [loading, setLoading] = useState(false);

  const hasActiveAssignments = task.assignments && task.assignments.some(
    a => a.work_status === 'in_progress' || a.work_status === 'open'
  );

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Task
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">{task.title}</span>?
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  This action cannot be undone.
                </p>
                
                {hasActiveAssignments && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This task has active assignments or work in progress.
                    </p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Task Number:</span>
                      <span className="font-medium text-gray-900">{task.task_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {task.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {task.priority}
                      </span>
                    </div>
                    {typeof task.equipment === 'object' && (
                      <div className="flex justify-between">
                        <span>Equipment:</span>
                        <span className="font-medium text-gray-900">{task.equipment.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
