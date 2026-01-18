'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/token-utils';
import { getApiUrl } from '@/lib/api-utils';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    ArrowLeft,
    Package,
    MapPin,
    Calendar,
    Wrench,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Plus,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EquipmentDetail() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const equipmentId = params.id as string;

    const [equipment, setEquipment] = useState<any>(null);
    const [serviceHistory, setServiceHistory] = useState<any[]>([]);
    const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && equipmentId) {
            loadEquipmentData();
        }
    }, [user, authLoading, router, equipmentId]);

    const loadEquipmentData = async () => {
        try {
            setIsLoading(true);
            const accessToken = getAccessToken();
            if (!accessToken) {
                router.push('/login');
                return;
            }

            const apiUrl = getApiUrl(true);

            // Load equipment details
            const equipmentResponse = await fetch(`${apiUrl}/service-requests/customer/equipment/${equipmentId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (!equipmentResponse.ok) {
                throw new Error('Failed to fetch equipment');
            }

            const equipmentData = await equipmentResponse.json();
            setEquipment(equipmentData.success ? equipmentData.data : equipmentData);

            // Load service history
            try {
                const historyResponse = await fetch(`${apiUrl}/service-requests/customer/equipment/${equipmentId}/history/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setServiceHistory(historyData.success ? historyData.data : historyData);
                }
            } catch (error) {
                console.error('Failed to load service history:', error);
            }

            // Load upcoming services
            try {
                const upcomingResponse = await fetch(`${apiUrl}/service-requests/customer/equipment/${equipmentId}/upcoming/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                if (upcomingResponse.ok) {
                    const upcomingData = await upcomingResponse.json();
                    setUpcomingServices(upcomingData.success ? upcomingData.data : upcomingData);
                }
            } catch (error) {
                console.error('Failed to load upcoming services:', error);
            }

        } catch (error: any) {
            console.error('Failed to load equipment:', error);
            toast.error('Failed to load equipment details');
            router.push('/customer/equipment');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'operational':
                return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
            case 'maintenance':
                return <Wrench className="h-6 w-6 text-orange-600" />;
            case 'broken':
                return <AlertCircle className="h-6 w-6 text-red-600" />;
            case 'retired':
                return <Clock className="h-6 w-6 text-gray-600" />;
            default:
                return <Package className="h-6 w-6 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'operational':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'maintenance':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'broken':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'retired':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getConditionColor = (condition: string) => {
        switch (condition?.toLowerCase()) {
            case 'excellent':
                return 'bg-emerald-100 text-emerald-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'fair':
                return 'bg-yellow-100 text-yellow-800';
            case 'poor':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
            </CustomerLayout>
        );
    }

    if (!equipment) {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Not Found</h3>
                        <button
                            onClick={() => router.push('/customer/equipment')}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            Back to Equipment
                        </button>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatusIcon(equipment.operational_status)}
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {equipment.name}
                                    </h1>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Equipment #{equipment.equipment_number}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(`/customer/requests/new?equipment=${equipmentId}`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span className="hidden sm:inline">New Request</span>
                            </button>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(equipment.operational_status)}`}>
                                {formatStatus(equipment.operational_status)}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getConditionColor(equipment.condition)}`}>
                                Condition: {formatStatus(equipment.condition)}
                            </span>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {formatStatus(equipment.equipment_type)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Equipment Details */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-emerald-600" />
                                    Equipment Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                                        <p className="text-sm font-medium text-gray-900">{equipment.manufacturer || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Model</p>
                                        <p className="text-sm font-medium text-gray-900">{equipment.model || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                                        <p className="text-sm font-medium text-gray-900 font-mono">{equipment.serial_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Equipment Type</p>
                                        <p className="text-sm font-medium text-gray-900">{formatStatus(equipment.equipment_type)}</p>
                                    </div>
                                </div>
                                {equipment.description && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Description</p>
                                        <p className="text-sm text-gray-700">{equipment.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                    Location
                                </h2>
                                <div className="space-y-3">
                                    {equipment.facility && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Facility:</span>
                                            <span className="text-sm font-medium text-gray-900">{equipment.facility.name}</span>
                                        </div>
                                    )}
                                    {equipment.building && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Building:</span>
                                            <span className="text-sm font-medium text-gray-900">{equipment.building.name}</span>
                                        </div>
                                    )}
                                    {equipment.location && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Specific Location:</span>
                                            <span className="text-sm font-medium text-gray-900">{equipment.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Service History */}
                            {serviceHistory && serviceHistory.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                        Service History
                                    </h2>
                                    <div className="space-y-4">
                                        {serviceHistory.map((service: any, index: number) => (
                                            <div
                                                key={index}
                                                className="border-l-4 border-emerald-500 pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r transition-colors"
                                                onClick={() => router.push(`/customer/requests/${service.id}`)}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900">{service.title}</span>
                                                    <span className="text-xs text-gray-500">{formatDate(service.created_at)}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">{service.request_number}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Services */}
                            {upcomingServices && upcomingServices.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-emerald-600" />
                                        Upcoming Services
                                    </h2>
                                    <div className="space-y-4">
                                        {upcomingServices.map((service: any, index: number) => (
                                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900">{service.task_number}</span>
                                                    <span className="text-xs text-gray-500">{formatDate(service.scheduled_start)}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">{service.equipment_name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Dates */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    Important Dates
                                </h2>
                                <div className="space-y-4">
                                    {equipment.installation_date && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Installation Date</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDate(equipment.installation_date)}</p>
                                        </div>
                                    )}
                                    {equipment.warranty_expiry && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Warranty Expiry</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDate(equipment.warranty_expiry)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(equipment.updated_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => router.push(`/customer/requests/new?equipment=${equipmentId}`)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Create Service Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
