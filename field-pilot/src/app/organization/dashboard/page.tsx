'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import FacilityModal from '@/components/organization/FacilityModal';
import BuildingModal from '@/components/organization/BuildingModal';
import EquipmentModal from '@/components/organization/EquipmentModal';
import LocationModal from '@/components/organization/LocationModal';
import { Building2, Wrench, MapPin, Home } from 'lucide-react';
import { CreateFacilityRequest } from '@/types/facilities';
import { CreateBuildingRequest } from '@/types/buildings';

export default function OrganizationDashboard() {
  const { user, isLoading } = useAuth();
  const { tenant } = useOnboarding();
  const router = useRouter();

  // Modal states
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Handler functions for modal submissions
  const handleFacilitySubmit = async (data: CreateFacilityRequest) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create facility
      console.log('Creating facility:', data);
      // After successful creation, close modal and refresh data
      setIsFacilityModalOpen(false);
    } catch (error) {
      console.error('Error creating facility:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuildingSubmit = async (data: CreateBuildingRequest) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create building
      console.log('Creating building:', data);
      setIsBuildingModalOpen(false);
    } catch (error) {
      console.error('Error creating building:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Equipment and Location modals handle their own API calls
  const handleEquipmentClose = () => {
    setIsEquipmentModalOpen(false);
  };

  const handleLocationClose = () => {
    setIsLocationModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !tenant) {
    return null;
  }

  const stats = [
    {
      name: 'Total Facilities',
      value: '0',
      icon: Home,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Total Buildings',
      value: '0',
      icon: Building2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Total Equipment',
      value: '0',
      icon: Wrench,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Total Locations',
      value: '0',
      icon: MapPin,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <OrganizationLayout>
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to {tenant?.name || 'your'} organization portal
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} rounded-lg p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => setIsFacilityModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              Add Facility
            </button>
            <button
              onClick={() => setIsBuildingModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Building2 className="h-5 w-5" />
              Add Building
            </button>
            <button
              onClick={() => setIsEquipmentModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Wrench className="h-5 w-5" />
              Add Equipment
            </button>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <MapPin className="h-5 w-5" />
              Add Location
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FacilityModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        onSubmit={handleFacilitySubmit}
        isLoading={isSubmitting}
      />
      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        onSubmit={handleBuildingSubmit}
        isLoading={isSubmitting}
      />
      {isEquipmentModalOpen && (
        <EquipmentModal
          equipment={null}
          onClose={handleEquipmentClose}
        />
      )}
      {isLocationModalOpen && (
        <LocationModal
          location={null}
          onClose={handleLocationClose}
        />
      )}
    </OrganizationLayout>
  );
}
