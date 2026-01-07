'use client';

import { useState } from 'react';
import { X, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RejectRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    onSuccess: () => void;
}

export default function RejectRequestModal({ isOpen, onClose, requestId, onSuccess }: RejectRequestModalProps) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rejectionReason.trim()) {
            toast.error('Please enter a rejection reason');
            return;
        }

        setSubmitting(true);
        try {
            const { rejectServiceRequest } = await import('@/lib/service-requests-api');
            await rejectServiceRequest(requestId, {
                rejection_reason: rejectionReason,
            });
            toast.success('Service request rejected');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Reject Service Request</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rejection Reason *
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            placeholder="Please explain why this request is being rejected..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Rejecting...' : 'Reject Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
