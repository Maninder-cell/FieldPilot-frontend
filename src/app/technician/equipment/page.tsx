'use client';

import TechnicianLayout from '@/components/technician/TechnicianLayout';

export default function EquipmentPage() {
    return (
        <TechnicianLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
                    <p className="mt-2 text-gray-600">Manage and view equipment information</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Management</h3>
                        <p className="text-gray-500">This page is under construction</p>
                    </div>
                </div>
            </div>
        </TechnicianLayout>
    );
}
