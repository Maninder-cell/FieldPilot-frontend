'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  User,
  FileText,
  Settings,
  Warehouse,
  Building,
  Factory,
  Store,
  Server,
  Package,
  CheckCircle,
  Construction,
  Wrench,
  Lock
} from 'lucide-react';
import { Facility, CreateFacilityRequest } from '@/types/facilities';
import CustomFieldsManager from '@/components/common/CustomFieldsManager';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';
import LazySelect from '@/components/common/LazySelect';
import { getCustomersForSelect, getCustomer as getCustomerById } from '@/lib/customers-api';
import { toast } from 'react-hot-toast';

interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFacilityRequest) => Promise<void>;
  facility?: Facility | null;
  isLoading?: boolean;
}

// Facility Type Options
const facilityTypeOptions: SelectOption[] = [
  { value: 'warehouse', label: 'Warehouse', icon: 'Warehouse', color: 'text-blue-600' },
  { value: 'office', label: 'Office', icon: 'Building', color: 'text-purple-600' },
  { value: 'factory', label: 'Factory', icon: 'Factory', color: 'text-orange-600' },
  { value: 'retail', label: 'Retail', icon: 'Store', color: 'text-pink-600' },
  { value: 'datacenter', label: 'Data Center', icon: 'Server', color: 'text-indigo-600' },
  { value: 'other', label: 'Other', icon: 'Package', color: 'text-gray-600' },
];

// Operational Status Options
const operationalStatusOptions: SelectOption[] = [
  { value: 'operational', label: 'Operational', icon: 'CheckCircle', color: 'text-green-600' },
  { value: 'under_construction', label: 'Under Construction', icon: 'Construction', color: 'text-yellow-600' },
  { value: 'maintenance', label: 'Maintenance', icon: 'Wrench', color: 'text-orange-600' },
  { value: 'closed', label: 'Closed', icon: 'Lock', color: 'text-red-600' },
];

export default function FacilityModal({
  isOpen,
  onClose,
  onSubmit,
  facility,
  isLoading = false,
}: FacilityModalProps) {
  const [formData, setFormData] = useState<CreateFacilityRequest>({
    name: '',
    facility_type: 'other',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    latitude: null,
    longitude: null,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    operational_status: 'operational',
    square_footage: null,
    year_built: null,
    customer_id: null,
    notes: '',
    custom_fields: {},
  });

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name,
        facility_type: facility.facility_type,
        description: facility.description || '',
        address: facility.address || '',
        city: facility.city || '',
        state: facility.state || '',
        zip_code: facility.zip_code || '',
        country: facility.country || 'USA',
        latitude: facility.latitude,
        longitude: facility.longitude,
        contact_name: facility.contact_name || '',
        contact_email: facility.contact_email || '',
        contact_phone: facility.contact_phone || '',
        operational_status: facility.operational_status,
        square_footage: facility.square_footage,
        year_built: facility.year_built,
        customer_id: facility.customer?.id || null,
        notes: facility.notes || '',
        custom_fields: facility.custom_fields || {},
      });
    } else {
      setFormData({
        name: '',
        facility_type: 'other',
        description: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA',
        latitude: null,
        longitude: null,
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        operational_status: 'operational',
        square_footage: null,
        year_built: null,
        customer_id: null,
        notes: '',
        custom_fields: {},
      });
    }
  }, [facility, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;

    // Handle empty values
    if (value === '') {
      processedValue = null;
    }
    // Convert number inputs to actual numbers
    else if (type === 'number') {
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
                {facility ? 'Edit Facility' : 'Create New Facility'}
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
              {/* Basic Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Facility Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter facility name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Facility Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={facilityTypeOptions}
                      value={formData.facility_type}
                      onChange={(value) => setFormData(prev => ({ ...prev, facility_type: value as any }))}
                      placeholder="Select facility type"
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
                    Customer <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>

                  <LazySelect
                    value={formData.customer_id || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, customer_id: (Array.isArray(value) ? value[0] : value) || null }))}
                    fetchItems={getCustomersForSelect}
                    fetchItemById={async (id) => {
                      const response = await getCustomerById(id);
                      return { data: { id: response.data.id, name: response.data.name, code: response.data.email } };
                    }}
                    placeholder="Select a customer"
                    disabled={isLoading}
                    pageSize={10}
                  />

                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                    Link this facility to a customer account
                  </p>
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
                    placeholder="Provide a detailed description of the facility..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Address</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="San Francisco"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="CA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      placeholder="94102"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="USA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">GPS Coordinates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude || ''}
                        onChange={handleChange}
                        step="0.000001"
                        min="-90"
                        max="90"
                        placeholder="37.7749"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow bg-white"
                      />
                      <p className="mt-1 text-xs text-gray-500">Range: -90 to 90</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude || ''}
                        onChange={handleChange}
                        step="0.000001"
                        min="-180"
                        max="180"
                        placeholder="-122.4194"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow bg-white"
                      />
                      <p className="mt-1 text-xs text-gray-500">Range: -180 to 180</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
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

              {/* Additional Details Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-orange-100">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Additional Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      name="square_footage"
                      value={formData.square_footage || ''}
                      onChange={handleChange}
                      placeholder="10000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">Total area in square feet</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Year Built
                    </label>
                    <input
                      type="number"
                      name="year_built"
                      value={formData.year_built || ''}
                      onChange={handleChange}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">Construction year</p>
                  </div>
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
                    placeholder="Add any additional information about this facility..."
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
                    Add custom key-value pairs to store additional facility information
                  </p>
                </div>

                <CustomFieldsManager
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
                {facility ? 'Update Facility' : 'Create Facility'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
