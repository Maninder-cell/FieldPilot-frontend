'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    ArrowLeft,
    MapPin,
    Edit,
    Trash2,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Loader2,
    Star,
    ThumbsUp,
    Minus,
    ThumbsDown,
} from 'lucide-react';
import { getEquipmentById, deleteEquipment } from '@/lib/equipment-api';
import { Equipment } from '@/types/equipment';
import { toast } from 'react-hot-toast';
import EquipmentModal from '@/components/organization/EquipmentModal';
import DeleteEquipmentModal from '@/components/organization/DeleteEquipmentModal';

export default function EquipmentDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const equipmentId = params.id as string;

    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && equipmentId) {
            loadEquipment();
        }
    }, [user, equipmentId]);

    const loadEquipment = async () => {
        try {
            setIsLoading(true);
            const response = await getEquipmentById(equipmentId);
            setEquipment(response.data);
        } catch (error: any) {
            console.error('Failed to load equipment:', error);
            toast.error('Failed to load equipment details');
            router.push('/organization/equipment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        loadEquipment();
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            operational: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
            maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
            broken: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
            retired: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.retired;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                <Icon className="h-4 w-4" />
                {status}
            </span>
        );
    };

    const getConditionBadge = (condition: string) => {
        const conditionConfig = {
            excellent: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: Star },
            good: { bg: 'bg-green-100', text: 'text-green-800', icon: ThumbsUp },
            fair: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Minus },
            poor: { bg: 'bg-red-100', text: 'text-red-800', icon: ThumbsDown },
        };

        const config = conditionConfig[condition as keyof typeof conditionConfig] || conditionConfig.fair;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                <Icon className="h-4 w-4" />
                {condition}
            </span>
        );
    };

    if (authLoading || isLoading) {
        return (
            <OrganizationLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                        <p className="text-gray-600">Loading equipment details...</p>
                    </div>
                </div>
            </OrganizationLayout>
        );
    }

    if (!user || !equipment) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        <button
                            onClick={() => router.push('/organization/equipment')}
                            className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to equipment"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{equipment.name}</h1>
                                {getStatusBadge(equipment.operational_status)}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{equipment.equipment_number}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Equipment Type</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{equipment.equipment_type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Condition</label>
                                    <div className="mt-1">{getConditionBadge(equipment.condition)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipment.manufacturer || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Model</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipment.model || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Serial Number</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipment.serial_number || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Installation Date</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {equipment.installation_date
                                            ? new Date(equipment.installation_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Warranty Expiration</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {equipment.warranty_expiration
                                            ? new Date(equipment.warranty_expiration).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            {equipment.description && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipment.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Location Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Facility</label>
                                        <p className="mt-1 text-sm text-gray-900">{equipment.facility_name || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Building</label>
                                        <p className="mt-1 text-sm text-gray-900">{typeof equipment.building === 'object' && equipment.building?.name ? equipment.building.name : '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {equipment.notes && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{equipment.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Metadata */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created By</label>
                                    <p className="mt-1 text-sm text-gray-900">{equipment.created_by_name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(equipment.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(equipment.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Custom Fields */}
                        {equipment.custom_fields && Object.keys(equipment.custom_fields).length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h2>
                                <div className="space-y-3">
                                    {Object.entries(equipment.custom_fields).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="text-sm font-medium text-gray-500 capitalize">{key.replace('_', ' ')}</label>
                                            <p className="mt-1 text-sm text-gray-900">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && equipment && (
                <EquipmentModal
                    equipment={equipment}
                    onClose={handleModalClose}
                />
            )}

            {isDeleteModalOpen && equipment && (
                <DeleteEquipmentModal
                    equipment={equipment}
                    onClose={handleModalClose}
                />
            )}
        </OrganizationLayout>
    );
}
