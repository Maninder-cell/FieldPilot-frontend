'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    User,
    Wrench,
    Edit,
    Trash2,
    CheckCircle2,
    Construction,
    AlertCircle,
    XCircle,
    Loader2,
    Home as HomeIcon,
} from 'lucide-react';
import { getBuilding, deleteBuilding } from '@/lib/buildings-api';
import { Building } from '@/types/buildings';
import { toast } from 'react-hot-toast';
import BuildingModal from '@/components/organization/BuildingModal';
import DeleteBuildingModal from '@/components/organization/DeleteBuildingModal';

export default function BuildingDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const buildingId = params.id as string;

    const [building, setBuilding] = useState<Building | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && buildingId) {
            loadBuilding();
        }
    }, [user, buildingId]);

    const loadBuilding = async () => {
        try {
            setIsLoading(true);
            const response = await getBuilding(buildingId);
            setBuilding(response.data);
        } catch (error: any) {
            console.error('Failed to load building:', error);
            toast.error('Failed to load building details');
            router.push('/organization/buildings');
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

    const handleDeleteConfirm = async () => {
        if (!building) return;

        try {
            setIsDeleting(true);
            await deleteBuilding(building.id);
            toast.success('Building deleted successfully');
            router.push('/organization/buildings');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete building');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            setIsSubmitting(true);
            toast.success('Building updated successfully');
            setIsEditModalOpen(false);
            loadBuilding();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update building');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            operational: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
            maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
            under_construction: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Construction },
            closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.closed;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                <Icon className="h-4 w-4" />
                {status.replace('_', ' ')}
            </span>
        );
    };

    if (authLoading || isLoading) {
        return (
            <OrganizationLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                        <p className="text-gray-600">Loading building details...</p>
                    </div>
                </div>
            </OrganizationLayout>
        );
    }

    if (!user || !building) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        <button
                            onClick={() => router.push('/organization/buildings')}
                            className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to buildings"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{building.name}</h1>
                                {getStatusBadge(building.operational_status)}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{building.code}</p>
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
                                    <label className="text-sm font-medium text-gray-500">Building Type</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{building.building_type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Facility</label>
                                    <p className="mt-1 text-sm text-gray-900">{building.facility_name || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Floor Count</label>
                                    <p className="mt-1 text-sm text-gray-900">{building.floor_count || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Square Footage</label>
                                    <p className="mt-1 text-sm text-gray-900">{building.square_footage ? `${building.square_footage} sq ft` : '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Construction Year</label>
                                    <p className="mt-1 text-sm text-gray-900">{building.construction_year || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Operational</label>
                                    <p className="mt-1 text-sm text-gray-900">{building.is_operational ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            {building.description && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{building.description}</p>
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
                                {building.address && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="mt-1 text-sm text-gray-900">{building.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                {building.contact_name && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <label className="text-sm font-medium text-gray-500">Contact Name</label>
                                        </div>
                                        <p className="text-sm text-gray-900 ml-6">{building.contact_name}</p>
                                    </div>
                                )}
                                {building.contact_email && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                        </div>
                                        <a
                                            href={`mailto:${building.contact_email}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 ml-6 hover:underline"
                                        >
                                            {building.contact_email}
                                        </a>
                                    </div>
                                )}
                                {building.contact_phone && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                        </div>
                                        <a
                                            href={`tel:${building.contact_phone}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 ml-6 hover:underline"
                                        >
                                            {building.contact_phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {building.notes && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{building.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Stats & Metadata */}
                    <div className="space-y-6">
                        {/* Equipment Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment</h2>
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Wrench className="h-5 w-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-gray-900">Equipment Count</span>
                                </div>
                                <span className="text-lg font-bold text-emerald-600">{building.equipment_count}</span>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created By</label>
                                    <p className="mt-1 text-sm text-gray-900">{building.created_by_name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(building.created_at).toLocaleDateString('en-US', {
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
                                        {new Date(building.updated_at).toLocaleDateString('en-US', {
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
                        {building.custom_fields && Object.keys(building.custom_fields).length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h2>
                                <div className="space-y-3">
                                    {Object.entries(building.custom_fields).map(([key, value]) => (
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
            {isEditModalOpen && (
                <BuildingModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdate}
                    building={building}
                    isLoading={isSubmitting}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteBuildingModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    building={building}
                    isLoading={isDeleting}
                />
            )}
        </OrganizationLayout>
    );
}
