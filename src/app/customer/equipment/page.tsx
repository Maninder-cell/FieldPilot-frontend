'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    Search,
    Package,
    AlertCircle,
    Clock,
    CheckCircle2,
    Wrench,
    Eye,
} from 'lucide-react';
import { getCustomerEquipment } from '@/lib/customer-api';
import toast from 'react-hot-toast';

export default function CustomerEquipment() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [equipment, setEquipment] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0,
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadEquipment();
        }
    }, [user, pagination.page]);

    const loadEquipment = async () => {
        try {
            setIsLoading(true);
            const response = await getCustomerEquipment(pagination.page, pagination.pageSize);
            setEquipment(response.results || []);
            setPagination(prev => ({ ...prev, total: response.count || 0 }));
        } catch (error: any) {
            console.error('Failed to load equipment:', error);
            toast.error('Failed to load equipment');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'operational':
                return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
            case 'maintenance':
                return <Wrench className="h-5 w-5 text-orange-600" />;
            case 'broken':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'operational':
                return 'bg-emerald-100 text-emerald-800';
            case 'maintenance':
                return 'bg-orange-100 text-orange-800';
            case 'broken':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Equipment</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                View and manage your equipment inventory
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Search */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search equipment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Equipment Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Clock className="h-8 w-8 text-emerald-600 animate-spin" />
                        </div>
                    ) : filteredEquipment.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
                            <p className="text-gray-600">
                                {searchTerm ? 'Try adjusting your search' : 'No equipment has been assigned to you yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEquipment.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/customer/equipment/${item.id}`)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(item.status)}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-600">{item.equipment_type}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/customer/equipment/${item.id}`);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Eye className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {item.manufacturer && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Manufacturer:</span>
                                                <span className="font-medium text-gray-900">{item.manufacturer}</span>
                                            </div>
                                        )}
                                        {item.model && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Model:</span>
                                                <span className="font-medium text-gray-900">{item.model}</span>
                                            </div>
                                        )}
                                        {item.serial_number && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Serial:</span>
                                                <span className="font-medium text-gray-900 font-mono text-xs">{item.serial_number}</span>
                                            </div>
                                        )}
                                        {item.location && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Location:</span>
                                                <span className="font-medium text-gray-900">{item.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {formatStatus(item.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.total > pagination.pageSize && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                                {pagination.total} items
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page * pagination.pageSize >= pagination.total}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
