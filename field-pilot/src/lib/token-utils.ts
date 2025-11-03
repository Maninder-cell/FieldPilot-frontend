// Token management utilities for authentication

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'field_pilot_access_token',
  REFRESH_TOKEN: 'field_pilot_refresh_token',
  USER_DATA: 'field_pilot_user_data',
  TOKEN_EXPIRY: 'field_pilot_token_expiry',
};

/**
 * Store authentication tokens in localStorage
 */
export function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    
    // Store token expiry time
    const decoded = decodeToken(accessToken);
    if (decoded?.exp) {
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, decoded.exp.toString());
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
}

/**
 * Retrieve access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
}

/**
 * Retrieve refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
}

/**
 * Store user data in localStorage
 */
export function storeUserData(userData: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
}

/**
 * Retrieve user data from localStorage
 */
export function getUserData(): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

/**
 * Decode JWT token to get payload
 */
export function decodeToken(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if access token is expired or about to expire (within 1 minute)
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 60; // 1 minute buffer
  
  return decoded.exp < (currentTime + bufferTime);
}

/**
 * Calculate time until token expiration in seconds
 */
export function getTokenExpiryTime(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - currentTime;
  
  return Math.max(0, timeUntilExpiry);
}

/**
 * Check if user has valid authentication tokens
 */
export function hasValidTokens(): boolean {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  if (!accessToken || !refreshToken) return false;
  
  // Check if access token is still valid
  return !isTokenExpired(accessToken);
}
