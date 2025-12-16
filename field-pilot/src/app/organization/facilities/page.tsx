'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import FacilityModal from '@/components/organization/FacilityModal';
import DeleteFacilityModal from '@/components/organization/DeleteFacilityModal';
import { Home, Plus, Search, Edit, Trash2, Building, Wrench, Filter, X, CheckCircle2, Construction, AlertCircle, XCircle, Warehouse, Building2, Factory, Store, Server, MoreHorizontal } from 'lucide-react';
import { getFacilities, getFacility, createFacility, updateFacility, deleteFacility } from '@/lib/facilities-api';
import { Facility, CreateFacilityRequest } from '@/types/facilities';
import { toast } from 'react-hot-toast';

export default function FacilitiesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadFacilities();
    }
  }, [user]);

  // Debounced search and filters
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      loadFacilities();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, typeFilter]);

  const loadFacilities = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const params: any = { page, page_size: size };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      
      const response = await getFacilities(params);
      setFacilities(response.data);
      setTotalCount(response.count || 0);
    } catch (error: any) {
      console.error('Failed to load facilities:', error);
      setFacilities([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter || typeFilter;

  const handleCreate = () => {
    setSelectedFacility(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (facility: Facility) => {
    try {
      setIsFetchingDetails(true);
      toast.loading('Loading facility details...', { id: 'fetch-facility' });
      
      // Fetch complete facility data from detail endpoint
      const response = await getFacility(facility.id);
      setSelectedFacility(response.data);
      setIsModalOpen(true);
      
      toast.dismiss('fetch-facility');
    } catch (error: any) {
      console.error('Failed to load facility details:', error);
      toast.error('Failed to load facility details', { id: 'fetch-facility' });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleSubmit = async (data: CreateFacilityRequest) => {
    try {
      setIsSubmitting(true);
      
      if (selectedFacility) {
        await updateFacility(selectedFacility.id, data);
        toast.success('Facility updated successfully');
      } else {
        await createFacility(data);
        toast.success('Facility created successfully');
      }
      
      setIsModalOpen(false);
      setSelectedFacility(null);
      
      // Clear filters and reload all facilities
      clearFilters();
      loadFacilities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (facility: Facility) => {
    setFacilityToDelete(facility);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!facilityToDelete) return;

    try {
      setIsDeleting(true);
      await deleteFacility(facilityToDelete.id);
      toast.success('Facility deleted successfully');
      setIsDeleteModalOpen(false);
      setFacilityToDelete(null);
      
      // Clear filters and reload all facilities
      clearFilters();
      loadFacilities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete facility');
    } finally {
      setIsDeleting(false);
    }
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
        {/* Header with Search and Actions */}
        <div className="space-y-4">
          {/* Title Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Facilities</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Manage your organization's facilities
              </p>
            </div>
            {/* Add Facility Button - Desktop Only */}
            <button
              onClick={handleCreate}
              className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Facility
            </button>
          </div>

          {/* Search Bar and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search facilities..."
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
                    {[statusFilter, typeFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
              {/* Add Facility Button - Mobile/Tablet */}
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

        {/* Collapsible Filter Section */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Status Filter Pills */}
            <div>
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2.5">
                <label className="text-xs font-medium text-gray-700">
                  Status
                </label>
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
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === ''
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('operational');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'operational'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Operational
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('under_construction');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'under_construction'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Construction className="h-4 w-4" />
                  Under Construction
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('maintenance');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'maintenance'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  Maintenance
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('closed');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'closed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  Closed
                </button>
              </div>
            </div>

            {/* Type Filter Pills */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Facility Type
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    setTypeFilter('');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === ''
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('warehouse');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'warehouse'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <Warehouse className="h-4 w-4" />
                  Warehouse
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('office');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'office'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Office
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('factory');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'factory'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <Factory className="h-4 w-4" />
                  Factory
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('retail');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'retail'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  Retail
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('datacenter');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'datacenter'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <Server className="h-4 w-4" />
                  Data Center
                </button>
                <button
                  onClick={() => {
                    setTypeFilter('other');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'other'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Other
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Data Table */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : facilities.length === 0 ? (
            <div className="p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Home className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">No facilities</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get started by creating a new facility.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    New Facility
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facility
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assets
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {facilities.map((facility) => (
                      <tr key={facility.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                            <div className="text-sm text-gray-500">{facility.code}</div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {facility.facility_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {facility.city && facility.state
                              ? `${facility.city}, ${facility.state}`
                              : facility.city || facility.state || '-'}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              facility.operational_status === 'operational'
                                ? 'bg-green-100 text-green-800'
                                : facility.operational_status === 'maintenance'
                                ? 'bg-yellow-100 text-yellow-800'
                                : facility.operational_status === 'under_construction'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {facility.operational_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 lg:gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{facility.buildings_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Wrench className="h-4 w-4" />
                              <span>{facility.equipment_count}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(facility)}
                            disabled={isFetchingDetails}
                            className="text-emerald-600 hover:text-emerald-900 mr-3 lg:mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit facility"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(facility)}
                            disabled={isFetchingDetails}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete facility"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {facilities.map((facility) => (
                  <div key={facility.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{facility.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{facility.code}</p>
                      </div>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          facility.operational_status === 'operational'
                            ? 'bg-green-100 text-green-800'
                            : facility.operational_status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : facility.operational_status === 'under_construction'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {facility.operational_status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="font-medium w-16">Type:</span>
                        <span className="capitalize">{facility.facility_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="font-medium w-16">Location:</span>
                        <span>
                          {facility.city && facility.state
                            ? `${facility.city}, ${facility.state}`
                            : facility.city || facility.state || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-3.5 w-3.5" />
                          <span>{facility.buildings_count} Buildings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3.5 w-3.5" />
                          <span>{facility.equipment_count} Equipment</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(facility)}
                        disabled={isFetchingDetails}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(facility)}
                        disabled={isFetchingDetails}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && facilities.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              {/* Mobile Pagination */}
              <div className="flex md:hidden flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize = Number(e.target.value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                      loadFacilities(1, newPageSize);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                {totalCount > pageSize && (
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        const newPage = currentPage - 1;
                        setCurrentPage(newPage);
                        loadFacilities(newPage);
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ‹ Prev
                    </button>
                    <span className="px-3 py-1.5 text-sm text-gray-900 font-medium">
                      {currentPage} / {Math.ceil(totalCount / pageSize)}
                    </span>
                    <button
                      onClick={() => {
                        const newPage = currentPage + 1;
                        setCurrentPage(newPage);
                        loadFacilities(newPage);
                      }}
                      disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Pagination */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Items per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        const newPageSize = Number(e.target.value);
                        setPageSize(newPageSize);
                        setCurrentPage(1);
                        loadFacilities(1, newPageSize);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {totalCount > pageSize && (
                    <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newPage = currentPage - 1;
                        setCurrentPage(newPage);
                        loadFacilities(newPage);
                      }}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(totalCount / pageSize);
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      if (page === currentPage - 2 || page === currentPage + 2) return page;
                      return false;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => {
                              setCurrentPage(page);
                              loadFacilities(page);
                            }}
                            className={`min-w-[32px] px-3 py-1 rounded text-sm font-medium ${
                              currentPage === page
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => {
                        const newPage = currentPage + 1;
                        setCurrentPage(newPage);
                        loadFacilities(newPage);
                      }}
                      disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ›
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFacility(null);
        }}
        onSubmit={handleSubmit}
        facility={selectedFacility}
        isLoading={isSubmitting}
      />

      <DeleteFacilityModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFacilityToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        facility={facilityToDelete}
        isLoading={isDeleting}
      />
    </OrganizationLayout>
  );
}
