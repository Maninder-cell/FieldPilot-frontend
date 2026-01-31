'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/token-utils';
import { getApiUrl } from '@/lib/api-utils';
import { getCustomerEquipment } from '@/lib/customer-api';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    ArrowLeft,
    Send,
    Loader2,
    AlertCircle,
    Package,
    Wrench,
    AlertTriangle,
    FileText,
    CheckCircle2,
    ChevronRight,
    Info,
    Upload,
    X,
    Search,
    Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

const REQUEST_TYPES = [
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Regular maintenance service', color: 'emerald' },
    { value: 'service', label: 'Service', icon: Wrench, description: 'General service request', color: 'blue' },
    { value: 'inspection', label: 'Inspection', icon: FileText, description: 'Equipment inspection request', color: 'purple' },
    { value: 'issue', label: 'Issue Report', icon: AlertTriangle, description: 'Report a problem or issue', color: 'orange' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-200', description: 'Can wait, no urgency' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200', description: 'Normal priority' },
    { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200', description: 'Needs attention soon' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-200', description: 'Immediate action needed' },
];

export default function NewServiceRequest() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [equipment, setEquipment] = useState<any[]>([]);
    const [loadingEquipment, setLoadingEquipment] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        equipment_id: '',
        request_type: '',
        title: '',
        description: '',
        priority: 'medium',
        issue_type: '',
        severity: '',
    });

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [facilityFilter, setFacilityFilter] = useState('');

    const selectedEquipment = equipment.find(e => e.id === formData.equipment_id);

    // Get unique facilities for filter
    const facilities = Array.from(new Set(equipment.map(e => e.facility?.name).filter(Boolean)));
    
    // Get unique statuses for filter
    const statuses = Array.from(new Set(equipment.map(e => e.status).filter(Boolean)));

    // Filter equipment based on search and filters
    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = searchQuery === '' || 
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipment_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.facility?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.building?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === '' || item.status === statusFilter;
        const matchesFacility = facilityFilter === '' || item.facility?.name === facilityFilter;
        
        return matchesSearch && matchesStatus && matchesFacility;
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadEquipment();
        }
    }, [user, authLoading, router]);

    const loadEquipment = async () => {
        try {
            setLoadingEquipment(true);
            const response = await getCustomerEquipment(1, 100);
            setEquipment(response.results || []);
        } catch (error: any) {
            console.error('Failed to load equipment:', error);
            toast.error('Failed to load equipment');
        } finally {
            setLoadingEquipment(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.equipment_id) {
            toast.error('Please select equipment');
            setCurrentStep(1);
            return;
        }

        if (!formData.request_type) {
            toast.error('Please select request type');
            setCurrentStep(2);
            return;
        }

        setIsLoading(true);
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                toast.error('Not authenticated');
                router.push('/login');
                return;
            }

            const apiUrl = getApiUrl(true);

            const requestData: any = {
                equipment_id: formData.equipment_id,
                request_type: formData.request_type,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
            };

            if (formData.request_type === 'issue') {
                requestData.issue_type = formData.issue_type;
                requestData.severity = formData.severity;
            }

            const response = await fetch(`${apiUrl}/service-requests/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create service request');
            }

            toast.success('Service request created successfully!');
            router.push('/customer/requests');
        } catch (error: any) {
            console.error('Failed to create service request:', error);
            toast.error(error.message || 'Failed to create service request');
        } finally {
            setIsLoading(false);
        }
    };

    const canProceedToStep2 = formData.equipment_id !== '';
    const canProceedToStep3 = formData.request_type !== '';
    const canSubmit = formData.title && formData.description && canProceedToStep2 && canProceedToStep3;

    return (
        <CustomerLayout>
            <div className="bg-gray-50 min-h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Service Request</h1>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    Submit a request for your equipment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-3">
                        <div className="flex items-center justify-center gap-2 sm:gap-4">
                            {[
                                { num: 1, label: 'Equipment' },
                                { num: 2, label: 'Type' },
                                { num: 3, label: 'Details' },
                            ].map((step, idx) => (
                                <div key={step.num} className="flex items-center">
                                    <button
                                        onClick={() => setCurrentStep(step.num)}
                                        disabled={step.num === 2 && !canProceedToStep2 || step.num === 3 && !canProceedToStep3}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                            currentStep === step.num
                                                ? 'bg-emerald-600 text-white'
                                                : currentStep > step.num
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-gray-100 text-gray-500'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {currentStep > step.num ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">
                                                {step.num}
                                            </span>
                                        )}
                                        <span className="hidden sm:inline">{step.label}</span>
                                    </button>
                                    {idx < 2 && (
                                        <ChevronRight className="h-4 w-4 text-gray-300 mx-1 sm:mx-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-6">
                    {loadingEquipment ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-3" />
                                <p className="text-gray-600">Loading your equipment...</p>
                            </div>
                        </div>
                    ) : equipment.length === 0 ? (
                        <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Found</h3>
                            <p className="text-gray-600 mb-6">
                                You need equipment assigned to you before creating a service request.
                            </p>
                            <button
                                onClick={() => router.push('/customer/equipment')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                View Equipment
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                            {/* Step 1: Equipment Selection */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Equipment</h2>
                                        <p className="text-sm text-gray-600 mb-4">Choose the equipment that needs service</p>
                                        
                                        {/* Search and Filters */}
                                        <div className="space-y-3 mb-4">
                                            {/* Search Input */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search by name, number, or location..."
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchQuery('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        <X className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Filters Row */}
                                            <div className="flex flex-wrap gap-2">
                                                {/* Status Filter */}
                                                {statuses.length > 0 && (
                                                    <select
                                                        value={statusFilter}
                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                    >
                                                        <option value="">All Status</option>
                                                        {statuses.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status?.replace(/_/g, ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* Facility Filter */}
                                                {facilities.length > 0 && (
                                                    <select
                                                        value={facilityFilter}
                                                        onChange={(e) => setFacilityFilter(e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                    >
                                                        <option value="">All Facilities</option>
                                                        {facilities.map((facility) => (
                                                            <option key={facility} value={facility}>
                                                                {facility}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* Clear Filters */}
                                                {(searchQuery || statusFilter || facilityFilter) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('');
                                                            setFacilityFilter('');
                                                        }}
                                                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        Clear filters
                                                    </button>
                                                )}
                                            </div>

                                            {/* Results count */}
                                            <p className="text-xs text-gray-500">
                                                {filteredEquipment.length} of {equipment.length} equipment
                                                {(searchQuery || statusFilter || facilityFilter) && ' (filtered)'}
                                            </p>
                                        </div>
                                        
                                        {/* Equipment List */}
                                        <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
                                            {filteredEquipment.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-500 text-sm">No equipment found matching your criteria</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('');
                                                            setFacilityFilter('');
                                                        }}
                                                        className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </div>
                                            ) : (
                                                filteredEquipment.map((item) => (
                                                    <label
                                                        key={item.id}
                                                        className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                            formData.equipment_id === item.id
                                                                ? 'border-emerald-500 bg-emerald-50'
                                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="equipment"
                                                            value={item.id}
                                                            checked={formData.equipment_id === item.id}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, equipment_id: e.target.value }))}
                                                            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                                    <p className="text-sm text-gray-500">{item.equipment_number}</p>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                                                                    item.status === 'operational' ? 'bg-green-100 text-green-700' :
                                                                    item.status === 'needs_maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                                    item.status === 'out_of_service' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                    {item.status?.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>
                                                            {(item.facility?.name || item.building?.name || item.location_name) && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {[item.facility?.name, item.building?.name, item.location_name].filter(Boolean).join(' • ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            disabled={!canProceedToStep2}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Request Type */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    {/* Selected Equipment Summary */}
                                    {selectedEquipment && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Package className="h-5 w-5 text-emerald-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-emerald-900">{selectedEquipment.name}</p>
                                                    <p className="text-xs text-emerald-700">{selectedEquipment.equipment_number}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                className="text-xs text-emerald-700 hover:text-emerald-800 underline"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    )}

                                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Request Type</h2>
                                        <p className="text-sm text-gray-600 mb-4">What kind of service do you need?</p>
                                        
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {REQUEST_TYPES.map((type) => (
                                                <label
                                                    key={type.value}
                                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        formData.request_type === type.value
                                                            ? 'border-emerald-500 bg-emerald-50'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="request_type"
                                                        value={type.value}
                                                        checked={formData.request_type === type.value}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, request_type: e.target.value }))}
                                                        className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{type.label}</p>
                                                        <p className="text-xs text-gray-500">{type.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Issue-specific fields */}
                                    {formData.request_type === 'issue' && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                                            <h3 className="text-base font-semibold text-gray-900 mb-4">Issue Details</h3>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Issue Type <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.issue_type}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, issue_type: e.target.value }))}
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                        required={formData.request_type === 'issue'}
                                                    >
                                                        <option value="">Select issue type...</option>
                                                        <option value="breakdown">Equipment Breakdown</option>
                                                        <option value="malfunction">Malfunction</option>
                                                        <option value="safety">Safety Concern</option>
                                                        <option value="performance">Performance Issue</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Severity <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.severity}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                        required={formData.request_type === 'issue'}
                                                    >
                                                        <option value="">Select severity...</option>
                                                        <option value="minor">Minor</option>
                                                        <option value="moderate">Moderate</option>
                                                        <option value="major">Major</option>
                                                        <option value="critical">Critical</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(3)}
                                            disabled={!canProceedToStep3}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Details */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-sm font-medium text-emerald-900">{selectedEquipment?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-sm font-medium text-emerald-900 capitalize">{formData.request_type}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                className="text-xs text-emerald-700 hover:text-emerald-800 underline"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-5">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 mb-1">Request Details</h2>
                                            <p className="text-sm text-gray-600">Provide details about your service request</p>
                                        </div>

                                        {/* Priority */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Priority
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {PRIORITIES.map((priority) => (
                                                    <label
                                                        key={priority.value}
                                                        className={`flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm font-medium ${
                                                            formData.priority === priority.value
                                                                ? priority.color + ' border-2'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="priority"
                                                            value={priority.value}
                                                            checked={formData.priority === priority.value}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                                            className="sr-only"
                                                        />
                                                        {priority.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="Brief summary of your request"
                                                required
                                                maxLength={255}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/255 characters</p>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                                placeholder="Describe the issue or service needed in detail..."
                                                rows={5}
                                                required
                                            />
                                        </div>

                                        {/* Info Box */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                                            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium">What happens next?</p>
                                                <p className="text-blue-700 mt-1">
                                                    Your request will be reviewed by our team. You'll receive updates via email and can track progress in your dashboard.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.back()}
                                            className="flex-1 sm:flex-none px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !canSubmit}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    Submit Request
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
