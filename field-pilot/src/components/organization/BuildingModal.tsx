'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Building, CreateBuildingRequest } from '@/types/buildings';
import { Facility } from '@/types/facilities';
import CustomFieldsInput from '@/components/common/CustomFieldsInput';

interface BuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBuildingRequest) => Promise<void>;
  building?: Building | null;
  facilities: Facility[];
  isLoading?: boolean;
}

export default function BuildingModal({
  isOpen,
  onClose,
  onSubmit,
  building,
  facilities,
  isLoading = false,
}: BuildingModalProps) {
  const [formData, setFormData] = useState<CreateBuildingRequest>({
    facility_id: '',
    name: '',
    building_type: 'other',
    description: '',
    floor_count: null,
    square_footage: null,
    construction_year: null,
    address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    operational_status: 'operational',
    customer_id: null,
    notes: '',
    custom_fields: {},
  });

  useEffect(() => {
    console.log('BuildingModal - facilities:', facilities.length, 'building:', !!building);
    if (building) {
      setFormData({
        facility_id: building.facility,
        name: building.name,
        building_type: building.building_type,
        description: building.description || '',
        floor_count: building.floor_count,
        square_footage: building.square_footage,
        construction_year: building.construction_year,
        address: building.address || '',
        contact_name: building.contact_name || '',
        contact_email: building.contact_email || '',
        contact_phone: building.contact_phone || '',
        operational_status: building.operational_status,
        customer_id: building.customer?.id || null,
        notes: building.notes || '',
        custom_fields: building.custom_fields || {},
      });
    } else {
      setFormData({
        facility_id: facilities[0]?.id || '',
        name: '',
        building_type: 'other',
        description: '',
        floor_count: null,
        square_footage: null,
        construction_year: null,
        address: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        operational_status: 'operational',
        customer_id: null,
        notes: '',
        custom_fields: {},
      });
    }
  }, [building, facilities, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (value === '') {
      processedValue = null;
    } else if (type === 'number') {
      processedValue = value ? parseFloat(value) : null;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {building ? 'Edit Building' : 'Create New Building'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Facility Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility *
              </label>
              <select
                name="facility_id"
                value={formData.facility_id}
                onChange={handleChange}
                required
                disabled={!!building || facilities.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
              >
                {facilities.length === 0 ? (
                  <option value="">Loading facilities...</option>
                ) : (
                  <>
                    <option value="">Select a facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name} ({facility.code})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {facilities.length === 0 && !building && (
                <p className="mt-1 text-xs text-amber-600">
                  Please create a facility first before adding buildings.
                </p>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Type *
                  </label>
                  <select
                    name="building_type"
                    value={formData.building_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="office">Office</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="production">Production</option>
                    <option value="storage">Storage</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operational Status
                  </label>
                  <select
                    name="operational_status"
                    value={formData.operational_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="operational">Operational</option>
                    <option value="under_construction">Under Construction</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Physical Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Physical Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Count
                  </label>
                  <input
                    type="number"
                    name="floor_count"
                    value={formData.floor_count || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    name="square_footage"
                    value={formData.square_footage || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Construction Year
                  </label>
                  <input
                    type="number"
                    name="construction_year"
                    value={formData.construction_year || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="customer_id"
                    value={formData.customer_id || ''}
                    onChange={handleChange}
                    placeholder="Enter customer UUID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Link this building to a customer
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Custom Fields</h3>
              <CustomFieldsInput
                value={formData.custom_fields || {}}
                onChange={(value) => setFormData(prev => ({ ...prev, custom_fields: value }))}
                disabled={isLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {building ? 'Update Building' : 'Create Building'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
