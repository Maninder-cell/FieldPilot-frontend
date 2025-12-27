'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    FileBarChart,
    ClipboardList,
    Wrench,
    Users,
    Headphones,
    DollarSign,
    Calendar,
    Download,
    FileText,
    FileSpreadsheet,
    Clock,
    ChevronRight,
    Filter,
    Search,
    RefreshCw,
    History,
    CalendarClock,
    ArrowLeft,
    Check,
    AlertCircle,
    Loader2,
    Play,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    REPORT_CATEGORIES,
    getReportTypes,
    generateReport,
    getReportAuditLogs,
    ReportType,
    ReportAuditLog,
    ReportFilters,
    getReportPdfUrl,
    getReportExcelUrl,
} from '@/lib/reports-api';

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
    ClipboardList,
    Wrench,
    Users,
    Headphones,
    DollarSign,
};

interface ReportCategory {
    name: string;
    description: string;
    icon: string;
    reports: { type: string; name: string; description: string }[];
}

export default function ReportsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // State
    const [activeView, setActiveView] = useState<'dashboard' | 'generate' | 'history'>('dashboard');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<{ type: string; name: string; description: string } | null>(null);
    const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
    const [auditLogs, setAuditLogs] = useState<ReportAuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Filter state for report generation
    const [filters, setFilters] = useState<ReportFilters>({});
    const [outputFormat, setOutputFormat] = useState<'json' | 'pdf' | 'excel'>('json');
    const [useCache, setUseCache] = useState(true);

    // Generated report data
    const [generatedReport, setGeneratedReport] = useState<any>(null);
    const [reportId, setReportId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadReportTypes();
            loadAuditLogs();
        }
    }, [user]);

    const loadReportTypes = async () => {
        try {
            const response = await getReportTypes();
            if (response.success && response.data) {
                setReportTypes(response.data);
            }
        } catch (error: any) {
            console.error('Failed to load report types:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAuditLogs = async () => {
        try {
            const response = await getReportAuditLogs({ page_size: 10 });
            if ('results' in response) {
                setAuditLogs(response.results);
            }
        } catch (error: any) {
            console.error('Failed to load audit logs:', error);
        }
    };

    const handleSelectReport = (report: { type: string; name: string; description: string }) => {
        setSelectedReport(report);
        setActiveView('generate');
        setGeneratedReport(null);
        setReportId(null);
        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        setFilters({
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0],
        });
    };

    const handleGenerateReport = async () => {
        if (!selectedReport) return;

        setIsGenerating(true);
        try {
            const response = await generateReport({
                report_type: selectedReport.type,
                filters,
                format: outputFormat,
                use_cache: useCache,
            });

            if (response.success && response.data) {
                if (outputFormat === 'json') {
                    // JSON format returns the full report data
                    setGeneratedReport(response.data);
                    toast.success('Report generated successfully!');
                } else {
                    // PDF/Excel format returns a report_id for export
                    if (response.data.report_id) {
                        setReportId(response.data.report_id);
                        toast.success(`Report ready for ${outputFormat.toUpperCase()} export!`);
                    }
                }
                loadAuditLogs(); // Refresh audit logs
            }
        } catch (error: any) {
            console.error('Failed to generate report:', error);
            toast.error(error.message || 'Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPdf = () => {
        if (reportId) {
            window.open(getReportPdfUrl(reportId), '_blank');
        }
    };

    const handleExportExcel = () => {
        if (reportId) {
            window.open(getReportExcelUrl(reportId), '_blank');
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <Check className="w-3 h-3" />
                        Success
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Pending
                    </span>
                );
            default:
                return null;
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <OrganizationLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {activeView !== 'dashboard' && (
                            <button
                                onClick={() => {
                                    setActiveView('dashboard');
                                    setSelectedCategory(null);
                                    setSelectedReport(null);
                                    setGeneratedReport(null);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FileBarChart className="h-7 w-7 text-emerald-600" />
                                {activeView === 'dashboard' && 'Reports'}
                                {activeView === 'generate' && selectedReport?.name}
                                {activeView === 'history' && 'Report History'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {activeView === 'dashboard' && 'Generate comprehensive reports across all modules'}
                                {activeView === 'generate' && selectedReport?.description}
                                {activeView === 'history' && 'View previously generated reports'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveView('history')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'history'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <History className="h-4 w-4" />
                            History
                        </button>
                    </div>
                </div>

                {/* Dashboard View */}
                {activeView === 'dashboard' && (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-100 rounded-lg">
                                        <FileBarChart className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Report Types</p>
                                        <p className="text-2xl font-bold text-gray-900">17</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Categories</p>
                                        <p className="text-2xl font-bold text-gray-900">5</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Download className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Export Formats</p>
                                        <p className="text-2xl font-bold text-gray-900">3</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <History className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Recent Reports</p>
                                        <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Categories */}
                        <div className="space-y-6">
                            {Object.entries(REPORT_CATEGORIES).map(([key, category]) => {
                                const IconComponent = categoryIcons[category.icon] || FileBarChart;
                                return (
                                    <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <IconComponent className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                                                    <p className="text-sm text-gray-500">{category.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                            {category.reports.map((report) => (
                                                <button
                                                    key={report.type}
                                                    onClick={() => handleSelectReport(report)}
                                                    className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left group"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                                        <FileText className="h-4 w-4 text-gray-600 group-hover:text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                                                            {report.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {report.description}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 flex-shrink-0 mt-1" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Generate Report View */}
                {activeView === 'generate' && selectedReport && (
                    <div className="space-y-6">
                        {/* Filters Section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Filter className="h-5 w-5 text-emerald-600" />
                                Report Filters
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.start_date || ''}
                                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.end_date || ''}
                                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Output Format
                                    </label>
                                    <select
                                        value={outputFormat}
                                        onChange={(e) => setOutputFormat(e.target.value as 'json' | 'pdf' | 'excel')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="json">JSON (View in Browser)</option>
                                        <option value="pdf">PDF (Download)</option>
                                        <option value="excel">Excel (Download)</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={isGenerating}
                                        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                Generate Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Additional Filters based on report type */}
                            {selectedReport.type.includes('technician') && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500 mb-2">Additional Filters (Optional)</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Technician ID
                                            </label>
                                            <input
                                                type="text"
                                                value={filters.technician || ''}
                                                onChange={(e) => setFilters({ ...filters, technician: e.target.value })}
                                                placeholder="Filter by technician..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedReport.type.includes('labor_cost') && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500 mb-2">Cost Calculation Settings</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hourly Rate ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={filters.hourly_rate || ''}
                                                onChange={(e) => setFilters({ ...filters, hourly_rate: parseFloat(e.target.value) })}
                                                placeholder="25.00"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Overtime Multiplier
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={filters.overtime_multiplier || ''}
                                                onChange={(e) => setFilters({ ...filters, overtime_multiplier: parseFloat(e.target.value) })}
                                                placeholder="1.5"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cache Toggle */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useCache}
                                        onChange={(e) => setUseCache(e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">Use cached data if available (faster)</span>
                                </label>
                            </div>
                        </div>

                        {/* Export Actions (for PDF/Excel) */}
                        {reportId && outputFormat !== 'json' && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Download className="h-5 w-5 text-emerald-600" />
                                    Export Report
                                </h2>
                                <div className="flex items-center gap-4">
                                    {outputFormat === 'pdf' && (
                                        <button
                                            onClick={handleExportPdf}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Download PDF
                                        </button>
                                    )}
                                    {outputFormat === 'excel' && (
                                        <button
                                            onClick={handleExportExcel}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Download Excel
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Report Results (for JSON) */}
                        {generatedReport && outputFormat === 'json' && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <FileBarChart className="h-5 w-5 text-emerald-600" />
                                                {generatedReport.report_name || selectedReport.name}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Generated at {formatDate(generatedReport.generated_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(generatedReport, null, 2));
                                                toast.success('Report data copied to clipboard!');
                                            }}
                                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Copy JSON
                                        </button>
                                    </div>
                                </div>

                                {/* Summary Section */}
                                {generatedReport.data?.summary && (
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Summary</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {Object.entries(generatedReport.data.summary).map(([key, value]) => (
                                                <div key={key} className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-xs text-gray-500 mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {typeof value === 'number'
                                                            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                                            : String(value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Data Table or Raw JSON */}
                                <div className="p-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Report Data</h3>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                                        {JSON.stringify(generatedReport.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!generatedReport && !reportId && !isGenerating && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                                <FileBarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Configure and Generate Report
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Set your filters above and click "Generate Report" to create your {selectedReport.name}.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* History View */}
                {activeView === 'history' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <History className="h-5 w-5 text-emerald-600" />
                                    Report Generation History
                                </h2>
                                <button
                                    onClick={loadAuditLogs}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {auditLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Report
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Format
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Generated At
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {auditLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{log.report_name}</p>
                                                        <p className="text-xs text-gray-500">{log.report_type}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {log.user_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 uppercase">
                                                        {log.format}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(log.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {log.execution_time ? `${log.execution_time.toFixed(2)}s` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(log.generated_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No report history found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </OrganizationLayout>
    );
}
