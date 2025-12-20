'use client';

import { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    PackagePlus,
    PackageCheck,
    User,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    getTaskMaterials,
    logMaterialNeeded,
    logMaterialReceived,
} from '@/lib/tasks-api';
import { MaterialLog, LogMaterialRequest } from '@/types/tasks';

interface TaskMaterialsProps {
    taskId: string;
}

export default function TaskMaterials({ taskId }: TaskMaterialsProps) {
    const [materials, setMaterials] = useState<MaterialLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState<'needed' | 'received'>('needed');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<LogMaterialRequest>({
        material_name: '',
        quantity: 1,
        unit: '',
        notes: '',
    });

    useEffect(() => {
        loadMaterials();
    }, [taskId]);

    const loadMaterials = async () => {
        try {
            setIsLoading(true);
            const response = await getTaskMaterials(taskId);
            setMaterials(response.data || []);
        } catch (error: any) {
            console.error('Failed to load materials:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddModal = (type: 'needed' | 'received') => {
        setAddType(type);
        setFormData({ material_name: '', quantity: 1, unit: '', notes: '' });
        setShowAddModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.material_name.trim() || !formData.unit.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            if (addType === 'needed') {
                await logMaterialNeeded(taskId, formData);
                toast.success('Material needed logged');
            } else {
                await logMaterialReceived(taskId, formData);
                toast.success('Material received logged');
            }
            setShowAddModal(false);
            await loadMaterials();
        } catch (error: any) {
            toast.error(error.message || 'Failed to log material');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const neededMaterials = materials.filter((m) => m.log_type === 'needed');
    const receivedMaterials = materials.filter((m) => m.log_type === 'received');

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
                </div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    Materials ({materials.length})
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleOpenAddModal('needed')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                        <PackagePlus className="h-4 w-4" />
                        Need
                    </button>
                    <button
                        onClick={() => handleOpenAddModal('received')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <PackageCheck className="h-4 w-4" />
                        Received
                    </button>
                </div>
            </div>

            {materials.length === 0 ? (
                <div className="text-center py-6">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No materials logged yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Needed Materials */}
                    <div>
                        <h3 className="text-sm font-medium text-orange-700 mb-2 flex items-center gap-1.5">
                            <PackagePlus className="h-4 w-4" />
                            Needed ({neededMaterials.length})
                        </h3>
                        {neededMaterials.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No materials needed</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {neededMaterials.map((material) => (
                                    <div
                                        key={material.id}
                                        className="p-2 bg-orange-50 rounded-lg border border-orange-100"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {material.material_name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {material.quantity} {material.unit}
                                                </p>
                                            </div>
                                        </div>
                                        {material.notes && (
                                            <p className="text-xs text-gray-500 mt-1">{material.notes}</p>
                                        )}
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                            <User className="h-3 w-3" />
                                            {material.logged_by_name} • {formatDate(material.logged_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Received Materials */}
                    <div>
                        <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1.5">
                            <PackageCheck className="h-4 w-4" />
                            Received ({receivedMaterials.length})
                        </h3>
                        {receivedMaterials.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No materials received</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {receivedMaterials.map((material) => (
                                    <div
                                        key={material.id}
                                        className="p-2 bg-green-50 rounded-lg border border-green-100"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {material.material_name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {material.quantity} {material.unit}
                                                </p>
                                            </div>
                                        </div>
                                        {material.notes && (
                                            <p className="text-xs text-gray-500 mt-1">{material.notes}</p>
                                        )}
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                            <User className="h-3 w-3" />
                                            {material.logged_by_name} • {formatDate(material.logged_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Material Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowAddModal(false)}
                        />
                        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    {addType === 'needed' ? (
                                        <>
                                            <PackagePlus className="h-5 w-5 text-orange-600" />
                                            Log Material Needed
                                        </>
                                    ) : (
                                        <>
                                            <PackageCheck className="h-5 w-5 text-green-600" />
                                            Log Material Received
                                        </>
                                    )}
                                </h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Material Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.material_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, material_name: e.target.value })
                                        }
                                        placeholder="e.g., Copper Wire, Filter, etc."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={formData.quantity}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    quantity: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) =>
                                                setFormData({ ...formData, unit: e.target.value })
                                            }
                                            placeholder="e.g., pcs, kg, m"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value })
                                        }
                                        placeholder="Additional notes..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                                            addType === 'needed'
                                                ? 'bg-orange-600 hover:bg-orange-700'
                                                : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
