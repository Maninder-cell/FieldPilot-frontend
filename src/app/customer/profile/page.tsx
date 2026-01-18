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
            // Load user data first
            setProfileData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
            }));

            // Then load customer profile data
            loadCustomerProfile();
        }
    }, [user, authLoading, router]);

    const loadCustomerProfile = async () => {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) return;

            const apiUrl = getApiUrl(true); // Use tenant-aware URL

            // Fetch customer profile to get company and address info
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

            const apiUrl = getApiUrl(false); // Use base URL for auth endpoints

            // Update user profile (first_name, last_name, phone)
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

            const tenantApiUrl = getApiUrl(true); // Use tenant-aware URL for customer profile

            // Update customer profile (company_name, address, city, state, zip_code, country)
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

            // Optionally refresh the user data here
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

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Manage your personal information
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-600" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="h-5 w-5 text-emerald-600" />
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Company Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-emerald-600" />
                                Company Information
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={profileData.company_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                                Address
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={profileData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={profileData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            name="zip_code"
                                            value={profileData.zip_code}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={profileData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                Account Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Member Since
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Status
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.is_active ? 'Active' : 'Inactive'}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
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
        </CustomerLayout>
    );
}
