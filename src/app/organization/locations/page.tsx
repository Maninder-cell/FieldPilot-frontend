'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import { getLocations, getLocationById } from '@/lib/locations-api';
import { Location } from '@/types/locations';
import LocationModal from '@/components/organization/LocationModal';
import DeleteLocationModal from '@/components/organization/DeleteLocationModal';
import { MapPin, Plus, Search, Edit, Trash2, Filter, X, Building2, Warehouse, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LocationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
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

  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      loadLocations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, entityTypeFilter]);

  const loadLocations = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const params: any = { page, page_size: size };
      
      if (searchQuery) params.search = searchQuery;
      if (entityTypeFilter) params.entity_type = entityTypeFilter;
      
      const response = await getLocations(params);
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
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setEntityTypeFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || entityTypeFilter;

  const handleCreate = () => {
    // Set to empty object to trigger modal open in create mode
    setSelectedLocation({} as Location);
  };

  const handleEdit = async (location: Location) => {
    try {
      setIsFetchingDetails(true);
      toast.loading('Loading location details...', { id: 'fetch-location' });
      
      const response = await getLocationById(location.id);
      setSelectedLocation(response.data);
      
      toast.dismiss('fetch-location');
    } catch (error: any) {
      console.error('Failed to load location details:', error);
      toast.error('Failed to load location details', { id: 'fetch-location' });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
  };

  const handleModalClose = () => {
    setSelectedLocation(null);
    loadLocations();
  };

  const handleDeleteModalClose = () => {
    setLocationToDelete(null);
    loadLocations();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadLocations(page, pageSize);
  };

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
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Locations</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Manage locations for facilities, buildings, and equipment
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Location
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm font-medium shadow-sm transition-all whitespace-nowrap ${
                  showFilters || hasActiveFilters
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xs:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                    {[entityTypeFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 sm:flex-none lg:hidden inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2.5">
                <label className="text-xs font-medium text-gray-700">Entity Type</label>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full xs:w-auto"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { value: '', label: 'All Types', icon: null },
                  { value: 'facility', label: 'Facility', icon: Building2 },
                  { value: 'building', label: 'Building', icon: Warehouse },
                  { value: 'equipment', label: 'Equipment', icon: Wrench },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setEntityTypeFilter(value);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      entityTypeFilter === value
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : locations.length === 0 ? (
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
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity Type</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locations.map((location) => (
                      <tr key={location.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{location.name}</div>
                          {location.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{location.description}</div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {location.entity_type}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900">{location.address || '-'}</div>
                          {location.has_coordinates && (
                            <div className="text-xs text-gray-500">
                              {location.latitude}, {location.longitude}
                            </div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-600 space-y-1">
                            {location.floor && <div>Floor: {location.floor}</div>}
                            {location.room && <div>Room: {location.room}</div>}
                            {location.zone && <div>Zone: {location.zone}</div>}
                            {!location.floor && !location.room && !location.zone && <div>-</div>}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right">
                          <button onClick={() => handleEdit(location)} disabled={isFetchingDetails} className="text-emerald-600 hover:text-emerald-900 mr-3 disabled:opacity-50">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteClick(location)} disabled={isFetchingDetails} className="text-red-600 hover:text-red-900 disabled:opacity-50">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-gray-200">
                {locations.map((location) => (
                  <div key={location.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{location.name}</h3>
                        {location.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{location.description}</p>
                        )}
                      </div>
                      <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize h-fit">
                        {location.entity_type}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Address:</span> {location.address || '-'}
                      </div>
                      {location.has_coordinates && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Coordinates:</span> {location.latitude}, {location.longitude}
                        </div>
                      )}
                      {(location.floor || location.room || location.zone) && (
                        <div className="text-xs text-gray-600">
                          {location.floor && <div><span className="font-medium">Floor:</span> {location.floor}</div>}
                          {location.room && <div><span className="font-medium">Room:</span> {location.room}</div>}
                          {location.zone && <div><span className="font-medium">Zone:</span> {location.zone}</div>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      <button onClick={() => handleEdit(location)} disabled={isFetchingDetails} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                        <Edit className="h-4 w-4" />Edit
                      </button>
                      <button onClick={() => handleDeleteClick(location)} disabled={isFetchingDetails} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!isLoading && locations.length > 0 && totalCount > pageSize && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 order-2 sm:order-1">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                <span className="font-medium">{totalCount}</span> results
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="sm:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                
                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <span className="md:hidden text-sm text-gray-700 px-2">
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedLocation && (
        <LocationModal
          location={Object.keys(selectedLocation).length === 0 ? null : selectedLocation}
          onClose={handleModalClose}
        />
      )}

      {locationToDelete && (
        <DeleteLocationModal
          location={locationToDelete}
          onClose={handleDeleteModalClose}
        />
      )}
    </OrganizationLayout>
  );
}
