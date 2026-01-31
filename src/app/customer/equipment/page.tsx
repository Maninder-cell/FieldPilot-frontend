'use client';

import { useEffect, useState, useRef } from 'react';
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
    RefreshCw,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Check,
    ListFilter,
    MapPin,
    Building2,
    AlertTriangle,
} from 'lucide-react';
import { getCustomerEquipment } from '@/lib/customer-api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const STATUS_OPTIONS = [
    { value: '', label: 'All Status', icon: ListFilter, color: 'text-gray-500' },
    { value: 'operational', label: 'Operational', icon: CheckCircle2, color: 'text-emerald-500' },
    { value: 'needs_maintenance', label: 'Needs Maintenance', icon: Wrench, color: 'text-orange-500' },
    { value: 'out_of_service', label: 'Out of Service', icon: AlertTriangle, color: 'text-red-500' },
];

export default function CustomerEquipment() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [equipment, setEquipment] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 12,
        total: 0,
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadEquipment();
        }
    }, [user, pagination.page, statusFilter]);

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

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'operational':
                return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Operational' };
            case 'needs_maintenance':
                return { icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Needs Maintenance' };
            case 'out_of_service':
                return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Service' };
            case 'maintenance':
                return { icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Maintenance' };
            case 'broken':
                return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Broken' };
            default:
                return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: status || 'Unknown' };
        }
    };

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = searchTerm === '' ||
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.equipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.facility?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === '' || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

    return (
        <CustomerLayout>
            <div className="bg-gray-50 min-h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Equipment</h1>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    View your assigned equipment
                                </p>
                            </div>
                            <button
                                onClick={loadEquipment}
                                disabled={isLoading}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-4 space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, type, serial number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="relative" ref={statusDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                className={`w-full sm:w-48 flex items-center justify-between gap-2 px-4 py-2.5 bg-white border rounded-lg text-sm transition-colors ${
                                    isStatusDropdownOpen 
                                        ? 'border-emerald-500 ring-2 ring-emerald-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const selected = STATUS_OPTIONS.find(o => o.value === statusFilter) || STATUS_OPTIONS[0];
                                        const Icon = selected.icon;
                                        return (
                                            <>
                                                <Icon className={`h-4 w-4 ${selected.color}`} />
                                                <span className="text-gray-700">{selected.label}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isStatusDropdownOpen && (
                                <div className="absolute right-0 sm:left-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                                    {STATUS_OPTIONS.map((option) => {
                                        const Icon = option.icon;
                                        const isSelected = statusFilter === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter(option.value);
                                                    setPagination(prev => ({ ...prev, page: 1 }));
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                                                    isSelected 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`h-4 w-4 ${option.color}`} />
                                                    <span>{option.label}</span>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-600">
                        {pagination.total} equipment{pagination.total !== 1 ? '' : ''}
                        {statusFilter && ` • ${STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}`}
                    </div>

                    {/* Equipment Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                        </div>
                    ) : filteredEquipment.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">No equipment found</h3>
                            <p className="text-sm text-gray-600">
                                {searchTerm ? 'Try adjusting your search' : 'No equipment has been assigned to you yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEquipment.map((item) => {
                                const statusConfig = getStatusConfig(item.status);
                                const StatusIcon = statusConfig.icon;
                                
                                return (
                                    <Link
                                        key={item.id}
                                        href={`/customer/equipment/${item.id}`}
                                        className="group bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className={`p-2 rounded-lg shrink-0 ${statusConfig.bg}`}>
                                                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {item.equipment_number}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-emerald-50 transition-colors shrink-0">
                                                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4 space-y-3">
                                            {/* Type */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <Package className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="text-gray-600 truncate">{item.equipment_type?.replace(/_/g, ' ') || 'N/A'}</span>
                                            </div>

                                            {/* Location */}
                                            {(item.facility?.name || item.building?.name) && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                                                    <span className="text-gray-600 truncate">
                                                        {[item.facility?.name, item.building?.name].filter(Boolean).join(' • ')}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Manufacturer & Model */}
                                            {(item.manufacturer || item.model) && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Wrench className="h-4 w-4 text-gray-400 shrink-0" />
                                                    <span className="text-gray-600 truncate">
                                                        {[item.manufacturer, item.model].filter(Boolean).join(' - ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs sm:text-sm text-gray-600">
                                Page {pagination.page} of {totalPages}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= totalPages}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
