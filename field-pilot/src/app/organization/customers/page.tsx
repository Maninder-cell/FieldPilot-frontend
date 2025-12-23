'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    Users,
    Search,
    Edit,
    Trash2,
    UserPlus,
    Filter,
    X,
    Building2,
    Mail,
    Phone,
    MapPin,
    Send,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Building,
    AlertTriangle
} from 'lucide-react';
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    inviteCustomer,
    getCustomerAssets,
    getStatusColor,
    Customer,
    CreateCustomerRequest,
    UpdateCustomerRequest
} from '@/lib/customers-api';

export default function CustomersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Data states
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


    // Form states
    const [formData, setFormData] = useState<CreateCustomerRequest>({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        contact_person: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA',
        status: 'pending',
        notes: ''
    });
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Customer assets for view modal
    const [customerAssets, setCustomerAssets] = useState<{
        facilities: any[];
        buildings: any[];
        equipment: any[];
    } | null>(null);
    const [loadingAssets, setLoadingAssets] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const loadCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCustomers({
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                page: currentPage,
                page_size: pageSize
            });

            // Handle nested response structure: { count, next, previous, results: { success, data, message } }
            if (response.results && response.results.data) {
                const customersData = response.results.data;
                setCustomers(Array.isArray(customersData) ? customersData : []);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / pageSize));
            } else if (response.data) {
                // Fallback: data at root level
                setCustomers(Array.isArray(response.data) ? response.data : []);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / pageSize));
            } else {
                console.error('Unexpected response structure:', response);
                setCustomers([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to load customers:', err);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, currentPage, pageSize]);

    useEffect(() => {
        if (user) {
            loadCustomers();
        }
    }, [user, loadCustomers]);

    // Debounced search
    useEffect(() => {
        if (!user) return;

        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            loadCustomers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter]);



    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            company_name: '',
            contact_person: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'USA',
            status: 'pending',
            notes: ''
        });
        setError(null);
    };

    const handleCreateCustomer = async () => {
        try {
            setIsSubmitting(true);
            setError(null);
            await createCustomer(formData);
            setShowCreateModal(false);
            resetForm();
            loadCustomers();
        } catch (err: any) {
            setError(err.message || 'Failed to create customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await updateCustomer(selectedCustomer.id, formData as UpdateCustomerRequest);
            setShowEditModal(false);
            setSelectedCustomer(null);
            resetForm();
            loadCustomers();
        } catch (err: any) {
            setError(err.message || 'Failed to update customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            setIsSubmitting(true);
            await deleteCustomer(selectedCustomer.id);
            setShowDeleteModal(false);
            setSelectedCustomer(null);
            loadCustomers();
        } catch (err: any) {
            setError(err.message || 'Failed to delete customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await inviteCustomer({
                customer_id: selectedCustomer.id,
                email: inviteEmail || selectedCustomer.email,
                message: inviteMessage
            });
            setShowInviteModal(false);
            setSelectedCustomer(null);
            setInviteEmail('');
            setInviteMessage('');
            loadCustomers();
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            company_name: customer.company_name || '',
            contact_person: customer.contact_person || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            zip_code: customer.zip_code || '',
            country: customer.country || 'USA',
            status: customer.status,
            notes: customer.notes || ''
        });
        setShowEditModal(true);
    };

    const openViewModal = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowViewModal(true);

        try {
            setLoadingAssets(true);
            const response = await getCustomerAssets(customer.id);
            setCustomerAssets(response.data);
        } catch (err) {
            console.error('Failed to load customer assets:', err);
            setCustomerAssets(null);
        } finally {
            setLoadingAssets(false);
        }
    };

    const openInviteModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setInviteEmail(customer.email);
        setInviteMessage('');
        setShowInviteModal(true);
    };

    const openDeleteModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowDeleteModal(true);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || statusFilter;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Customers</h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">
                                Manage customers and their access to facilities
                            </p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setShowCreateModal(true); }}
                            className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Add Customer
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm font-medium shadow-sm transition-all whitespace-nowrap ${showFilters || hasActiveFilters
                                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden xs:inline">Filters</span>
                                {hasActiveFilters && (
                                    <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                                        {[statusFilter].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => { resetForm(); setShowCreateModal(true); }}
                                className="flex-1 sm:flex-none lg:hidden inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                            >
                                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2.5">
                                <label className="text-xs font-medium text-gray-700">Status</label>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full xs:w-auto"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {[
                                    { value: '', label: 'All Status', icon: null },
                                    { value: 'active', label: 'Active', icon: CheckCircle2 },
                                    { value: 'inactive', label: 'Inactive', icon: XCircle },
                                    { value: 'pending', label: 'Pending', icon: Clock }
                                ].map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => { setStatusFilter(value); setCurrentPage(1); }}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${statusFilter === value
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        {Icon && <Icon className="h-4 w-4" />}
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Customers Table/Cards */}
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="p-12">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Users className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-gray-900">No customers</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {hasActiveFilters
                                        ? 'Try adjusting your filters'
                                        : 'Get started by adding a new customer'}
                                </p>
                                {!hasActiveFilters && (
                                    <div className="mt-6">
                                        <button
                                            onClick={() => { resetForm(); setShowCreateModal(true); }}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <UserPlus className="h-5 w-5" />
                                            Add Customer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {customers.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                            <div className="text-sm text-gray-500">{customer.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <div className="text-sm text-gray-900">{customer.company_name || '-'}</div>
                                                    {customer.contact_person && (
                                                        <div className="text-sm text-gray-500">{customer.contact_person}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    {customer.phone && (
                                                        <div className="text-sm text-gray-900 flex items-center gap-1">
                                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    {(customer.city || customer.state) && (
                                                        <div className="text-sm text-gray-900 flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                            {[customer.city, customer.state].filter(Boolean).join(', ')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(customer.status)}`}>
                                                        {customer.status}
                                                    </span>
                                                    {customer.has_user_account && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            Has Account
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openViewModal(customer);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(customer);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Customer"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        {!customer.has_user_account && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openInviteModal(customer);
                                                                }}
                                                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="Send Invitation"
                                                            >
                                                                <Send className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteModal(customer);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Customer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <div key={customer.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between mb-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900">{customer.name}</h3>
                                                    <p className="text-xs text-gray-500">{customer.email}</p>
                                                    {customer.company_name && (
                                                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {customer.company_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full h-fit ${getStatusColor(customer.status)}`}>
                                                {customer.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 pt-3 border-t">
                                            <button
                                                onClick={() => openViewModal(customer)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(customer)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {!loading && customers.length > 0 && totalPages > 1 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700 order-2 sm:order-1">
                                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                                <span className="font-medium">{totalCount}</span> results
                            </div>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-700 px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Customer Modal */}
            {(showCreateModal || showEditModal) && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                {showEditModal ? 'Edit Customer' : 'New Customer'}
                            </h3>
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Customer name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Company name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Primary contact"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        value={formData.zip_code}
                                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Internal notes about this customer..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                            <button
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showEditModal ? handleEditCustomer : handleCreateCustomer}
                                disabled={isSubmitting || !formData.name || !formData.email}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {showEditModal ? 'Update Customer' : 'Create Customer'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCustomer && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Delete Customer
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600">
                                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedCustomer.name}</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCustomer}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && selectedCustomer && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowInviteModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Send className="w-5 h-5" />
                                Send Invitation
                            </h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            <p className="text-gray-600">
                                Send an invitation to <span className="font-semibold text-gray-900">{selectedCustomer.name}</span> to create their account.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                                <textarea
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Add a personal message to the invitation..."
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInviteCustomer}
                                disabled={isSubmitting || !inviteEmail}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Customer Modal */}
            {showViewModal && selectedCustomer && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => { setShowViewModal(false); setCustomerAssets(null); }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Customer Details
                            </h3>
                            <button
                                onClick={() => { setShowViewModal(false); setCustomerAssets(null); }}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Customer Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h4>
                                    {selectedCustomer.company_name && (
                                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                                            <Building2 className="w-4 h-4" />
                                            {selectedCustomer.company_name}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedCustomer.status)}`}>
                                            {selectedCustomer.status}
                                        </span>
                                        {selectedCustomer.has_user_account && (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                Has Account
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedCustomer.email}</p>
                                    </div>
                                </div>
                                {selectedCustomer.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedCustomer.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {(selectedCustomer.city || selectedCustomer.state) && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.state, selectedCustomer.zip_code]
                                                    .filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Assets */}
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-emerald-600" />
                                    Associated Assets
                                </h5>
                                {loadingAssets ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                    </div>
                                ) : customerAssets ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-blue-600">{customerAssets.facilities?.length || 0}</p>
                                            <p className="text-xs text-blue-700">Facilities</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-purple-600">{customerAssets.buildings?.length || 0}</p>
                                            <p className="text-xs text-purple-700">Buildings</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-amber-600">{customerAssets.equipment?.length || 0}</p>
                                            <p className="text-xs text-amber-700">Equipment</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No assets found</p>
                                )}
                            </div>

                            {/* Notes */}
                            {selectedCustomer.notes && (
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Notes</h5>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedCustomer.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                            <button
                                onClick={() => { setShowViewModal(false); setCustomerAssets(null); }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { setShowViewModal(false); openEditModal(selectedCustomer); }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </OrganizationLayout>
    );
}
