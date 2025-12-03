'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { deleteEquipment } from '@/lib/equipment-api';
import { Equipment } from '@/types/equipment';
import { toast } from 'react-hot-toast';

interface DeleteEquipmentModalProps {
  equipment: Equipment;
  onClose: () => void;
}

export default function DeleteEquipmentModal({ equipment, onClose }: DeleteEquipmentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteEquipment(equipment.id);
      toast.success('Equipment deleted successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete equipment');
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
                Delete Equipment
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">{equipment.name}</span>?
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  This action cannot be undone.
                </p>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Equipment Number:</span>
                      <span className="font-medium text-gray-900">{equipment.equipment_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {equipment.equipment_type}
                      </span>
                    </div>
                    {equipment.manufacturer && (
                      <div className="flex justify-between">
                        <span>Manufacturer:</span>
                        <span className="font-medium text-gray-900">{equipment.manufacturer}</span>
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
                Delete Equipment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
