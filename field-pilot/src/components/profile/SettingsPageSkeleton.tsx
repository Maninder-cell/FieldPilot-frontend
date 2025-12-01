'use client';

import React from 'react';

export default function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(4)].map((_, categoryIndex) => (
        <div
          key={categoryIndex}
          className="bg-white shadow-sm rounded-lg border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {[...Array(categoryIndex === 0 ? 1 : 1)].map((_, itemIndex) => (
              <div key={itemIndex} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-56"></div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
