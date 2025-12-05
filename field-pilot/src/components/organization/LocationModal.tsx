'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createLocation, updateLocation } from '@/lib/locations-api';
import { getFacilities } from '@/lib/facilities-api';
import { getBuildings } from '@/lib/buildings-api';
import { getEquipment } from '@/lib/equipment-api';
import { Location, CreateLocationData } from '@/types/locations';
import { toast } from 'react-hot-toast';
import CustomFieldsInput from '@/components/common/CustomFieldsInput';

interface LocationModalProps {
  location: Location | null;
  onClose: () => void;
}

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {location ? 'Edit Location' : 'Create New Location'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Entity Selection</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type *
                  </label>
                  <select
                    value={formData.entity_type}
                    onChange={(e) => handleEntityTypeChange(e.target.value)}
                    disabled={!!location}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="facility">Facility</option>
                    <option value="building">Building</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select {formData.entity_type} *
                  </label>
                  <select
                    value={formData.entity_id}
                    onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                    required
                    disabled={!!location || entities.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  >
                    {entities.length === 0 ? (
                      <option value="">Loading {formData.entity_type}s...</option>
                    ) : (
                      <>
                        <option value="">Select {formData.entity_type}...</option>
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name} {entity.code ? `(${entity.code})` : ''}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {entities.length === 0 && !location && (
                    <p className="mt-1 text-xs text-amber-600">
                      Please create a {formData.entity_type} first before adding a location.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Location Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone
                  </label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Coordinates */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Coordinates (Optional)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    step="0.000001"
                    min="-90"
                    max="90"
                    placeholder="-90 to 90"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    step="0.000001"
                    min="-180"
                    max="180"
                    placeholder="-180 to 180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Additional Information</h3>
              <CustomFieldsInput
                value={formData.additional_info || {}}
                onChange={(value) => setFormData({ ...formData, additional_info: value })}
                disabled={loading}
              />
            </div>

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
                {location ? 'Update Location' : 'Create Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
