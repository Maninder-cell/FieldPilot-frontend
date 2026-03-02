'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  MapPin,
  User,
  FileText,
  Settings,
  DollarSign,
  Wind,
  Zap,
  Droplet,
  Cog,
  Laptop,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Package,
  Star,
  ThumbsUp,
  Minus,
  ThumbsDown
} from 'lucide-react';

import { createEquipment, updateEquipment } from '@/lib/equipment-api';
import { getBuildings, getBuilding } from '@/lib/buildings-api';
import { getCustomersForSelect, getCustomer as getCustomerById } from '@/lib/customers-api';
import { Equipment, CreateEquipmentData, EquipmentType, OperationalStatus, Condition } from '@/types/equipment';
import { toast } from 'react-hot-toast';
import CustomFieldsManager from '@/components/common/CustomFieldsManager';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';
import LazySelect from '@/components/common/LazySelect';

interface EquipmentModalProps {
  equipment: Equipment | null;
  onClose: () => void;
}

// Equipment Type Options
const equipmentTypeOptions: SelectOption[] = [
  { value: 'hvac', label: 'HVAC', icon: 'Wind', color: 'text-cyan-600' },
  { value: 'electrical', label: 'Electrical', icon: 'Zap', color: 'text-yellow-600' },
  { value: 'plumbing', label: 'Plumbing', icon: 'Droplet', color: 'text-blue-600' },
  { value: 'machinery', label: 'Machinery', icon: 'Cog', color: 'text-gray-600' },
  { value: 'it', label: 'IT Equipment', icon: 'Laptop', color: 'text-indigo-600' },
  { value: 'safety', label: 'Safety Equipment', icon: 'ShieldCheck', color: 'text-orange-600' },
  { value: 'other', label: 'Other', icon: 'Settings', color: 'text-gray-600' },
];

// Operational Status Options
const operationalStatusOptions: SelectOption[] = [
  { value: 'operational', label: 'Operational', icon: 'CheckCircle', color: 'text-green-600' },
  { value: 'maintenance', label: 'Maintenance', icon: 'Wrench', color: 'text-orange-600' },
  { value: 'broken', label: 'Broken', icon: 'XCircle', color: 'text-red-600' },
  { value: 'retired', label: 'Retired', icon: 'Package', color: 'text-gray-600' },
];

// Condition Options
const conditionOptions: SelectOption[] = [
  { value: 'excellent', label: 'Excellent', icon: 'Star', color: 'text-yellow-500' },
  { value: 'good', label: 'Good', icon: 'ThumbsUp', color: 'text-green-600' },
  { value: 'fair', label: 'Fair', icon: 'Minus', color: 'text-yellow-600' },
  { value: 'poor', label: 'Poor', icon: 'ThumbsDown', color: 'text-red-600' },
];

export default function EquipmentModal({ equipment, onClose }: EquipmentModalProps) {
  const [loading, setLoading] = useState(false);

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
    console.log('EquipmentModal - equipment:', !!equipment);
    if (equipment) {
      // Extract building_id - it can be an object or string
      const buildingId = typeof equipment.building === 'string'
        ? equipment.building
        : equipment.building?.id || '';

      console.log('EquipmentModal - building_id:', buildingId);

      setFormData({
        building_id: buildingId,
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
  }, [equipment]);

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
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {equipment ? 'Edit Equipment' : 'Create New Equipment'}
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
              {/* Building & Basic Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Wrench className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Building & Basic Information</h3>
                </div>

                <LazySelect
                  label="Building"
                  value={formData.building_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, building_id: Array.isArray(value) ? value[0] : value }))}
                  fetchItems={getBuildings}
                  fetchItemById={async (id) => {
                    const response = await getBuilding(id);
                    return { data: { id: response.data.id, name: response.data.name, code: response.data.code } };
                  }}
                  placeholder="Select a building"
                  required
                  disabled={false}
                  pageSize={5}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter equipment name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Equipment Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={equipmentTypeOptions}
                      value={formData.equipment_type || null}
                      onChange={(value) => setFormData(prev => ({ ...prev, equipment_type: value as EquipmentType }))}
                      placeholder="Select equipment type"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Operational Status
                    </label>
                    <CustomSelect
                      options={operationalStatusOptions}
                      value={formData.operational_status || null}
                      onChange={(value) => setFormData(prev => ({ ...prev, operational_status: value as OperationalStatus }))}
                      placeholder="Select status"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide a detailed description of the equipment..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>
              </div>

              {/* Equipment Details Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Equipment Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="e.g., Carrier, Trane"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Model number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      name="serial_number"
                      value={formData.serial_number}
                      onChange={handleChange}
                      placeholder="Serial number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Condition
                    </label>
                    <CustomSelect
                      options={conditionOptions}
                      value={formData.condition || null}
                      onChange={(value) => setFormData(prev => ({ ...prev, condition: value as Condition }))}
                      placeholder="Select condition"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Purchase Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Purchase & Warranty Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      name="purchase_price"
                      value={formData.purchase_price || ''}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">USD</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Installation Date
                    </label>
                    <input
                      type="date"
                      name="installation_date"
                      value={formData.installation_date || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Warranty Expiration
                    </label>
                    <input
                      type="date"
                      name="warranty_expiration"
                      value={formData.warranty_expiration || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-orange-100">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Customer <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>

                  <LazySelect
                    value={formData.customer_id || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, customer_id: (Array.isArray(value) ? value[0] : value) || undefined }))}
                    fetchItems={getCustomersForSelect}
                    fetchItemById={async (id) => {
                      const response = await getCustomerById(id);
                      return { data: { id: response.data.id, name: response.data.name, code: response.data.email } };
                    }}
                    placeholder="Select a customer"
                    disabled={loading}
                    pageSize={10}
                  />

                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                    Link this equipment to a customer account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any additional information about this equipment..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-100">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Settings className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Technical Specifications</h3>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Add technical specifications and parameters for this equipment
                  </p>
                </div>

                <CustomFieldsManager
                  value={formData.specifications || {}}
                  onChange={(value) => setFormData(prev => ({ ...prev, specifications: value }))}
                  disabled={loading}
                />
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
                    Add custom key-value pairs to store additional equipment information
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
                {equipment ? 'Update Equipment' : 'Create Equipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
