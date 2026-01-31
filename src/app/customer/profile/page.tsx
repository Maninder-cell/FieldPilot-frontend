'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/token-utils';
import { getApiUrl } from '@/lib/api-utils';
import CustomerLayout from '@/components/customer/CustomerLayout';
import {
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Calendar,
    Save,
    Loader2,
    Shield,
    CheckCircle2,
    Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            setProfileData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
            }));
            loadCustomerProfile();
        }
    }, [user, authLoading, router]);

    const loadCustomerProfile = async () => {
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

                setProfileData(prev => ({
                    ...prev,
                    company_name: customerData.company_name || '',
                    address: customerData.address || '',
                    city: customerData.city || '',
                    state: customerData.state || '',
                    zip_code: customerData.zip_code || '',
                    country: customerData.country || '',
                }));
            }
        } catch (error) {
            console.error('Failed to load customer profile:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const accessToken = getAccessToken();
            if (!accessToken) {
                toast.error('Not authenticated');
                router.push('/login');
                return;
            }

            const apiUrl = getApiUrl(false);
            const userResponse = await fetch(`${apiUrl}/auth/profile/update/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    phone: profileData.phone,
                }),
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(errorData.error?.message || 'Failed to update user profile');
            }

            const tenantApiUrl = getApiUrl(true);
            const customerResponse = await fetch(`${tenantApiUrl}/customers/profile/update/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    company_name: profileData.company_name,
                    address: profileData.address,
                    city: profileData.city,
                    state: profileData.state,
                    zip_code: profileData.zip_code,
                    country: profileData.country,
                }),
            });

            if (!customerResponse.ok) {
                const errorData = await customerResponse.json();
                throw new Error(errorData.error?.message || 'Failed to update customer profile');
            }

            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const getInitials = () => {
        const first = profileData.first_name?.charAt(0) || '';
        const last = profileData.last_name?.charAt(0) || '';
        return (first + last).toUpperCase() || 'U';
    };

    return (
        <CustomerLayout>
            <div className="bg-gray-50 min-h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
                        <p className="text-sm text-gray-600 mt-0.5">
                            Manage your personal information
                        </p>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Sidebar - Profile Card */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Avatar Card */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                        <h2 className="text-base font-semibold text-gray-900">Profile</h2>
                                    </div>
                                    <div className="p-5 text-center">
                                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl font-bold text-emerald-600">{getInitials()}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {profileData.first_name} {profileData.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{profileData.email}</p>
                                        {profileData.company_name && (
                                            <p className="text-sm text-gray-600 mt-2 flex items-center justify-center gap-1.5">
                                                <Building2 className="h-4 w-4 text-gray-400" />
                                                {profileData.company_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Account Status Card */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-emerald-600" />
                                            Account Status
                                        </h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Status</span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                user?.is_active 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {user?.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Member Since</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {user?.created_at 
                                                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) 
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Help Card */}
                                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-emerald-900 mb-1">Need Help?</h3>
                                            <p className="text-xs text-emerald-700 leading-relaxed">
                                                Contact support if you need to change your email address or have any account-related questions.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content - Edit Form */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Information */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                                <User className="h-5 w-5 text-emerald-600" />
                                                Personal Information
                                            </h2>
                                        </div>
                                        <div className="p-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                        First Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={profileData.first_name}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        value={profileData.last_name}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                                <Mail className="h-5 w-5 text-emerald-600" />
                                                Contact Information
                                            </h2>
                                        </div>
                                        <div className="p-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={profileData.email}
                                                        disabled
                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                        Phone
                                                    </label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={profileData.phone}
                                                            onChange={handleChange}
                                                            placeholder="+1 (555) 000-0000"
                                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Information */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                                <Building2 className="h-5 w-5 text-emerald-600" />
                                                Company Information
                                            </h2>
                                        </div>
                                        <div className="p-5">
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                value={profileData.company_name}
                                                onChange={handleChange}
                                                placeholder="Your company name"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-emerald-600" />
                                                Address
                                            </h2>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                    Street Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={profileData.address}
                                                    onChange={handleChange}
                                                    placeholder="123 Main Street"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={profileData.city}
                                                        onChange={handleChange}
                                                        placeholder="City"
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                        State
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={profileData.state}
                                                        onChange={handleChange}
                                                        placeholder="State"
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                        ZIP Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zip_code"
                                                        value={profileData.zip_code}
                                                        onChange={handleChange}
                                                        placeholder="12345"
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                    Country
                                                </label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={profileData.country}
                                                    onChange={handleChange}
                                                    placeholder="United States"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
