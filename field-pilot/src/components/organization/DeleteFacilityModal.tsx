'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Facility } from '@/types/facilities';

interface DeleteFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  facility: Facility | null;
  isLoading?: boolean;
}

export default function DeleteFacilityModal({
  isOpen,
  onClose,
  onConfirm,
  facility,
  isLoading = false,
}: DeleteFacilityModalProps) {
  if (!isOpen || !facility) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            {/* Content */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Facility
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">{facility.name}</span>?
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  This will also delete all associated buildings and equipment. This action cannot be undone.
                </p>
                
                {/* Facility Details */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Code:</span>
                      <span className="font-medium text-gray-900">{facility.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {facility.facility_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buildings:</span>
                      <span className="font-medium text-gray-900">{facility.buildings_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equipment:</span>
                      <span className="font-medium text-gray-900">{facility.equipment_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Delete Facility
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
