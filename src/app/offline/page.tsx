'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-10 w-10 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          It looks like you've lost your internet connection. Please check your connection and try again.
        </p>
        
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
        
        <p className="text-sm text-gray-500 mt-8">
          Some features may still be available offline.
        </p>
      </div>
    </div>
  );
}
