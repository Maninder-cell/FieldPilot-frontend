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
    Loader2,
    ChevronRight,
    RefreshCw,
    Info,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'operational':
                return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Operational' };
            case 'needs_maintenance':
            case 'maintenance':
                return { icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Needs Maintenance' };
            case 'out_of_service':
            case 'broken':
                return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Service' };
            case 'retired':
                return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Retired' };
            default:
                return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-100', label: status || 'Unknown' };
        }
    };

    const formatStatus = (status: string) => {
        if (!status) return 'Unknown';
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="min-h-full bg-gray-50 flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">Loading equipment details...</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (!equipment) {
        return (
            <CustomerLayout>
                <div className="min-h-full bg-gray-50 flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment Not Found</h3>
                        <p className="text-gray-600 mb-4">The equipment you're looking for doesn't exist.</p>
                        <Link
                            href="/customer/equipment"
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Equipment
                        </Link>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    const statusConfig = getStatusConfig(equipment.status || equipment.operational_status);
    const StatusIcon = statusConfig.icon;

    return (
        <CustomerLayout>
            <div className="bg-gray-50 min-h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Link href="/customer/equipment" className="hover:text-emerald-600 transition-colors">
                                Equipment
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-gray-900 font-medium">{equipment.equipment_number}</span>
                        </div>

                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {equipment.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {equipment.equipment_number}
                                    </p>
                                    {/* Status Tags */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusConfig.label}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            <Package className="h-3.5 w-3.5" />
                                            {formatStatus(equipment.equipment_type)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={loadEquipmentData}
                                disabled={isLoading}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                                title="Refresh"
                            >
                                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Equipment Information Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-emerald-600" />
                                        Equipment Information
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Manufacturer</p>
                                            <p className="text-sm font-semibold text-gray-900">{equipment.manufacturer || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Model</p>
                                            <p className="text-sm font-semibold text-gray-900">{equipment.model || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serial Number</p>
                                            <p className="text-sm text-gray-700 font-mono">{equipment.serial_number || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipment Type</p>
                                            <p className="text-sm text-gray-700">{formatStatus(equipment.equipment_type)}</p>
                                        </div>
                                    </div>
                                    {equipment.description && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{equipment.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-emerald-600" />
                                        Location
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Facility</p>
                                            <p className="text-sm font-semibold text-gray-900">{equipment.facility?.name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Building</p>
                                            <p className="text-sm text-gray-700">{equipment.building?.name || 'N/A'}</p>
                                        </div>
                                        {equipment.location && (
                                            <div className="space-y-1 sm:col-span-2">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specific Location</p>
                                                <p className="text-sm text-gray-700">{equipment.location}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Service History Card */}
                            {serviceHistory && serviceHistory.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-emerald-600" />
                                            Service History
                                            <span className="text-xs font-normal text-gray-500">({serviceHistory.length})</span>
                                        </h2>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        {serviceHistory.map((service: any, index: number) => (
                                            <Link
                                                key={index}
                                                href={`/customer/requests/${service.id}`}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-emerald-300 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                                                        <FileText className="h-4 w-4 text-emerald-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                                            {service.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{service.request_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-gray-500">{formatDate(service.created_at)}</span>
                                                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Services Card */}
                            {upcomingServices && upcomingServices.length > 0 && (
                                <div className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-blue-200 bg-blue-100/50">
                                        <h2 className="text-base font-semibold text-blue-900 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            Upcoming Services
                                            <span className="text-xs font-normal text-blue-600">({upcomingServices.length})</span>
                                        </h2>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        {upcomingServices.map((service: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                                        <Calendar className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {service.task_number}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{service.equipment_name}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full shrink-0">
                                                    {formatDate(service.scheduled_start)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Important Dates Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-emerald-600" />
                                        Important Dates
                                    </h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    {equipment.installation_date && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Installation Date</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(equipment.installation_date)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {equipment.warranty_expiry && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Warranty Expiry</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(equipment.warranty_expiry)}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDateTime(equipment.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Help Card */}
                            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-emerald-900 mb-1">Need Assistance?</h3>
                                        <p className="text-xs text-emerald-700 leading-relaxed">
                                            If you notice any issues with this equipment, create a service request and our team will assist you promptly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
