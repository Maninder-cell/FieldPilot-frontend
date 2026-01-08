'use client';

import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AcceptRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    onSuccess: () => void;
}

export default function AcceptRequestModal({ isOpen, onClose, requestId, onSuccess }: AcceptRequestModalProps) {
    const [responseMessage, setResponseMessage] = useState('');
    const [estimatedTimeline, setEstimatedTimeline] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!responseMessage.trim()) {
            toast.error('Please enter a response message');
            return;
        }

        setSubmitting(true);
        try {
            const { acceptServiceRequest } = await import('@/lib/service-requests-api');
            await acceptServiceRequest(requestId, {
                response_message: responseMessage,
                estimated_timeline: estimatedTimeline || undefined,
            });
            toast.success('Service request accepted successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Accept Service Request</h2>
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
                            Response Message *
                        </label>
                        <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            rows={4}
                            placeholder="Enter your response to the customer..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Timeline (Optional)
                        </label>
                        <input
                            type="text"
                            value={estimatedTimeline}
                            onChange={(e) => setEstimatedTimeline(e.target.value)}
                            placeholder="e.g., 2-3 business days"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Accepting...' : 'Accept Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
