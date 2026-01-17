'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    Timer,
    Play,
    Pause,
    CheckCircle,
    MessageSquare,
    Eye,
    Car,
    MapPin,
    LogOut as LogOutIcon,
    Coffee,
    Camera,
    FileText,
    Package,
    BarChart3,
    Flame,
    Calendar,
    Building2,
} from 'lucide-react';

export default function TechnicianDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return null;
    }

    if (!user) {
        return null;
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <TechnicianLayout>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Welcome Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                👋 Welcome back, {user.full_name}!
                            </h1>
                            <p className="mt-1 text-gray-600">Here's what's happening with your tasks today.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">{formatTime(currentTime)}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-700 font-medium">On Duty</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Today's Tasks */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <ClipboardList className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Today's Tasks</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">5</p>
                        <p className="text-xs text-gray-500 mt-1">tasks</p>
                    </div>

                    {/* Active Task */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Timer className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Active Task</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">1</p>
                        <p className="text-xs text-gray-500 mt-1">active</p>
                    </div>

                    {/* Completed Today */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Completed Today</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">2</p>
                        <p className="text-xs text-gray-500 mt-1">completed</p>
                    </div>

                    {/* Hours Today */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Hours Today</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">4.5h</p>
                        <p className="text-xs text-gray-500 mt-1">worked</p>
                    </div>
                </div>

                {/* Currently Working On Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="h-6 w-6 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Currently Working On</h2>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">TASK-0042: HVAC Maintenance - Building A</h3>
                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                                        High Priority
                                    </span>
                                    <span>Started: 09:15 AM</span>
                                    <span>Duration: 1h 30m</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Equipment</p>
                                <p className="text-sm text-gray-900">Roof Top Unit 4 (RTU-4)</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Location</p>
                                <p className="text-sm text-gray-900">123 Business Ave, Building A, Floor R</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <Pause className="h-4 w-4" />
                                Pause Work
                            </button>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                                <CheckCircle className="h-4 w-4" />
                                Complete Task
                            </button>
                            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <MessageSquare className="h-4 w-4" />
                                Add Comment
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Today's Tasks */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Today's Tasks List */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">📋 Today's Tasks</h2>
                                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                    View All →
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Task 1 */}
                                <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-200 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">TASK-0043: Electrical Inspection</h3>
                                                <p className="text-sm text-gray-600 mt-1">Scheduled: 3:00 PM - 5:00 PM</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                        Medium
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        Building B, Floor 2
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                                            <Play className="h-4 w-4" />
                                            Start
                                        </button>
                                        <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                            <Eye className="h-4 w-4" />
                                            View
                                        </button>
                                    </div>
                                </div>

                                {/* Task 2 */}
                                <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-200 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">TASK-0044: Plumbing Repair</h3>
                                                <p className="text-sm text-gray-600 mt-1">Scheduled: Tomorrow 9:00 AM</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                        High
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        Building C, Floor 1
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                            <Eye className="h-4 w-4" />
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <Car className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">Start Travel</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <MapPin className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">Arrive</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <LogOutIcon className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">Depart</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <Coffee className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">Lunch Break</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <Camera className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">Upload Photo</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <FileText className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">Add Note</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <Package className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">Request Materials</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">View Hours</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Work Hours & Activity */}
                    <div className="space-y-6">
                        {/* Work Hours Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">📈 This Week's Hours</h2>
                                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                    View Report →
                                </button>
                            </div>

                            <div className="space-y-3 mb-4">
                                {[
                                    { day: 'Mon', hours: 8.0, percentage: 100 },
                                    { day: 'Tue', hours: 6.5, percentage: 81 },
                                    { day: 'Wed', hours: 8.0, percentage: 100 },
                                    { day: 'Thu', hours: 4.5, percentage: 56, isToday: true },
                                    { day: 'Fri', hours: 0.0, percentage: 0 },
                                ].map((item) => (
                                    <div key={item.day}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className={`font-medium ${item.isToday ? 'text-emerald-600' : 'text-gray-700'}`}>
                                                {item.day}
                                            </span>
                                            <span className="text-gray-600">{item.hours}h</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${item.isToday ? 'bg-emerald-600' : 'bg-emerald-500'}`}
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total Hours:</span>
                                    <span className="font-semibold text-gray-900">27.0h / 40h (74%)</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Overtime:</span>
                                    <span className="font-semibold text-gray-900">0.0h</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Travel:</span>
                                    <span className="font-semibold text-gray-900">3.5h</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">🕐 Recent Activity</h2>
                            <div className="space-y-3">
                                {[
                                    { time: '1:00 PM', action: 'Started work on TASK-0042' },
                                    { time: '12:30 PM', action: 'Ended lunch break' },
                                    { time: '12:00 PM', action: 'Started lunch break' },
                                    { time: '11:45 AM', action: 'Completed TASK-0041' },
                                    { time: '11:00 AM', action: 'Uploaded 3 photos to TASK-0041' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{item.action}</p>
                                            <p className="text-xs text-gray-500">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                View Full Timeline →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </TechnicianLayout>
    );
}
