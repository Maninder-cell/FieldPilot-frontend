import { getUserData } from './token-utils';

/**
 * Get the API URL with tenant subdomain if user is logged in
 * For auth endpoints (login, register), use base URL without tenant
 * For tenant-specific endpoints, use tenant subdomain
 */
export function getApiUrl(useTenant: boolean = true): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  if (!useTenant) {
    // For auth endpoints that don't need tenant context
    return `${baseUrl}/api/v1`;
  }
  
  // Try to get tenant from stored user data
  const userData = getUserData();
  
  if (userData && userData.tenant_slug) {
    // Use tenant subdomain for tenant-specific API calls
    const tenantUrl = baseUrl.replace('localhost', `${userData.tenant_slug}.localhost`);
    return `${tenantUrl}/api/v1`;
  }
  
  // Fallback to base URL if no tenant found
  return `${baseUrl}/api/v1`;
}

/**
 * Get tenant slug from stored user data
 */
export function getTenantSlug(): string | null {
  const userData = getUserData();
  return userData?.tenant_slug || null;
}
