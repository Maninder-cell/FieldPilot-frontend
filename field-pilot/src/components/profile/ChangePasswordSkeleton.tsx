'use client';

import React from 'react';

export default function ChangePasswordSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Form Card */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
          
          <div className="flex gap-4 pt-4">
            <div className="h-10 bg-gray-200 rounded w-40"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex">
          <div className="shrink-0">
            <div className="h-5 w-5 bg-emerald-200 rounded-full"></div>
          </div>
          <div className="ml-3 flex-1">
            <div className="h-4 bg-emerald-200 rounded w-48 mb-2"></div>
            <div className="space-y-2 mt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-3 bg-emerald-200 rounded w-full max-w-xs"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
