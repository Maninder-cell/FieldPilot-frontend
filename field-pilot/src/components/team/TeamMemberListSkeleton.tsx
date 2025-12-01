export function TeamMemberListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-36"></div>
      </div>

      {/* Desktop Table View Skeleton */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-right">
                <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-40"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="h-8 w-8 bg-gray-200 rounded ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View Skeleton */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center flex-1">
                <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="ml-3 flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
