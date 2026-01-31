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
    Shield,
    Mail,
    MessageSquare,
    Smartphone,
    Wrench,
    Calendar,
    Megaphone,
    Clock,
    Languages,
    ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
];

const NOTIFICATION_CONFIG = [
    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive updates via email', icon: Mail },
    { key: 'sms_notifications', label: 'SMS Notifications', description: 'Get text message alerts', icon: MessageSquare },
    { key: 'push_notifications', label: 'Push Notifications', description: 'Browser push notifications', icon: Smartphone },
    { key: 'service_updates', label: 'Service Updates', description: 'Updates on your service requests', icon: Wrench },
    { key: 'maintenance_reminders', label: 'Maintenance Reminders', description: 'Scheduled maintenance alerts', icon: Calendar },
    { key: 'marketing_emails', label: 'Marketing Emails', description: 'News and promotional content', icon: Megaphone },
];

export default function CustomerSettings() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('security');
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
            loadSettings();
        }
    }, [user, authLoading, router]);

    const loadSettings = async () => {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) return;

            const apiUrl = getApiUrl(true);
            const response = await fetch(`${apiUrl}/customers/profile/update/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const customerData = data.success ? data.data : data;

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

            const apiUrl = getApiUrl(false);
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
                let errorMessage = 'Failed to change password';

                if (errorData.error?.details) {
                    if (errorData.error.details.non_field_errors) {
                        errorMessage = errorData.error.details.non_field_errors[0];
                    } else if (errorData.error.details.current_password) {
                        errorMessage = errorData.error.details.current_password[0];
                    } else if (errorData.error.details.new_password) {
                        errorMessage = errorData.error.details.new_password[0];
                    } else if (errorData.error.details.new_password_confirm) {
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
            <div className="bg-gray-50 min-h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-sm text-gray-600 mt-0.5">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    {/* Horizontal Tabs */}
                    <div className="px-4 sm:px-6">
                        <div className="flex gap-1 border-b border-gray-200 -mb-px">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            isActive
                                                ? 'border-emerald-600 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-6">
                    <div className="max-w-2xl mx-auto">
                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-emerald-600" />
                                        Change Password
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Update your password to keep your account secure</p>
                                </div>
                                <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="Enter current password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={passwordData.new_password}
                                                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    placeholder="Enter new password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={passwordData.confirm_password}
                                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Password must be at least 8 characters long
                                    </p>
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Change Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-emerald-600" />
                                        Notification Preferences
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Choose how you want to receive notifications</p>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-1">
                                        {NOTIFICATION_CONFIG.map(({ key, label, description, icon: Icon }) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Icon className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{label}</p>
                                                        <p className="text-xs text-gray-500">{description}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setNotificationSettings(prev => ({
                                                        ...prev,
                                                        [key]: !prev[key as keyof typeof prev]
                                                    }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        notificationSettings[key as keyof typeof notificationSettings]
                                                            ? 'bg-emerald-600'
                                                            : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                                                            notificationSettings[key as keyof typeof notificationSettings]
                                                                ? 'translate-x-6'
                                                                : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={handleNotificationSave}
                                            disabled={isLoading}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Save Notifications
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-emerald-600" />
                                        Display Preferences
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Customize your experience</p>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                Language
                                            </label>
                                            <div className="relative">
                                                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <select
                                                    value={preferences.language}
                                                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                                >
                                                    <option value="en">English</option>
                                                    <option value="es">Spanish</option>
                                                    <option value="fr">French</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                Timezone
                                            </label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <select
                                                    value={preferences.timezone}
                                                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                                >
                                                    <option value="UTC">UTC</option>
                                                    <option value="America/New_York">Eastern Time</option>
                                                    <option value="America/Chicago">Central Time</option>
                                                    <option value="America/Denver">Mountain Time</option>
                                                    <option value="America/Los_Angeles">Pacific Time</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                Date Format
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <select
                                                    value={preferences.date_format}
                                                    onChange={(e) => setPreferences(prev => ({ ...prev, date_format: e.target.value }))}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                                >
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                Time Format
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <select
                                                    value={preferences.time_format}
                                                    onChange={(e) => setPreferences(prev => ({ ...prev, time_format: e.target.value }))}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
                                                >
                                                    <option value="12h">12 Hour</option>
                                                    <option value="24h">24 Hour</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={handlePreferencesSave}
                                            disabled={isLoading}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
