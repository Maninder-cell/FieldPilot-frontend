'use client';

import React from 'react';

export default function CompanyInfoSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Trial Status (optional) */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>

      {/* Company Details */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {/* Basic Information */}
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start">
                <div className="w-5 h-5 bg-gray-200 rounded mr-3 mt-0.5"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address Information */}
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          
          <div className="flex items-start">
            <div className="w-5 h-5 bg-gray-200 rounded mr-3 mt-0.5"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Workspace Information */}
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        {/* Metadata */}
        <div className="p-6 space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
