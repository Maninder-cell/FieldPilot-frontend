'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import FacilityModal from '@/components/organization/FacilityModal';
import DeleteFacilityModal from '@/components/organization/DeleteFacilityModal';
import { Home, Plus, Search, Edit, Trash2, Building, Wrench } from 'lucide-react';
import { getFacilities, getFacility, createFacility, updateFacility, deleteFacility } from '@/lib/facilities-api';
import { Facility, CreateFacilityRequest } from '@/types/facilities';
import { toast } from 'react-hot-toast';

export default function FacilitiesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Debounced search
  useEffect(() => {
    if (!user || !searchQuery) return;

    const timeoutId = setTimeout(() => {
      loadFacilities(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadFacilities = async (search?: string, page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await getFacilities({ search, page, page_size: size });
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
  };

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
      
      // Clear search and reload all facilities
      setSearchQuery('');
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
      
      // Clear search and reload all facilities
      setSearchQuery('');
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
      <div className="p-6 sm:p-8 space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your organization's facilities
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Facility
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
                placeholder="Search facilities..."
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assets
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facilities.map((facility) => (
                    <tr key={facility.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                          <div className="text-sm text-gray-500">{facility.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {facility.facility_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {facility.city && facility.state
                            ? `${facility.city}, ${facility.state}`
                            : facility.city || facility.state || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(facility)}
                          disabled={isFetchingDetails}
                          className="text-emerald-600 hover:text-emerald-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}

          {/* Pagination */}
          {!isLoading && facilities.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
                      loadFacilities(searchQuery, 1, newPageSize);
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
                      loadFacilities(searchQuery, newPage);
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
                              loadFacilities(searchQuery, page);
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
                        loadFacilities(searchQuery, newPage);
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
