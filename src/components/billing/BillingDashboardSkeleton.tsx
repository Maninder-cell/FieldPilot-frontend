export function BillingDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 bg-gray-200 rounded w-64 mb-3"></div>
        <div className="h-5 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Subscription Overview Skeleton */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-40"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-36"></div>
          </div>
        </div>
      </div>

      {/* Usage Metrics Skeleton */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-7 bg-gray-200 rounded w-40 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Invoices Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 bg-gray-200 rounded w-40"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 bg-gray-200 rounded w-40"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-4 bg-white rounded-md border border-gray-200">
              <div className="w-6 h-6 bg-gray-200 rounded mr-3"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
