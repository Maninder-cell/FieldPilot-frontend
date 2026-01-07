'use client';

import { useState, useEffect } from 'react';
import {
    X,
    FileText,
    AlertCircle,
    Wrench,
    AlertTriangle,
    Settings,
    Search,
    TrendingDown,
    Zap,
    Shield,
    HelpCircle,
    Signal,
    SignalMedium,
    SignalHigh,
    Flame
} from 'lucide-react';
import { createServiceRequest, updateServiceRequest } from '@/lib/service-requests-api';
import { getEquipment } from '@/lib/equipment-api';
import {
    ServiceRequest,
    CreateServiceRequestData,
    ServiceRequestType,
    ServiceRequestPriority,
    IssueType,
    Severity
} from '@/types/service-requests';
import { toast } from 'react-hot-toast';
import LazySelect from '@/components/common/LazySelect';
import CustomSelect, { SelectOption } from '@/components/common/CustomSelect';

interface ServiceRequestModalProps {
    request: ServiceRequest | null;
    onClose: () => void;
}

// Request Type Options with Lucide icons
const requestTypeOptions: SelectOption[] = [
    { value: 'service', label: 'Service Request', icon: 'Wrench', color: 'text-emerald-600' },
    { value: 'issue', label: 'Issue Report', icon: 'AlertTriangle', color: 'text-orange-600' },
    { value: 'maintenance', label: 'Maintenance Request', icon: 'Settings', color: 'text-blue-600' },
    { value: 'inspection', label: 'Inspection Request', icon: 'Search', color: 'text-purple-600' },
];

// Priority Options with Lucide icons
const priorityOptions: SelectOption[] = [
    { value: 'low', label: 'Low', icon: 'CircleDot', color: 'text-green-500' },
    { value: 'medium', label: 'Medium', icon: 'Circle', color: 'text-yellow-500' },
    { value: 'high', label: 'High', icon: 'AlertCircle', color: 'text-orange-500' },
    { value: 'urgent', label: 'Urgent', icon: 'Flame', color: 'text-red-500' },
];

// Issue Type Options with Lucide icons
const issueTypeOptions: SelectOption[] = [
    { value: 'breakdown', label: 'Breakdown', icon: 'Zap', color: 'text-red-600' },
    { value: 'malfunction', label: 'Malfunction', icon: 'Settings', color: 'text-orange-600' },
    { value: 'performance', label: 'Performance Issue', icon: 'TrendingDown', color: 'text-yellow-600' },
    { value: 'safety', label: 'Safety Concern', icon: 'Shield', color: 'text-red-600' },
    { value: 'other', label: 'Other', icon: 'HelpCircle', color: 'text-gray-600' },
];

// Severity Options with Lucide icons
const severityOptions: SelectOption[] = [
    { value: 'minor', label: 'Minor', icon: 'CircleDot', color: 'text-green-500' },
    { value: 'moderate', label: 'Moderate', icon: 'Circle', color: 'text-yellow-500' },
    { value: 'major', label: 'Major', icon: 'AlertCircle', color: 'text-orange-500' },
    { value: 'critical', label: 'Critical', icon: 'Flame', color: 'text-red-500' },
];

export default function ServiceRequestModal({ request, onClose }: ServiceRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateServiceRequestData>({
        equipment_id: '',
        request_type: 'service',
        title: '',
        description: '',
        priority: 'medium',
        issue_type: undefined,
        severity: undefined,
    });

    useEffect(() => {
        if (request) {
            setFormData({
                equipment_id: request.equipment.id,
                request_type: request.request_type,
                title: request.title,
                description: request.description,
                priority: request.priority,
                issue_type: request.issue_type || undefined,
                severity: request.severity || undefined,
            });
        }
    }, [request]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: If request type is 'issue', require issue_type and severity
        if (formData.request_type === 'issue') {
            if (!formData.issue_type) {
                toast.error('Issue type is required for issue reports');
                return;
            }
            if (!formData.severity) {
                toast.error('Severity is required for issue reports');
                return;
            }
        }

        try {
            setLoading(true);
            if (request) {
                await updateServiceRequest(request.id, {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    issue_type: formData.issue_type,
                    severity: formData.severity,
                });
                toast.success('Service request updated successfully');
            } else {
                await createServiceRequest(formData);
                toast.success('Service request created successfully');
            }
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save service request');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value || undefined,
        }));
    };

    const isIssueType = formData.request_type === 'issue';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {request ? 'Edit Service Request' : 'Create Service Request'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Equipment Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Request Details</h3>
                                </div>

                                <LazySelect
                                    label="Equipment"
                                    value={formData.equipment_id}
                                    onChange={(value) => setFormData(prev => ({ ...prev, equipment_id: value }))}
                                    fetchItems={getEquipment}
                                    fetchItemById={async (id) => {
                                        const { getEquipmentById } = await import('@/lib/equipment-api');
                                        const response = await getEquipmentById(id);
                                        return { data: { id: response.data.id, name: response.data.name, equipment_number: response.data.equipment_number } };
                                    }}
                                    placeholder="Select equipment"
                                    required
                                    disabled={!!request}
                                    pageSize={5}
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Request Type <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
                                        options={requestTypeOptions}
                                        value={formData.request_type || null}
                                        onChange={(value) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                request_type: value as ServiceRequestType,
                                                // Clear issue fields if not issue type
                                                issue_type: value === 'issue' ? prev.issue_type : undefined,
                                                severity: value === 'issue' ? prev.severity : undefined,
                                            }));
                                        }}
                                        placeholder="Select request type"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Brief summary of the request"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        placeholder="Provide detailed information about the request..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Priority
                                    </label>
                                    <CustomSelect
                                        options={priorityOptions}
                                        value={formData.priority || null}
                                        onChange={(value) => setFormData(prev => ({ ...prev, priority: value as ServiceRequestPriority }))}
                                        placeholder="Select priority"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Issue-Specific Fields */}
                            {isIssueType && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 pb-3 border-b-2 border-orange-100">
                                        <div className="bg-orange-100 p-2 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Issue Details</h3>
                                    </div>

                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-sm text-orange-800">
                                            <span className="font-semibold">Required:</span> Please provide issue type and severity for issue reports
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Issue Type <span className="text-red-500">*</span>
                                        </label>
                                        <CustomSelect
                                            options={issueTypeOptions}
                                            value={formData.issue_type || null}
                                            onChange={(value) => setFormData(prev => ({ ...prev, issue_type: value as IssueType }))}
                                            placeholder="Select issue type"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Severity <span className="text-red-500">*</span>
                                        </label>
                                        <CustomSelect
                                            options={severityOptions}
                                            value={formData.severity || null}
                                            onChange={(value) => setFormData(prev => ({ ...prev, severity: value as Severity }))}
                                            placeholder="Select severity level"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-between items-center shadow-lg">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                {request ? 'Update Request' : 'Create Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
