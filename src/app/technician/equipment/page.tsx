'use client';

import { useState, useEffect } from 'react';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import {
    Wrench,
    Search,
    Filter,
    Loader2,
    MapPin,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Settings
} from 'lucide-react';
import { getEquipmentList, Equipment } from '@/lib/technician-tasks-api';
import toast from 'react-hot-toast';

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        loadEquipment();
    }, [statusFilter]);

    const loadEquipment = async () => {
        try {
            setIsLoading(true);
            const response = await getEquipmentList({
                search: searchQuery,
                status: statusFilter || undefined,
            });

            // Handle both paginated and non-paginated responses
            const responseData = response as any;
            if (response.data && Array.isArray(response.data)) {
                setEquipment(response.data);
            } else if (responseData.results && Array.isArray(responseData.results)) {
                // Paginated response
                setEquipment(responseData.results);
            } else {
                setEquipment([]);
            }
        } catch (error: any) {
            console.error('Failed to load equipment:', error);
            toast.error(error.message || 'Failed to load equipment');
            setEquipment([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        loadEquipment();
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            operational: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Operational' },
            maintenance: { color: 'bg-yellow-100 text-yellow-700', icon: Settings, label: 'Maintenance' },
            out_of_service: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Out of Service' },
            decommissioned: { color: 'bg-gray-100 text-gray-700', icon: AlertCircle, label: 'Decommissioned' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.operational;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="h-4 w-4" />
                {config.label}
            </span>
        );
    };

    return (
        <TechnicianLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Equipment</h1>
                    <p className="mt-1 text-gray-600">View equipment information and status</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search equipment by name or number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full md:w-48">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                                >
                                    <option value="">All Status</option>
                                    <option value="operational">Operational</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="out_of_service">Out of Service</option>
                                    <option value="decommissioned">Decommissioned</option>
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Equipment List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : equipment.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Found</h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter
                                ? 'Try adjusting your search or filters'
                                : 'No equipment available at this time'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {equipment.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3">
                                    <div className="flex items-center gap-2 text-white">
                                        <Wrench className="h-5 w-5" />
                                        <span className="font-semibold">{item.equipment_number}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{item.equipment_type}</p>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        {getStatusBadge(item.operational_status)}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        {item.manufacturer && (
                                            <div className="flex items-start gap-2">
                                                <Settings className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500">Manufacturer</p>
                                                    <p className="font-medium text-gray-900">{item.manufacturer}</p>
                                                </div>
                                            </div>
                                        )}

                                        {item.model && (
                                            <div className="flex items-start gap-2">
                                                <Settings className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500">Model</p>
                                                    <p className="font-medium text-gray-900">{item.model}</p>
                                                </div>
                                            </div>
                                        )}

                                        {item.building && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500">Location</p>
                                                    <p className="font-medium text-gray-900">{item.building.name}</p>
                                                    {item.building.facility && (
                                                        <p className="text-xs text-gray-500">{item.building.facility.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {item.installation_date && (
                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500">Installed</p>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(item.installation_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TechnicianLayout>
    );
}
