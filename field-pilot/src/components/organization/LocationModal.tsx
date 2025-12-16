'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Building2, FileText, Settings, Globe } from 'lucide-react';
import { createLocation, updateLocation } from '@/lib/locations-api';
import { getFacilities } from '@/lib/facilities-api';
import { getBuildings } from '@/lib/buildings-api';
import { getEquipment } from '@/lib/equipment-api';
import { Location, CreateLocationData } from '@/types/locations';
import { toast } from 'react-hot-toast';
import CustomFieldsInput from '@/components/common/CustomFieldsInput';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';

interface LocationModalProps {
  location: Location | null;
  onClose: () => void;
}

// Entity Type Options
const entityTypeOptions: SelectOption[] = [
  { value: 'facility', label: 'Facility', icon: '🏢' },
  { value: 'building', label: 'Building', icon: '🏗️' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
];

export default function LocationModal({ location, onClose }: LocationModalProps) {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateLocationData>({
    entity_type: 'facility',
    entity_id: '',
    name: '',
    description: '',
    latitude: undefined,
    longitude: undefined,
    address: '',
    floor: '',
    room: '',
    zone: '',
    additional_info: {},
  });

  useEffect(() => {
    console.log('LocationModal - location:', !!location, 'entities:', entities.length);
    if (location) {
      setFormData({
        entity_type: location.entity_type,
        entity_id: location.entity_id,
        name: location.name,
        description: location.description,
        latitude: location.latitude || undefined,
        longitude: location.longitude || undefined,
        address: location.address,
        floor: location.floor,
        room: location.room,
        zone: location.zone,
        additional_info: location.additional_info || {},
      });
    }
    loadEntities(formData.entity_type);
  }, [location]);

  const loadEntities = async (entityType: string) => {
    try {
      let response;
      if (entityType === 'facility') {
        response = await getFacilities({ page_size: 1000 });
      } else if (entityType === 'building') {
        response = await getBuildings({ page_size: 1000 });
      } else if (entityType === 'equipment') {
        response = await getEquipment({ page_size: 1000 });
      }
      console.log(`Loaded ${entityType}:`, response?.data?.length || 0);
      setEntities(response?.data || []);
    } catch (error) {
      console.error('Failed to load entities:', error);
      setEntities([]);
    }
  };

  const handleEntityTypeChange = (type: string) => {
    setFormData({ ...formData, entity_type: type, entity_id: '' });
    loadEntities(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Clean up the data - convert empty strings to undefined
      const cleanedData = {
        ...formData,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        description: formData.description || undefined,
        address: formData.address || undefined,
        floor: formData.floor || undefined,
        room: formData.room || undefined,
        zone: formData.zone || undefined,
      };
      
      if (location) {
        const { entity_type, entity_id, ...updateData } = cleanedData;
        await updateLocation(location.id, updateData);
        toast.success('Location updated successfully');
      } else {
        await createLocation(cleanedData);
        toast.success('Location created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  // Convert entities to SelectOption format
  const entityOptions: SelectOption[] = entities.map(entity => ({
    value: entity.id,
    label: entity.name,
    description: entity.code ? `Code: ${entity.code}` : undefined,
  }));

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
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {location ? 'Edit Location' : 'Create New Location'}
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
              {/* Entity Selection Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Entity Selection</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Entity Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={entityTypeOptions}
                      value={formData.entity_type || null}
                      onChange={(value) => handleEntityTypeChange(value)}
                      placeholder="Select entity type"
                      disabled={!!location || loading}
                    />
                    {location && (
                      <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                        Entity type cannot be changed after creation
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select {formData.entity_type} <span className="text-red-500">*</span>
                    </label>
                    {entities.length === 0 ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                        {loading ? 'Loading...' : `No ${formData.entity_type}s available`}
                      </div>
                    ) : (
                      <CustomSelect
                        options={entityOptions}
                        value={formData.entity_id || null}
                        onChange={(value) => setFormData({ ...formData, entity_id: value })}
                        placeholder={`Select ${formData.entity_type}...`}
                        disabled={!!location || loading}
                        searchable={true}
                      />
                    )}
                    {entities.length === 0 && !location && (
                      <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-amber-600 rounded-full"></span>
                        Please create a {formData.entity_type} first before adding a location
                      </p>
                    )}
                    {location && (
                      <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                        Entity cannot be changed after creation
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Details Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Location Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter location name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Provide a detailed description of the location..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street, City, State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="e.g., 3rd Floor"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Room
                    </label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g., Room 301"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Zone
                    </label>
                    <input
                      type="text"
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      placeholder="e.g., North Wing"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* GPS Coordinates Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">GPS Coordinates</h3>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">Optional:</span> Add GPS coordinates for precise location mapping
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      step="0.000001"
                      min="-90"
                      max="90"
                      placeholder="37.7749"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">Range: -90 to 90</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      step="0.000001"
                      min="-180"
                      max="180"
                      placeholder="-122.4194"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    />
                    <p className="mt-1 text-xs text-gray-500">Range: -180 to 180</p>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Add custom key-value pairs to store additional location information
                  </p>
                </div>

                <CustomFieldsInput
                  value={formData.additional_info || {}}
                  onChange={(value) => setFormData({ ...formData, additional_info: value })}
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
                disabled={loading || (entities.length === 0 && !location)}
                className="px-8 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {location ? 'Update Location' : 'Create Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
