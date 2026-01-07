'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cancelServiceRequest } from '@/lib/service-requests-api';
import { ServiceRequest } from '@/types/service-requests';
import { toast } from 'react-hot-toast';

interface DeleteServiceRequestModalProps {
    request: ServiceRequest;
    onClose: () => void;
}

export default function DeleteServiceRequestModal({ request, onClose }: DeleteServiceRequestModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await cancelServiceRequest(request.id);
            toast.success('Service request cancelled successfully');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel service request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Cancel Service Request</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                                <span className="font-semibold">Warning:</span> This action cannot be undone. The service request will be cancelled.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-sm font-medium text-gray-600">Request Number:</span>
                                <span className="text-sm font-semibold text-gray-900">{request.request_number}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-sm font-medium text-gray-600">Title:</span>
                                <span className="text-sm font-semibold text-gray-900 text-right">{request.title}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-sm font-medium text-gray-600">Type:</span>
                                <span className="text-sm font-semibold text-gray-900">{request.request_type_display}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-sm font-medium text-gray-600">Status:</span>
                                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        request.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {request.status_display}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm font-medium text-gray-600">Customer:</span>
                                <span className="text-sm font-semibold text-gray-900">{request.customer.full_name}</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-4">
                            Are you sure you want to cancel this service request?
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Keep Request
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-red-500/30"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            )}
                            Cancel Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
