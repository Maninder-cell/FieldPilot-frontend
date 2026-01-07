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
import { Building2, Wrench, MapPin, Home, TrendingUp, Activity } from 'lucide-react';
import { CreateFacilityRequest } from '@/types/facilities';
import { CreateBuildingRequest } from '@/types/buildings';
import { getDashboardStats, getTaskStatusBreakdown, getEquipmentStatusBreakdown, getWeeklyActivity } from '@/lib/dashboard-api';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OrganizationDashboard() {
  const { user, isLoading } = useAuth();
  const { tenant } = useOnboarding();
  const router = useRouter();

  // Dashboard stats
  const [stats, setStats] = useState({
    facilities_count: 0,
    buildings_count: 0,
    equipment_count: 0,
    locations_count: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [equipmentStatusData, setEquipmentStatusData] = useState<any[]>([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([]);

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

  // Load dashboard stats
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const [statsData, taskStatus, equipmentStatus, weeklyActivity] = await Promise.all([
        getDashboardStats(),
        getTaskStatusBreakdown(),
        getEquipmentStatusBreakdown(),
        Promise.resolve(getWeeklyActivity()),
      ]);
      
      setStats(statsData);
      setTaskStatusData(taskStatus);
      setEquipmentStatusData(equipmentStatus);
      setWeeklyActivityData(weeklyActivity);
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Handler functions for modal submissions
  const handleFacilitySubmit = async (data: CreateFacilityRequest) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create facility
      console.log('Creating facility:', data);
      // After successful creation, close modal and refresh data
      setIsFacilityModalOpen(false);
      loadDashboardStats(); // Refresh stats
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
      loadDashboardStats(); // Refresh stats
    } catch (error) {
      console.error('Error creating building:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Equipment and Location modals handle their own API calls
  const handleEquipmentClose = () => {
    setIsEquipmentModalOpen(false);
    loadDashboardStats(); // Refresh stats
  };

  const handleLocationClose = () => {
    setIsLocationModalOpen(false);
    loadDashboardStats(); // Refresh stats
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

  const statsCards = [
    {
      name: 'Total Facilities',
      value: isLoadingStats ? '-' : stats.facilities_count.toString(),
      icon: Home,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Total Buildings',
      value: isLoadingStats ? '-' : stats.buildings_count.toString(),
      icon: Building2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Total Equipment',
      value: isLoadingStats ? '-' : stats.equipment_count.toString(),
      icon: Wrench,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Total Locations',
      value: isLoadingStats ? '-' : stats.locations_count.toString(),
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
          {statsCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {isLoadingStats ? (
                      <span className="inline-block animate-pulse bg-gray-200 rounded h-9 w-12"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`${stat.iconBg} rounded-lg p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="tasks" fill="#10b981" name="Tasks" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="equipment" fill="#3b82f6" name="Equipment" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Task Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Task Status</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.status}: ${entry.count} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No task data available
              </div>
            )}
          </div>

          {/* Equipment Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Wrench className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Equipment Status</h2>
            </div>
            {isLoadingStats ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : equipmentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={equipmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.status}: ${entry.count} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {equipmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No equipment data available
              </div>
            )}
          </div>
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
