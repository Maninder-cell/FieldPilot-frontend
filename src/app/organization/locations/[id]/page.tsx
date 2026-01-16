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
    Loader2,
    Building2,
    Warehouse,
    Wrench,
    Map,
} from 'lucide-react';
import { getLocationById, deleteLocation } from '@/lib/locations-api';
import { Location } from '@/types/locations';
import { toast } from 'react-hot-toast';
import LocationModal from '@/components/organization/LocationModal';
import DeleteLocationModal from '@/components/organization/DeleteLocationModal';

export default function LocationDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locationId = params.id as string;

    const [location, setLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && locationId) {
            loadLocation();
        }
    }, [user, locationId]);

    const loadLocation = async () => {
        try {
            setIsLoading(true);
            const response = await getLocationById(locationId);
            setLocation(response.data);
        } catch (error: any) {
            console.error('Failed to load location:', error);
            toast.error('Failed to load location details');
            router.push('/organization/locations');
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
        loadLocation();
    };

    const getEntityTypeIcon = (entityType: string) => {
        switch (entityType) {
            case 'facility':
                return Building2;
            case 'building':
                return Warehouse;
            case 'equipment':
                return Wrench;
            default:
                return MapPin;
        }
    };

    const getEntityTypeBadge = (entityType: string) => {
        const Icon = getEntityTypeIcon(entityType);
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 capitalize">
                <Icon className="h-4 w-4" />
                {entityType}
            </span>
        );
    };

    if (authLoading || isLoading) {
        return (
            <OrganizationLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                        <p className="text-gray-600">Loading location details...</p>
                    </div>
                </div>
            </OrganizationLayout>
        );
    }

    if (!user || !location) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        <button
                            onClick={() => router.push('/organization/locations')}
                            className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to locations"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{location.name}</h1>
                                {getEntityTypeBadge(location.entity_type)}
                            </div>
                            {location.full_location && (
                                <p className="mt-1 text-sm text-gray-600">{location.full_location}</p>
                            )}
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
                                    <label className="text-sm font-medium text-gray-500">Entity Type</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{location.entity_type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Entity ID</label>
                                    <p className="mt-1 text-sm text-gray-900 font-mono text-xs">{location.entity_id}</p>
                                </div>
                            </div>

                            {location.description && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{location.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Location Details */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Location Details</h2>
                            </div>
                            <div className="space-y-3">
                                {location.address && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Address</label>
                                        <p className="mt-1 text-sm text-gray-900">{location.address}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Floor</label>
                                        <p className="mt-1 text-sm text-gray-900">{location.floor || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Room</label>
                                        <p className="mt-1 text-sm text-gray-900">{location.room || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Zone</label>
                                        <p className="mt-1 text-sm text-gray-900">{location.zone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coordinates */}
                        {location.has_coordinates && location.latitude && location.longitude && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Map className="h-5 w-5 text-emerald-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Coordinates</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Latitude</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono">{location.latitude}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Longitude</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono">{location.longitude}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        {location.additional_info && Object.keys(location.additional_info).length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                                <div className="space-y-3">
                                    {Object.entries(location.additional_info).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="text-sm font-medium text-gray-500 capitalize">{key.replace('_', ' ')}</label>
                                            <p className="mt-1 text-sm text-gray-900">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
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
                                    <p className="mt-1 text-sm text-gray-900">{location.created_by_name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(location.created_at).toLocaleDateString('en-US', {
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
                                        {new Date(location.updated_at).toLocaleDateString('en-US', {
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
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && location && (
                <LocationModal
                    location={location}
                    onClose={handleModalClose}
                />
            )}

            {isDeleteModalOpen && location && (
                <DeleteLocationModal
                    location={location}
                    onClose={handleModalClose}
                />
            )}
        </OrganizationLayout>
    );
}
