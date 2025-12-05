'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import { getLocations } from '@/lib/locations-api';
import { Location } from '@/types/locations';
import LocationModal from '@/components/organization/LocationModal';
import DeleteLocationModal from '@/components/organization/DeleteLocationModal';
import { MapPin, Plus, Search, Edit, Trash2 } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

export default function LocationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadLocations();
    }
  }, [user]);

  const loadLocations = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await getLocations({ page, page_size: size });
      setLocations(response.data || []);
      setTotalCount(response.count || 0);
    } catch (error: any) {
      console.error('Failed to load locations:', error);
      setLocations([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleCreate = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (location: Location) => {
    try {
      const { toast } = await import('react-hot-toast');
      toast.loading('Loading location details...', { id: 'fetch-location' });
      
      // Fetch complete location data from detail endpoint
      const { getLocationById } = await import('@/lib/locations-api');
      const response = await getLocationById(location.id);
      setSelectedLocation(response.data);
      setIsModalOpen(true);
      
      toast.dismiss('fetch-location');
    } catch (error: any) {
      console.error('Failed to load location details:', error);
      const { toast } = await import('react-hot-toast');
      toast.error('Failed to load location details', { id: 'fetch-location' });
    }
  };

  const handleDelete = (location: Location) => {
    setLocationToDelete(location);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
    setSearchQuery('');
    setTimeout(() => loadLocations(), 100);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setLocationToDelete(null);
    setSearchQuery('');
    setTimeout(() => loadLocations(), 100);
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.entity_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <OrganizationLayout>
      <div className="p-6 sm:p-8 space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
            <p className="mt-1 text-gray-600">
              Manage locations for facilities, buildings, and equipment
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Location
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">No locations</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get started by creating a new location.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    New Location
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLocations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        {location.description && (
                          <div className="text-sm text-gray-500">{location.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{location.entity_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{location.address || '-'}</div>
                        {location.has_coordinates && (
                          <div className="text-xs text-gray-500">
                            {location.latitude}, {location.longitude}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 space-y-1">
                          {location.floor && <div>Floor: {location.floor}</div>}
                          {location.room && <div>Room: {location.room}</div>}
                          {location.zone && <div>Zone: {location.zone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-emerald-600 hover:text-emerald-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(location)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && filteredLocations.length > 0 && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={(page) => {
                setCurrentPage(page);
                loadLocations(page);
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
                loadLocations(1, size);
              }}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <LocationModal
          location={selectedLocation}
          onClose={handleModalClose}
        />
      )}

      {isDeleteModalOpen && locationToDelete && (
        <DeleteLocationModal
          location={locationToDelete}
          onClose={handleDeleteModalClose}
        />
      )}
    </OrganizationLayout>
  );
}
