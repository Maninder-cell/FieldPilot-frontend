/**
 * Schema Guard Utility
 * Handles schema detection and validation for multi-tenant architecture
 */

/**
 * Detect if current request is from public schema (localhost:8000)
 * or tenant schema (subdomain.localhost:8000)
 */
export function isPublicSchema(): boolean {
  if (typeof window === 'undefined') {
    return true; // Server-side, assume public
  }

  const hostname = window.location.hostname;
  
  // Check if it's localhost without subdomain
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Detect if current request is from tenant schema
 */
export function isTenantSchema(): boolean {
  return !isPublicSchema();
}

/**
 * Get tenant subdomain from current URL
 * Returns null if on public schema
 */
export function getTenantSubdomain(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  
  // Check if it's a subdomain
  if (hostname.includes('.')) {
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[0] !== 'www') {
      return parts[0];
    }
  }

  return null;
}

/**
 * Get the public schema URL
 */
export function getPublicSchemaUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:8000';
  }

  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  return `${protocol}//localhost${port}`;
}

/**
 * Get tenant schema URL for a given subdomain
 */
export function getTenantSchemaUrl(subdomain: string): string {
  if (typeof window === 'undefined') {
    return `http://${subdomain}.localhost:8000`;
  }

  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  return `${protocol}//${subdomain}.localhost${port}`;
}

/**
 * Redirect to public schema
 */
export function redirectToPublicSchema(path: string = '/'): void {
  if (typeof window === 'undefined') {
    return;
  }

  const publicUrl = getPublicSchemaUrl();
  window.location.href = `${publicUrl}${path}`;
}

/**
 * Redirect to tenant schema
 */
export function redirectToTenantSchema(subdomain: string, path: string = '/'): void {
  if (typeof window === 'undefined') {
    return;
  }

  const tenantUrl = getTenantSchemaUrl(subdomain);
  window.location.href = `${tenantUrl}${path}`;
}

/**
 * Format schema access error message
 */
export function getSchemaAccessError(requiredSchema: 'public' | 'tenant'): string {
  if (requiredSchema === 'public') {
    return `This endpoint is only available from the onboarding portal. Please access via ${getPublicSchemaUrl()}`;
  } else {
    return 'This endpoint is only available from your tenant workspace.';
  }
}

/**
 * Validate that current schema matches required schema
 * Throws error if mismatch
 */
export function validateSchema(requiredSchema: 'public' | 'tenant'): void {
  const isPublic = isPublicSchema();
  
  if (requiredSchema === 'public' && !isPublic) {
    throw new Error(getSchemaAccessError('public'));
  }
  
  if (requiredSchema === 'tenant' && isPublic) {
    throw new Error(getSchemaAccessError('tenant'));
  }
}

/**
 * Check if onboarding endpoints should be accessible
 * Onboarding endpoints are only accessible from public schema
 */
export function canAccessOnboarding(): boolean {
  return isPublicSchema();
}

/**
 * Check if tenant-specific endpoints should be accessible
 * Tenant endpoints are only accessible from tenant schema
 */
export function canAccessTenantEndpoints(): boolean {
  return isTenantSchema();
}
