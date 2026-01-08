'use client';

import { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InternalNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    currentNotes?: string;
    onSuccess: () => void;
}

export default function InternalNotesModal({ isOpen, onClose, requestId, currentNotes = '', onSuccess }: InternalNotesModalProps) {
    const [notes, setNotes] = useState(currentNotes);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!notes.trim()) {
            toast.error('Please enter internal notes');
            return;
        }

        setSubmitting(true);
        try {
            const { updateInternalNotes } = await import('@/lib/service-requests-api');
            await updateInternalNotes(requestId, notes);
            toast.success('Internal notes updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update notes');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Internal Notes</h2>
                            <p className="text-sm text-gray-500">Only visible to staff members</p>
                        </div>
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
                            Notes *
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={8}
                            placeholder="Add internal notes about this request (not visible to customer)..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            💡 Use this for internal communication, task assignments, or notes about the request
                        </p>
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
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
