'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, RegisterRequest, ApiError } from '@/types/auth';
import {
  loginUser,
  registerUser,
  verifyEmail as verifyEmailAPI,
  logoutUser as logoutUserAPI,
  refreshAccessToken,
  getCurrentUser,
} from '@/lib/auth-api';
import {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearAuthData,
  storeUserData,
  getUserData,
  isTokenExpired,
} from '@/lib/token-utils';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  verifyEmail: (email: string, otpCode: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = getAccessToken();
        const storedUser = getUserData();

        if (accessToken && storedUser) {
          // Check if token is expired
          if (isTokenExpired(accessToken)) {
            // Try to refresh token
            await handleRefreshToken();
          } else {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = async () => {
      const accessToken = getAccessToken();
      if (accessToken && isTokenExpired(accessToken)) {
        await handleRefreshToken();
      }
    };

    // Check token expiry every minute
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const handleRefreshToken = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await refreshAccessToken(refreshToken);
      storeTokens(response.access, response.refresh || refreshToken);

      // Fetch updated user data
      const userData = await getCurrentUser(response.access);
      setUser(userData);
      storeUserData(userData);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await handleLogout();
    }
  };

  const handleLogin = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const response = await loginUser({ email, password, remember_me: rememberMe });

      // Store tokens and user data
      storeTokens(response.tokens.access, response.tokens.refresh);
      storeUserData(response.user);
      setUser(response.user);

      // Store email in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();
      if (refreshToken && accessToken) {
        await logoutUserAPI(refreshToken, accessToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data
      clearAuthData();

      // Clear all localStorage to ensure complete logout
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }

      // Clear session storage as well (for reset tokens, etc.)
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      setUser(null);
      router.push('/login');
    }
  };

  const handleRegister = async (data: RegisterRequest) => {
    try {
      await registerUser(data);
      // Don't log in automatically - user needs to verify email first
    } catch (error) {
      throw error;
    }
  };

  const handleVerifyEmail = async (email: string, otpCode: string) => {
    try {
      await verifyEmailAPI({ email, otp_code: otpCode });
      // Don't log in automatically - redirect to login page
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    verifyEmail: handleVerifyEmail,
    refreshToken: handleRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
