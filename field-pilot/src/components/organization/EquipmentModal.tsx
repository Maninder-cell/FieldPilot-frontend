'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Wrench, MapPin, User, FileText, Settings, DollarSign, ChevronDown, Check } from 'lucide-react';

import { createEquipment, updateEquipment } from '@/lib/equipment-api';
import { getBuildings, getBuilding } from '@/lib/buildings-api';
import { Equipment, CreateEquipmentData, EquipmentType, OperationalStatus, Condition } from '@/types/equipment';
import { toast } from 'react-hot-toast';
import CustomFieldsInput from '@/components/common/CustomFieldsInput';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';
import LazySelect from '@/components/common/LazySelect';

interface EquipmentModalProps {
  equipment: Equipment | null;
  onClose: () => void;
}

// Equipment Type Options
const equipmentTypeOptions: SelectOption[] = [
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
  { value: 'machinery', label: 'Machinery', icon: '⚙️' },
  { value: 'it', label: 'IT Equipment', icon: '💻' },
  { value: 'safety', label: 'Safety Equipment', icon: '🦺' },
  { value: 'other', label: 'Other', icon: '🔧' },
];

// Operational Status Options
const operationalStatusOptions: SelectOption[] = [
  { value: 'operational', label: 'Operational', icon: '✅' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'broken', label: 'Broken', icon: '❌' },
  { value: 'retired', label: 'Retired', icon: '📦' },
];

// Condition Options
const conditionOptions: SelectOption[] = [
  { value: 'excellent', label: 'Excellent', icon: '⭐' },
  { value: 'good', label: 'Good', icon: '👍' },
  { value: 'fair', label: 'Fair', icon: '👌' },
  { value: 'poor', label: 'Poor', icon: '👎' },
];

// Mock customer data
const mockCustomers = [
  { id: '1', name: 'Acme Corporation', email: 'contact@acme.com' },
  { id: '2', name: 'TechStart Inc', email: 'info@techstart.com' },
  { id: '3', name: 'Global Industries', email: 'hello@global.com' },
  { id: '4', name: 'Innovation Labs', email: 'contact@innovation.com' },
  { id: '5', name: 'Future Systems', email: 'info@future.com' },
];

export default function EquipmentModal({ equipment, onClose }: EquipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const selectedCustomer = mockCustomers.find(c => c.id === formData.customer_id);
  
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const handleCustomerSelect = (customerId: string | null) => {
    setFormData(prev => ({ ...prev, customer_id: customerId || undefined }));
    setIsCustomerDropdownOpen(false);
    setCustomerSearchQuery('');
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
                  onChange={(value) => setFormData(prev => ({ ...prev, building_id: value }))}
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
                  
                  {/* Custom Customer Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow bg-white text-left flex items-center justify-between hover:border-gray-400"
                    >
                      <span className={selectedCustomer ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedCustomer ? selectedCustomer.name : 'Select a customer'}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCustomerDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                            placeholder="Search customers..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => handleCustomerSelect(null)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-500">No customer</div>
                              <div className="text-xs text-gray-400">Leave unassigned</div>
                            </div>
                            {!selectedCustomer && (
                              <Check className="h-5 w-5 text-emerald-600" />
                            )}
                          </button>

                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => handleCustomerSelect(customer.id)}
                                className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between group border-t border-gray-100"
                              >
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                  <div className="text-xs text-gray-500">{customer.email}</div>
                                </div>
                                {selectedCustomer?.id === customer.id && (
                                  <Check className="h-5 w-5 text-emerald-600" />
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                              No customers found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

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

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-800">
                    Add technical specifications and parameters for this equipment
                  </p>
                </div>

                <CustomFieldsInput
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

                <CustomFieldsInput
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
