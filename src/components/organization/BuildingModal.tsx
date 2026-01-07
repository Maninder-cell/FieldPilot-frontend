'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Building2, MapPin, User, FileText, Settings, ChevronDown, Check } from 'lucide-react';
import { Building, CreateBuildingRequest } from '@/types/buildings';
import { Facility } from '@/types/facilities';
import CustomFieldsInput from '@/components/common/CustomFieldsInput';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';
import LazySelect from '@/components/common/LazySelect';
import { getFacilities, getFacility } from '@/lib/facilities-api';

interface BuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBuildingRequest) => Promise<void>;
  building?: Building | null;
  isLoading?: boolean;
}

// Building Type Options
const buildingTypeOptions: SelectOption[] = [
  { value: 'office', label: 'Office', icon: '🏢' },
  { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
  { value: 'production', label: 'Production', icon: '🏗️' },
  { value: 'storage', label: 'Storage', icon: '📦' },
  { value: 'laboratory', label: 'Laboratory', icon: '🔬' },
  { value: 'other', label: 'Other', icon: '🏛️' },
];

// Operational Status Options
const operationalStatusOptions: SelectOption[] = [
  { value: 'operational', label: 'Operational', icon: '✅' },
  { value: 'under_construction', label: 'Under Construction', icon: '🚧' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'closed', label: 'Closed', icon: '🔒' },
];

// Mock customer data - replace with actual API call
const mockCustomers = [
  { id: '1', name: 'Acme Corporation', email: 'contact@acme.com' },
  { id: '2', name: 'TechStart Inc', email: 'info@techstart.com' },
  { id: '3', name: 'Global Industries', email: 'hello@global.com' },
  { id: '4', name: 'Innovation Labs', email: 'contact@innovation.com' },
  { id: '5', name: 'Future Systems', email: 'info@future.com' },
];

export default function BuildingModal({
  isOpen,
  onClose,
  onSubmit,
  building,
  isLoading = false,
}: BuildingModalProps) {
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    console.log('BuildingModal - building:', !!building);
    if (building) {
      // Extract facility_id - it can be an object or string
      const facilityId = typeof building.facility === 'string' 
        ? building.facility 
        : building.facility?.id || '';
      
      console.log('BuildingModal - facility_id:', facilityId);
      
      setFormData({
        facility_id: facilityId,
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
    }
  }, [building, isOpen]);

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

  const selectedCustomer = mockCustomers.find(c => c.id === formData.customer_id);
  
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const handleCustomerSelect = (customerId: string | null) => {
    setFormData(prev => ({ ...prev, customer_id: customerId }));
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
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {building ? 'Edit Building' : 'Create New Building'}
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
              {/* Facility Selection Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Facility & Basic Information</h3>
                </div>

                <LazySelect
                  label="Facility"
                  value={formData.facility_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, facility_id: value }))}
                  fetchItems={getFacilities}
                  fetchItemById={async (id) => {
                    const response = await getFacility(id);
                    return { data: { id: response.data.id, name: response.data.name, code: response.data.code } };
                  }}
                  placeholder="Select a facility"
                  required
                  disabled={false}
                  pageSize={5}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Building Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter building name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Building Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={buildingTypeOptions}
                      value={formData.building_type || null}
                      onChange={(value) => setFormData(prev => ({ ...prev, building_type: value as any }))}
                      placeholder="Select building type"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Operational Status
                    </label>
                    <CustomSelect
                      options={operationalStatusOptions}
                      value={formData.operational_status || null}
                      onChange={(value) => setFormData(prev => ({ ...prev, operational_status: value as any }))}
                      placeholder="Select status"
                      disabled={isLoading}
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
                    placeholder="Provide a detailed description of the building..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>
              </div>

              {/* Physical Details Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Physical Details & Address</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Floor Count
                    </label>
                    <input
                      type="number"
                      name="floor_count"
                      value={formData.floor_count || ''}
                      onChange={handleChange}
                      placeholder="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">Number of floors</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      name="square_footage"
                      value={formData.square_footage || ''}
                      onChange={handleChange}
                      placeholder="50000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">Total area in sq ft</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Construction Year
                    </label>
                    <input
                      type="number"
                      name="construction_year"
                      value={formData.construction_year || ''}
                      onChange={handleChange}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">Year built</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, City, State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>
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
                    Link this building to a customer account
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
                    placeholder="Add any additional information about this building..."
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
                    Add custom key-value pairs to store additional building information
                  </p>
                </div>
                
                <CustomFieldsInput
                  value={formData.custom_fields || {}}
                  onChange={(value) => setFormData(prev => ({ ...prev, custom_fields: value }))}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-between items-center shadow-lg">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
