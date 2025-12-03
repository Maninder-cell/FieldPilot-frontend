'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import BuildingModal from '@/components/organization/BuildingModal';
import DeleteBuildingModal from '@/components/organization/DeleteBuildingModal';
import { Building2, Plus, Search, Edit, Trash2, Home, Wrench } from 'lucide-react';
import { getBuildings, createBuilding, updateBuilding, deleteBuilding } from '@/lib/buildings-api';
import { getFacilities } from '@/lib/facilities-api';
import { Building, CreateBuildingRequest } from '@/types/buildings';
import { Facility } from '@/types/facilities';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';

export default function BuildingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      loadBuildings();
      loadFacilities();
    }
  }, [user]);

  // Debounced search
  useEffect(() => {
    if (!user || !searchQuery) return;

    const timeoutId = setTimeout(() => {
      loadBuildings(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadBuildings = async (search?: string, page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await getBuildings({ search, page, page_size: size });
      setBuildings(response.data);
      setTotalCount(response.count || 0);
    } catch (error: any) {
      console.error('Failed to load buildings:', error);
      setBuildings([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFacilities = async () => {
    try {
      const response = await getFacilities();
      setFacilities(response.data);
    } catch (error: any) {
      console.error('Failed to load facilities:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleCreate = () => {
    setSelectedBuilding(null);
    setIsModalOpen(true);
  };

  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateBuildingRequest) => {
    try {
      setIsSubmitting(true);
      
      if (selectedBuilding) {
        await updateBuilding(selectedBuilding.id, data);
        toast.success('Building updated successfully');
      } else {
        await createBuilding(data);
        toast.success('Building created successfully');
      }
      
      setIsModalOpen(false);
      setSelectedBuilding(null);
      setSearchQuery('');
      loadBuildings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save building');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (building: Building) => {
    setBuildingToDelete(building);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!buildingToDelete) return;

    try {
      setIsDeleting(true);
      await deleteBuilding(buildingToDelete.id);
      toast.success('Building deleted successfully');
      setIsDeleteModalOpen(false);
      setBuildingToDelete(null);
      setSearchQuery('');
      loadBuildings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete building');
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
            <h1 className="text-2xl font-bold text-gray-900">Buildings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage buildings across all facilities
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Building
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
                placeholder="Search buildings..."
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
          ) : buildings.length === 0 ? (
            <div className="p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">No buildings</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get started by creating a new building.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    New Building
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
                      Building
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buildings.map((building) => (
                    <tr key={building.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{building.name}</div>
                          <div className="text-sm text-gray-500">{building.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{building.facility_name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {building.building_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            building.operational_status === 'operational'
                              ? 'bg-green-100 text-green-800'
                              : building.operational_status === 'maintenance'
                              ? 'bg-yellow-100 text-yellow-800'
                              : building.operational_status === 'under_construction'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {building.operational_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Wrench className="h-4 w-4" />
                          <span>{building.equipment_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(building)}
                          className="text-emerald-600 hover:text-emerald-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(building)}
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

          {!isLoading && buildings.length > 0 && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={(page) => {
                setCurrentPage(page);
                loadBuildings(searchQuery, page);
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
                loadBuildings(searchQuery, 1, size);
              }}
            />
          )}
        </div>
      </div>

      <BuildingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBuilding(null);
        }}
        onSubmit={handleSubmit}
        building={selectedBuilding}
        facilities={facilities}
        isLoading={isSubmitting}
      />

      <DeleteBuildingModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBuildingToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        building={buildingToDelete}
        isLoading={isDeleting}
      />
    </OrganizationLayout>
  );
}
