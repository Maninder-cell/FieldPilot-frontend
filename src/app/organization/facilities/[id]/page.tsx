'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    ArrowLeft,
    Home,
    MapPin,
    Phone,
    Mail,
    Calendar,
    User,
    Building,
    Wrench,
    Edit,
    Trash2,
    CheckCircle2,
    Construction,
    AlertCircle,
    XCircle,
    Loader2,
} from 'lucide-react';
import { getFacility, deleteFacility } from '@/lib/facilities-api';
import { Facility } from '@/types/facilities';
import { toast } from 'react-hot-toast';
import FacilityModal from '@/components/organization/FacilityModal';
import DeleteFacilityModal from '@/components/organization/DeleteFacilityModal';

export default function FacilityDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const facilityId = params.id as string;

    const [facility, setFacility] = useState<Facility | null>(null);
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
        if (user && facilityId) {
            loadFacility();
        }
    }, [user, facilityId]);

    const loadFacility = async () => {
        try {
            setIsLoading(true);
            const response = await getFacility(facilityId);
            setFacility(response.data);
        } catch (error: any) {
            console.error('Failed to load facility:', error);
            toast.error('Failed to load facility details');
            router.push('/organization/facilities');
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
        if (!facility) return;

        try {
            setIsDeleting(true);
            await deleteFacility(facility.id);
            toast.success('Facility deleted successfully');
            router.push('/organization/facilities');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete facility');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            setIsSubmitting(true);
            // The FacilityModal handles the update
            toast.success('Facility updated successfully');
            setIsEditModalOpen(false);
            loadFacility(); // Reload facility data
        } catch (error: any) {
            toast.error(error.message || 'Failed to update facility');
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
                        <p className="text-gray-600">Loading facility details...</p>
                    </div>
                </div>
            </OrganizationLayout>
        );
    }

    if (!user || !facility) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        <button
                            onClick={() => router.push('/organization/facilities')}
                            className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to facilities"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{facility.name}</h1>
                                {getStatusBadge(facility.operational_status)}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{facility.code}</p>
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
                                    <label className="text-sm font-medium text-gray-500">Facility Type</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{facility.facility_type.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Square Footage</label>
                                    <p className="mt-1 text-sm text-gray-900">{facility.square_footage ? `${facility.square_footage} sq ft` : '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Year Built</label>
                                    <p className="mt-1 text-sm text-gray-900">{facility.year_built || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Operational</label>
                                    <p className="mt-1 text-sm text-gray-900">{facility.is_operational ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            {facility.description && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{facility.description}</p>
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
                                {facility.address && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="mt-1 text-sm text-gray-900">{facility.address}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">City</label>
                                        <p className="mt-1 text-sm text-gray-900">{facility.city || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">State</label>
                                        <p className="mt-1 text-sm text-gray-900">{facility.state || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ZIP Code</label>
                                        <p className="mt-1 text-sm text-gray-900">{facility.zip_code || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Country</label>
                                        <p className="mt-1 text-sm text-gray-900">{facility.country || '-'}</p>
                                    </div>
                                </div>
                                {(facility.latitude && facility.longitude) && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <label className="text-sm font-medium text-gray-500">Coordinates</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {facility.latitude}, {facility.longitude}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                {facility.contact_name && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <label className="text-sm font-medium text-gray-500">Contact Name</label>
                                        </div>
                                        <p className="text-sm text-gray-900 ml-6">{facility.contact_name}</p>
                                    </div>
                                )}
                                {facility.contact_email && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                        </div>
                                        <a
                                            href={`mailto:${facility.contact_email}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 ml-6 hover:underline"
                                        >
                                            {facility.contact_email}
                                        </a>
                                    </div>
                                )}
                                {facility.contact_phone && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                        </div>
                                        <a
                                            href={`tel:${facility.contact_phone}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 ml-6 hover:underline"
                                        >
                                            {facility.contact_phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {facility.notes && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{facility.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Stats & Metadata */}
                    <div className="space-y-6">
                        {/* Assets Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assets</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Building className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">Buildings</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600">{facility.buildings_count}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Wrench className="h-5 w-5 text-emerald-600" />
                                        <span className="text-sm font-medium text-gray-900">Equipment</span>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-600">{facility.equipment_count}</span>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created By</label>
                                    <p className="mt-1 text-sm text-gray-900">{facility.created_by_name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(facility.created_at).toLocaleDateString('en-US', {
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
                                        {new Date(facility.updated_at).toLocaleDateString('en-US', {
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
                        {facility.custom_fields && Object.keys(facility.custom_fields).length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h2>
                                <div className="space-y-3">
                                    {Object.entries(facility.custom_fields).map(([key, value]) => (
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
                <FacilityModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdate}
                    facility={facility}
                    isLoading={isSubmitting}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteFacilityModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    facility={facility}
                    isLoading={isDeleting}
                />
            )}
        </OrganizationLayout>
    );
}
