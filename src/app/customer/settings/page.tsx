'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/token-utils';
import { getApiUrl } from '@/lib/api-utils';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    Lock,
    Bell,
    Globe,
    Save,
    Loader2,
    Eye,
    EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerSettings() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        service_updates: true,
        maintenance_reminders: true,
        marketing_emails: false,
    });

    const [preferences, setPreferences] = useState({
        language: 'en',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            // Load settings from user profile or customer profile
            loadSettings();
        }
    }, [user, authLoading, router]);

    const loadSettings = async () => {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) return;

            const apiUrl = getApiUrl(true);

            // Load customer profile to get preferences
            const response = await fetch(`${apiUrl}/customers/profile/update/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const customerData = data.success ? data.data : data;

                // Load preferences from customer notes or settings field if available
                // For now, using defaults
                if (customerData.notes) {
                    try {
                        const notes = JSON.parse(customerData.notes);
                        if (notes.notification_settings) {
                            setNotificationSettings(notes.notification_settings);
                        }
                        if (notes.preferences) {
                            setPreferences(notes.preferences);
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse customer notes:', parseError);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                toast.error('Not authenticated');
                return;
            }

            const apiUrl = getApiUrl(false); // Use base URL for auth endpoints

            const response = await fetch(`${apiUrl}/auth/change-password/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                    new_password_confirm: passwordData.confirm_password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Extract error message from various possible locations
                let errorMessage = 'Failed to change password';

                if (errorData.error?.details) {
                    // Check for non_field_errors first
                    if (errorData.error.details.non_field_errors) {
                        errorMessage = errorData.error.details.non_field_errors[0];
                    }
                    // Check for current_password errors
                    else if (errorData.error.details.current_password) {
                        errorMessage = errorData.error.details.current_password[0];
                    }
                    // Check for new_password errors
                    else if (errorData.error.details.new_password) {
                        errorMessage = errorData.error.details.new_password[0];
                    }
                    // Check for new_password_confirm errors
                    else if (errorData.error.details.new_password_confirm) {
                        errorMessage = errorData.error.details.new_password_confirm[0];
                    }
                } else if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
                }

                throw new Error(errorMessage);
            }

            toast.success('Password changed successfully');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
        } catch (error: any) {
            console.error('Failed to change password:', error);
            toast.error(error.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationSave = async () => {
        setIsLoading(true);
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                toast.error('Not authenticated');
                return;
            }

            const apiUrl = getApiUrl(true);

            // Save notification settings to customer notes as JSON
            const response = await fetch(`${apiUrl}/customers/profile/update/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    notes: JSON.stringify({ notification_settings: notificationSettings }),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save notification settings');
            }

            toast.success('Notification settings saved');
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferencesSave = async () => {
        setIsLoading(true);
        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                toast.error('Not authenticated');
                return;
            }

            const apiUrl = getApiUrl(true);

            // Save preferences to customer notes as JSON
            const response = await fetch(`${apiUrl}/customers/profile/update/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    notes: JSON.stringify({ preferences }),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save preferences');
            }

            toast.success('Preferences saved');
        } catch (error: any) {
            console.error('Failed to save preferences:', error);
            toast.error(error.message || 'Failed to save preferences');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Manage your account settings and preferences
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                    {/* Security Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-emerald-600" />
                            Security
                        </h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Change Password
                            </button>
                        </form>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-emerald-600" />
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(notificationSettings).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">
                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </label>
                                    <button
                                        onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !value }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-emerald-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleNotificationSave}
                            disabled={isLoading}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Save Notification Settings
                        </button>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-emerald-600" />
                            Preferences
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <div className="relative">
                                    <select
                                        value={preferences.language}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone
                                </label>
                                <div className="relative">
                                    <select
                                        value={preferences.timezone}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time</option>
                                        <option value="America/Chicago">Central Time</option>
                                        <option value="America/Denver">Mountain Time</option>
                                        <option value="America/Los_Angeles">Pacific Time</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date Format
                                </label>
                                <div className="relative">
                                    <select
                                        value={preferences.date_format}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, date_format: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time Format
                                </label>
                                <div className="relative">
                                    <select
                                        value={preferences.time_format}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, time_format: e.target.value }))}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="12h">12 Hour</option>
                                        <option value="24h">24 Hour</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handlePreferencesSave}
                            disabled={isLoading}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
