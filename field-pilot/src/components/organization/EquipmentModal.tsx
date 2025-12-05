'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createEquipment, updateEquipment } from '@/lib/equipment-api';
import { getBuildings } from '@/lib/buildings-api';
import { Equipment, CreateEquipmentData, EquipmentType, OperationalStatus, Condition } from '@/types/equipment';
import { toast } from 'react-hot-toast';
import CustomFieldsInput from '@/components/common/CustomFieldsInput';

interface EquipmentModalProps {
  equipment: Equipment | null;
  onClose: () => void;
}

export default function EquipmentModal({ equipment, onClose }: EquipmentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateEquipmentData>({
    building_id: '',
    name: '',
    equipment_type: 'other',
    manufacturer: '',
    model: '',
    serial_number: '',
    description: '',
    purchase_date: undefined,
    purchase_price: undefined,
    warranty_expiration: undefined,
    installation_date: undefined,
    operational_status: 'operational',
    condition: 'good',
    specifications: {},
    customer_id: undefined,
    notes: '',
    custom_fields: {},
  });

  useEffect(() => {
    console.log('EquipmentModal - equipment:', !!equipment, 'buildings:', buildings.length);
    if (equipment) {
      setFormData({
        building_id: equipment.building_id,
        name: equipment.name,
        equipment_type: equipment.equipment_type,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        serial_number: equipment.serial_number,
        description: equipment.description,
        purchase_date: equipment.purchase_date || undefined,
        purchase_price: equipment.purchase_price || undefined,
        warranty_expiration: equipment.warranty_expiration || undefined,
        installation_date: equipment.installation_date || undefined,
        operational_status: equipment.operational_status,
        condition: equipment.condition,
        specifications: equipment.specifications || {},
        customer_id: equipment.customer_id || undefined,
        notes: equipment.notes,
        custom_fields: equipment.custom_fields || {},
      });
    }
  }, [equipment, buildings]);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        // Request all buildings with a large page size for the dropdown
        const response = await getBuildings({ page_size: 1000 });
        console.log('Loaded buildings:', response.data?.length || 0);
        setBuildings(response.data || []);
      } catch (error) {
        console.error('Failed to fetch buildings:', error);
        setBuildings([]);
      }
    };
    fetchBuildings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (equipment) {
        await updateEquipment(equipment.id, formData);
        toast.success('Equipment updated successfully');
      } else {
        await createEquipment(formData);
        toast.success('Equipment created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save equipment');
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

  const equipmentTypes: { value: EquipmentType; label: string }[] = [
    { value: 'hvac', label: 'HVAC' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'it', label: 'IT Equipment' },
    { value: 'safety', label: 'Safety Equipment' },
    { value: 'other', label: 'Other' },
  ];

  const operationalStatuses: { value: OperationalStatus; label: string }[] = [
    { value: 'operational', label: 'Operational' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'broken', label: 'Broken' },
    { value: 'retired', label: 'Retired' },
  ];

  const conditions: { value: Condition; label: string }[] = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {equipment ? 'Edit Equipment' : 'Create New Equipment'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Building Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building *
              </label>
              <select
                name="building_id"
                value={formData.building_id}
                onChange={handleChange}
                required
                disabled={!!equipment || buildings.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
              >
                {buildings.length === 0 ? (
                  <option value="">Loading buildings...</option>
                ) : (
                  <>
                    <option value="">Select a building</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name} ({building.code})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {buildings.length === 0 && !equipment && (
                <p className="mt-1 text-xs text-amber-600">
                  Please create a building first before adding equipment.
                </p>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Name *
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
                    Equipment Type *
                  </label>
                  <select
                    name="equipment_type"
                    value={formData.equipment_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {equipmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
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
                    {operationalStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
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

            {/* Equipment Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Equipment Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {conditions.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Purchase Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price || ''}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    name="installation_date"
                    value={formData.installation_date || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty Expiration
                  </label>
                  <input
                    type="date"
                    name="warranty_expiration"
                    value={formData.warranty_expiration || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Additional Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
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
                    Optional: Link this equipment to a customer
                  </p>
                </div>

                <div>
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

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Technical Specifications</h3>
              <CustomFieldsInput
                value={formData.specifications || {}}
                onChange={(value) => setFormData(prev => ({ ...prev, specifications: value }))}
                disabled={loading}
              />
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Custom Fields</h3>
              <CustomFieldsInput
                value={formData.custom_fields || {}}
                onChange={(value) => setFormData(prev => ({ ...prev, custom_fields: value }))}
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {equipment ? 'Update Equipment' : 'Create Equipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
