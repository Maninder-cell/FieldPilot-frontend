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
    Save,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewServiceRequest() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [equipment, setEquipment] = useState<any[]>([]);
    const [loadingEquipment, setLoadingEquipment] = useState(true);

    const [formData, setFormData] = useState({
        equipment_id: '',
        request_type: 'maintenance',
        title: '',
        description: '',
        priority: 'medium',
        issue_type: '',
        severity: '',
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

            // Prepare request data
            const requestData: any = {
                equipment_id: formData.equipment_id,
                request_type: formData.request_type,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
            };

            // Add issue-specific fields if request type is 'issue'
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

            const data = await response.json();
            toast.success('Service request created successfully');
            router.push('/customer/requests');
        } catch (error: any) {
            console.error('Failed to create service request:', error);
            toast.error(error.message || 'Failed to create service request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New Service Request</h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    Create a new service request for your equipment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {loadingEquipment ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                        </div>
                    ) : equipment.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Found</h3>
                            <p className="text-gray-600">
                                You need equipment assigned to you before creating a service request.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                            {/* Equipment Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Equipment <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.equipment_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, equipment_id: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                >
                                    <option value="">Select equipment...</option>
                                    {equipment.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} - {item.equipment_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Request Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Request Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.request_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, request_type: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                >
                                    <option value="maintenance">Maintenance</option>
                                    <option value="repair">Repair</option>
                                    <option value="inspection">Inspection</option>
                                    <option value="installation">Installation</option>
                                    <option value="issue">Issue Report</option>
                                </select>
                            </div>

                            {/* Issue Type (only for issue requests) */}
                            {formData.request_type === 'issue' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Issue Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.issue_type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, issue_type: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required={formData.request_type === 'issue'}
                                        >
                                            <option value="">Select issue type...</option>
                                            <option value="malfunction">Malfunction</option>
                                            <option value="damage">Damage</option>
                                            <option value="performance">Performance Issue</option>
                                            <option value="safety">Safety Concern</option>
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required={formData.request_type === 'issue'}
                                        >
                                            <option value="">Select severity...</option>
                                            <option value="minor">Minor</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="major">Major</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Brief description of the request"
                                    required
                                    maxLength={255}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Detailed description of the service request"
                                    rows={6}
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            Create Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
