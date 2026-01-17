'use client';

import { useState, useEffect } from 'react';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    MapPin,
    Shield,
    Loader2,
    Edit
} from 'lucide-react';
import { getProfile } from '@/lib/auth-api';
import { getAccessToken } from '@/lib/token-utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const token = getAccessToken();
            if (!token) return;

            const data = await getProfile(token);
            setProfile(data);
        } catch (error: any) {
            console.error('Failed to load profile:', error);
            toast.error(error.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <TechnicianLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
            </TechnicianLayout>
        );
    }

    return (
        <TechnicianLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
                        <p className="mt-1 text-gray-600">View your profile information</p>
                    </div>
                    <button
                        onClick={() => router.push('/technician/settings')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Header Section with Avatar */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8">
                        <div className="flex items-center gap-6">
                            {profile?.user?.avatar_url ? (
                                <img
                                    src={profile.user.avatar_url}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                    <span className="text-3xl font-bold text-emerald-600">
                                        {profile?.user?.first_name?.[0]}{profile?.user?.last_name?.[0]}
                                    </span>
                                </div>
                            )}
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{profile?.user?.full_name}</h2>
                                <p className="text-emerald-100 mt-1">{profile?.user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm capitalize">{profile?.user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="px-6 py-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="text-base font-medium text-gray-900">{profile?.user?.full_name || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-base font-medium text-gray-900">{profile?.user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-base font-medium text-gray-900">{profile?.user?.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {profile?.date_of_birth
                                            ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : 'Not provided'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="px-6 py-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Employee ID</p>
                                    <p className="text-base font-medium text-gray-900">{profile?.user?.employee_id || 'Not assigned'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Job Title</p>
                                    <p className="text-base font-medium text-gray-900">{profile?.user?.job_title || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="text-base font-medium text-gray-900">{profile?.user?.department || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Hire Date</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {profile?.hire_date
                                            ? new Date(profile.hire_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : 'Not provided'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    {(profile?.address || profile?.city || profile?.state || profile?.zip_code) && (
                        <div className="px-6 py-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {profile?.address && <span>{profile.address}<br /></span>}
                                        {(profile?.city || profile?.state || profile?.zip_code) && (
                                            <span>
                                                {profile?.city}{profile?.city && profile?.state ? ', ' : ''}{profile?.state} {profile?.zip_code}
                                            </span>
                                        )}
                                        {profile?.country && <><br />{profile.country}</>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Skills & Certifications */}
                    {(profile?.skills?.length > 0 || profile?.certifications?.length > 0) && (
                        <div className="px-6 py-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Certifications</h3>
                            <div className="space-y-4">
                                {profile?.skills?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {profile?.certifications?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Certifications</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.certifications.map((cert: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                                >
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                                <p className="text-sm text-gray-600">Account Status</p>
                                <p className="font-medium text-gray-900">
                                    {profile?.user?.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                                <p className="text-sm text-gray-600">Email Verified</p>
                                <p className="font-medium text-gray-900">
                                    {profile?.user?.is_verified ? 'Yes' : 'No'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div>
                                <p className="text-sm text-gray-600">Last Login</p>
                                <p className="font-medium text-gray-900">
                                    {profile?.user?.last_login_at
                                        ? new Date(profile.user.last_login_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                        : 'Never'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TechnicianLayout>
    );
}
