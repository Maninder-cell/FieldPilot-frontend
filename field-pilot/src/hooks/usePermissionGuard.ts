import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'owner' | 'admin' | 'manager' | 'member';

interface PermissionGuardOptions {
  requiredRoles: UserRole[];
  redirectTo?: string;
  showError?: boolean;
}

/**
 * Hook to guard routes based on user role/permissions
 * Redirects or shows error if user doesn't have required permissions
 */
export function usePermissionGuard(options: PermissionGuardOptions) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const { requiredRoles, redirectTo = '/dashboard', showError = true } = options;

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user has required role
    if (user && requiredRoles.includes(user.role as UserRole)) {
      setHasPermission(true);
      setPermissionError(null);
    } else {
      setHasPermission(false);
      
      if (showError) {
        const roleNames = requiredRoles.join(', ');
        setPermissionError(
          `You don't have permission to access this page. Required role: ${roleNames}`
        );
      }

      // Redirect to specified page
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, user, requiredRoles, redirectTo, showError, router]);

  return {
    hasPermission,
    permissionError,
    isLoading: authLoading,
    userRole: user?.role,
  };
}

/**
 * Helper function to check if user has specific permission
 */
export function hasRole(userRole: string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * Helper function to check if user is owner or admin
 */
export function isOwnerOrAdmin(userRole: string | undefined): boolean {
  return hasRole(userRole, ['owner', 'admin']);
}
