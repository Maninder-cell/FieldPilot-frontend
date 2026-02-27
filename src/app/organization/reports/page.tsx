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
    getReportDetail,
    ReportType,
    ReportAuditLog,
    ReportFilters,
    downloadReportPdf,
    downloadReportExcel,
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

    // Pagination state for history
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const [historyTotalCount, setHistoryTotalCount] = useState(0);
    const historyPageSize = 20;

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

    const loadAuditLogs = async (reportTypeFilter?: string, page: number = 1) => {
        try {
            const params: any = { 
                page_size: historyPageSize,
                page: page
            };
            if (reportTypeFilter) {
                params.report_type = reportTypeFilter;
            }
            const response = await getReportAuditLogs(params);
            if ('results' in response) {
                setAuditLogs(response.results);
                setHistoryTotalCount(response.count);
                setHistoryTotalPages(Math.ceil(response.count / historyPageSize));
                setHistoryPage(page);
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

    const handleExportPdf = async () => {
        if (reportId) {
            try {
                await downloadReportPdf(reportId);
                toast.success('PDF downloaded successfully!');
            } catch (error: any) {
                console.error('Failed to download PDF:', error);
                toast.error(error.message || 'Failed to download PDF');
            }
        }
    };

    const handleExportExcel = async () => {
        if (reportId) {
            try {
                await downloadReportExcel(reportId);
                toast.success('Excel downloaded successfully!');
            } catch (error: any) {
                console.error('Failed to download Excel:', error);
                toast.error(error.message || 'Failed to download Excel');
            }
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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
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
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <FileBarChart className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {activeView === 'dashboard' && 'Reports'}
                                        {activeView === 'generate' && selectedReport?.name}
                                        {activeView === 'history' && 'Report History'}
                                    </h1>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {activeView === 'dashboard' && 'Generate comprehensive reports across all modules'}
                                        {activeView === 'generate' && selectedReport?.description}
                                        {activeView === 'history' && 'View previously generated reports'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setActiveView('history');
                                    // Filter history by current report type if inside a report, reset to page 1
                                    if (activeView === 'generate' && selectedReport) {
                                        loadAuditLogs(selectedReport.type, 1);
                                    } else {
                                        loadAuditLogs(undefined, 1);
                                    }
                                }}
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
                </div>

                {/* Dashboard View */}
                {activeView === 'dashboard' && (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-100 rounded-lg">
                                        <FileBarChart className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Report Types</p>
                                        <p className="text-2xl font-bold text-gray-900">17</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Categories</p>
                                        <p className="text-2xl font-bold text-gray-900">5</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-100 rounded-lg">
                                        <Download className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Export Formats</p>
                                        <p className="text-2xl font-bold text-gray-900">3</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-100 rounded-lg">
                                        <History className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Recent Reports</p>
                                        <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Categories */}
                        <div className="space-y-5">
                            {Object.entries(REPORT_CATEGORIES).map(([key, category]) => {
                                const IconComponent = categoryIcons[category.icon] || FileBarChart;
                                return (
                                    <div key={key} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <IconComponent className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                                                    <p className="text-sm text-gray-600 mt-0.5">{category.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                                            {category.reports.map((report) => (
                                                <button
                                                    key={report.type}
                                                    onClick={() => handleSelectReport(report)}
                                                    className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                                        <FileText className="h-4 w-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                            {report.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {report.description}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 flex-shrink-0 mt-0.5 transition-colors" />
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
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <Filter className="h-4 w-4 text-emerald-600" />
                                </div>
                                Report Filters
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.start_date || ''}
                                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.end_date || ''}
                                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Output Format
                                    </label>
                                    <select
                                        value={outputFormat}
                                        onChange={(e) => setOutputFormat(e.target.value as 'json' | 'pdf' | 'excel')}
                                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                                    >
                                        <option value="json">JSON (View in Browser)</option>
                                        <option value="pdf">PDF (Download)</option>
                                        <option value="excel">Excel (Download)</option>
                                    </select>
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        &nbsp;
                                    </label>
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={isGenerating}
                                        className="w-full h-10 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                                        <Download className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    Export Report
                                </h2>
                                <div className="flex items-center gap-3">
                                    {outputFormat === 'pdf' && (
                                        <button
                                            onClick={handleExportPdf}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Download PDF
                                        </button>
                                    )}
                                    {outputFormat === 'excel' && (
                                        <button
                                            onClick={handleExportExcel}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
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
                                            {Object.entries(generatedReport.data.summary).map(([key, value]) => {
                                                // Skip nested objects in summary - they'll be shown in detail sections
                                                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                                    return null;
                                                }
                                                
                                                return (
                                                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {typeof value === 'number'
                                                                ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                                                : Array.isArray(value)
                                                                    ? (value.length === 0 ? 'N/A' : value.length)
                                                                    : (value === null ? 'N/A' : String(value))}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Data Table or Raw JSON */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700">Report Data</h3>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(generatedReport.data, null, 2));
                                                toast.success('Data copied to clipboard!');
                                            }}
                                            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                                        >
                                            <FileText className="h-3 w-3" />
                                            Copy Data
                                        </button>
                                    </div>

                                    {/* Render data as a table if it's an array */}
                                    {Array.isArray(generatedReport.data?.results) && generatedReport.data.results.length > 0 ? (
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                    <tr>
                                                        {Object.keys(generatedReport.data.results[0]).map((key) => (
                                                            <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                                {key.replace(/_/g, ' ')}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {generatedReport.data.results.map((row: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                            {Object.values(row).map((value: any, cellIdx: number) => (
                                                                <td key={cellIdx} className="px-4 py-3 text-sm text-gray-600">
                                                                    {typeof value === 'object' && value !== null
                                                                        ? JSON.stringify(value)
                                                                        : typeof value === 'number'
                                                                            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                                                            : String(value || '-')}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.tasks) && generatedReport.data.tasks.length > 0 ? (
                                        /* Task Detail Report - Special formatting */
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Task #</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Title</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Priority</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Equipment</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Facility</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Assigned To</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Work Hours</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Created</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {generatedReport.data.tasks.map((task: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {task.task_number}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                <div className="max-w-xs">
                                                                    <p className="font-medium">{task.title}</p>
                                                                    {task.description && (
                                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${task.status === 'closed' ? 'bg-green-100 text-green-700' :
                                                                    task.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {task.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {task.priority}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {task.equipment ? (
                                                                    <div>
                                                                        <p className="font-medium">{task.equipment.name}</p>
                                                                        <p className="text-xs text-gray-500">{task.equipment.number}</p>
                                                                    </div>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {task.facility?.name || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {task.assigned_technicians && task.assigned_technicians.length > 0 ? (
                                                                    <div className="space-y-1">
                                                                        {task.assigned_technicians.map((tech: any, techIdx: number) => (
                                                                            <div key={techIdx} className="text-xs">
                                                                                <p className="font-medium">{tech.name}</p>
                                                                                {tech.email && <p className="text-gray-500">{tech.email}</p>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">Unassigned</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {task.work_hours ? (
                                                                    <div className="text-xs">
                                                                        <p><span className="font-medium">Total:</span> {task.work_hours.total_hours.toFixed(2)}h</p>
                                                                        {task.work_hours.overtime_hours > 0 && (
                                                                            <p className="text-orange-600"><span className="font-medium">OT:</span> {task.work_hours.overtime_hours.toFixed(2)}h</p>
                                                                        )}
                                                                    </div>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                }) : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {generatedReport.data.total_count && (
                                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">
                                                        Showing <span className="font-medium">{generatedReport.data.tasks.length}</span> of{' '}
                                                        <span className="font-medium">{generatedReport.data.total_count}</span> tasks
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.overdue_tasks) && generatedReport.data.overdue_tasks.length > 0 ? (
                                        /* Overdue Tasks Report - Special formatting */
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Task #</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Title</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Priority</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Equipment</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Scheduled End</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Days Overdue</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Assigned To</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {generatedReport.data.overdue_tasks.map((task: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {task.task_number}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                <p className="font-medium">{task.title}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {task.priority}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize bg-yellow-100 text-yellow-700">
                                                                    {task.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {task.equipment ? (
                                                                    <div>
                                                                        <p className="font-medium">{task.equipment.name}</p>
                                                                        <p className="text-xs text-gray-500">{task.equipment.number}</p>
                                                                    </div>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {task.scheduled_end ? new Date(task.scheduled_end).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                }) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                                    {task.days_overdue} {task.days_overdue === 1 ? 'day' : 'days'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {task.assigned_technicians && task.assigned_technicians.length > 0 ? (
                                                                    <div className="space-y-1">
                                                                        {task.assigned_technicians.map((tech: any, techIdx: number) => (
                                                                            <p key={techIdx} className="text-xs font-medium">{tech.name}</p>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">Unassigned</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.equipment) && generatedReport.data.equipment.length > 0 ? (
                                        /* Equipment Detail Report - Special formatting */
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Equipment #</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Name</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Type</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Condition</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Location</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Customer</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Warranty</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Manufacturer</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {generatedReport.data.equipment.map((equip: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {equip.equipment_number}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                <div>
                                                                    <p className="font-medium">{equip.name}</p>
                                                                    {equip.model && (
                                                                        <p className="text-xs text-gray-500 mt-0.5">Model: {equip.model}</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700">
                                                                    {equip.type}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${equip.operational_status === 'operational' ? 'bg-green-100 text-green-700' :
                                                                    equip.operational_status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                                        equip.operational_status === 'out_of_service' ? 'bg-red-100 text-red-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {equip.operational_status?.replace(/_/g, ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${equip.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                                                                    equip.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                                                                        equip.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                                                                            equip.condition === 'poor' ? 'bg-orange-100 text-orange-700' :
                                                                                'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {equip.condition}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                <div className="text-xs">
                                                                    {equip.facility && <p className="font-medium">{equip.facility.name}</p>}
                                                                    {equip.building && <p className="text-gray-500">{equip.building.name}</p>}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {equip.customer?.name || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {equip.is_under_warranty ? (
                                                                    <div className="text-xs">
                                                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                            Active
                                                                        </span>
                                                                        {equip.warranty_expiration && (
                                                                            <p className="text-gray-500 mt-1">
                                                                                Until {new Date(equip.warranty_expiration).toLocaleDateString('en-US', {
                                                                                    month: 'short',
                                                                                    year: 'numeric'
                                                                                })}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                        Expired
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                <div className="text-xs">
                                                                    {equip.manufacturer && <p className="font-medium">{equip.manufacturer}</p>}
                                                                    {equip.serial_number && <p className="text-gray-500">SN: {equip.serial_number}</p>}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {generatedReport.data.total_count && (
                                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">
                                                        Showing <span className="font-medium">{generatedReport.data.equipment.length}</span> of{' '}
                                                        <span className="font-medium">{generatedReport.data.total_count}</span> equipment
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.equipment_history) && generatedReport.data.equipment_history.length > 0 ? (
                                        /* Equipment Maintenance History Report - Card-based layout */
                                        <div className="space-y-4">
                                            {generatedReport.data.equipment_history.map((equip: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    {/* Equipment Header */}
                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <h4 className="text-lg font-semibold text-gray-900">{equip.name}</h4>
                                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                                                                        {equip.type}
                                                                    </span>
                                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${equip.operational_status === 'operational' ? 'bg-green-100 text-green-700' :
                                                                        equip.operational_status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'
                                                                        }`}>
                                                                        {equip.operational_status?.replace(/_/g, ' ')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{equip.equipment_number}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Maintenance Summary Stats */}
                                                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                        <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Maintenance Summary</h5>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-1">Total Tasks</p>
                                                                <p className="text-2xl font-bold text-gray-900">{equip.maintenance_summary?.total_tasks || 0}</p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-1">Completed</p>
                                                                <p className="text-2xl font-bold text-green-600">{equip.maintenance_summary?.completed_tasks || 0}</p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-1">Last Maintenance</p>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {equip.maintenance_summary?.last_maintenance_date
                                                                        ? new Date(equip.maintenance_summary.last_maintenance_date).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric'
                                                                        })
                                                                        : 'Never'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Recent Tasks */}
                                                    <div className="px-6 py-4">
                                                        <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Recent Tasks</h5>
                                                        {equip.recent_tasks && equip.recent_tasks.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {equip.recent_tasks.map((task: any, taskIdx: number) => (
                                                                    <div key={taskIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-mono text-gray-500">{task.task_number}</span>
                                                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${task.status === 'closed' ? 'bg-green-100 text-green-700' :
                                                                                    task.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                                                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                                            'bg-gray-100 text-gray-700'
                                                                                    }`}>
                                                                                    {task.status}
                                                                                </span>
                                                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                                            'bg-gray-100 text-gray-700'
                                                                                    }`}>
                                                                                    {task.priority}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm font-medium text-gray-900 mt-1">{task.title}</p>
                                                                        </div>
                                                                        <div className="text-right ml-4">
                                                                            <p className="text-xs text-gray-500">Created</p>
                                                                            <p className="text-xs font-medium text-gray-700">
                                                                                {new Date(task.created_at).toLocaleDateString('en-US', {
                                                                                    month: 'short',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                                                                No recent maintenance tasks
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {generatedReport.data.total_equipment && (
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                                                    <p className="text-sm text-gray-600">
                                                        Showing <span className="font-medium">{generatedReport.data.equipment_history.length}</span> of{' '}
                                                        <span className="font-medium">{generatedReport.data.total_equipment}</span> equipment
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.utilization) && generatedReport.data.utilization.length > 0 ? (
                                        /* Equipment Utilization Report - Table with metrics */
                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Equipment</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Type</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Facility</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Tasks</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Completed</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Completion Rate</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {generatedReport.data.utilization.map((equip: any, idx: number) => {
                                                        const completionRate = equip.task_count > 0
                                                            ? Math.round((equip.completed_tasks / equip.task_count) * 100)
                                                            : 0;

                                                        return (
                                                            <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                                <td className="px-4 py-3 text-sm">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{equip.name}</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">{equip.equipment_number}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700">
                                                                        {equip.type}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${equip.operational_status === 'operational' ? 'bg-green-100 text-green-700' :
                                                                        equip.operational_status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                                            equip.operational_status === 'out_of_service' ? 'bg-red-100 text-red-700' :
                                                                                'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {equip.operational_status?.replace(/_/g, ' ')}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {equip.facility?.name || '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                                                                        {equip.task_count}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold">
                                                                        {equip.completed_tasks}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex-1">
                                                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                                <div
                                                                                    className={`h-2.5 rounded-full ${completionRate >= 80 ? 'bg-green-500' :
                                                                                        completionRate >= 50 ? 'bg-yellow-500' :
                                                                                            completionRate > 0 ? 'bg-orange-500' :
                                                                                                'bg-gray-400'
                                                                                        }`}
                                                                                    style={{ width: `${completionRate}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-xs font-semibold text-gray-700 min-w-[3rem] text-right">
                                                                            {completionRate}%
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            {generatedReport.data.total_equipment && (
                                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">
                                                        Showing <span className="font-medium">{generatedReport.data.utilization.length}</span> of{' '}
                                                        <span className="font-medium">{generatedReport.data.total_equipment}</span> equipment
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (generatedReport.data?.by_technician && Array.isArray(generatedReport.data.by_technician)) ? (
                                        /* Labor Cost Report - Multiple breakdown tables */
                                        <div className="space-y-6">
                                            {/* By Technician */}
                                            {generatedReport.data.by_technician && generatedReport.data.by_technician.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
                                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Labor Cost by Technician</h4>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Technician</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Normal Hours</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Overtime Hours</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Normal Cost</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Overtime Cost</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Cost</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                {generatedReport.data.by_technician.map((item: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.technician?.name || '-'}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.normal_hours?.toFixed(2) || '0.00'}h</td>
                                                                        <td className="px-4 py-3 text-sm text-orange-600 font-medium">{item.overtime_hours?.toFixed(2) || '0.00'}h</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">${item.normal_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                                                                        <td className="px-4 py-3 text-sm text-orange-600 font-medium">${item.overtime_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                                                                        <td className="px-4 py-3 text-sm font-bold text-green-700">${item.total_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* By Task */}
                                            {generatedReport.data.by_task && generatedReport.data.by_task.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Labor Cost by Task</h4>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Task</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Hours</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Cost</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                {generatedReport.data.by_task.map((item: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                                        <td className="px-4 py-3 text-sm">
                                                                            <div>
                                                                                <p className="font-medium text-gray-900">{item.task?.title || '-'}</p>
                                                                                <p className="text-xs text-gray-500 mt-0.5">{item.task?.task_number || '-'}</p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.total_hours?.toFixed(2) || '0.00'}h</td>
                                                                        <td className="px-4 py-3 text-sm font-bold text-green-700">${item.total_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* By Customer */}
                                            {generatedReport.data.by_customer && generatedReport.data.by_customer.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
                                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Labor Cost by Customer</h4>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Customer</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Hours</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Cost</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                {generatedReport.data.by_customer.map((item: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.customer?.name || '-'}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.total_hours?.toFixed(2) || '0.00'}h</td>
                                                                        <td className="px-4 py-3 text-sm font-bold text-green-700">${item.total_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (generatedReport.data?.material_summary && Array.isArray(generatedReport.data.material_summary)) ? (
                                        /* Materials Usage Report - Multiple breakdown tables */
                                        <div className="space-y-6">
                                            {/* Material Summary */}
                                            {generatedReport.data.material_summary && generatedReport.data.material_summary.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-gray-200">
                                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Material Summary</h4>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Material Name</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Unit</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Needed</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Total Received</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Difference</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                {generatedReport.data.material_summary.map((item: any, idx: number) => {
                                                                    const difference = item.difference || (item.total_received - item.total_needed);
                                                                    const isShortage = difference < 0;
                                                                    const isSurplus = difference > 0;

                                                                    return (
                                                                        <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.material_name}</td>
                                                                            <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900">{item.total_needed?.toFixed(2) || '0.00'}</td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900">{item.total_received?.toFixed(2) || '0.00'}</td>
                                                                            <td className={`px-4 py-3 text-sm font-medium ${isShortage ? 'text-red-600' : isSurplus ? 'text-green-600' : 'text-gray-600'
                                                                                }`}>
                                                                                {difference > 0 ? '+' : ''}{difference?.toFixed(2) || '0.00'}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm">
                                                                                {isShortage ? (
                                                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                                        Shortage
                                                                                    </span>
                                                                                ) : isSurplus ? (
                                                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                                        Surplus
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                                        Balanced
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* By Task */}
                                            {generatedReport.data.by_task && generatedReport.data.by_task.length > 0 && (
                                                <div className="space-y-4">
                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-gray-200">
                                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Materials by Task</h4>
                                                    </div>
                                                    {generatedReport.data.by_task.map((taskItem: any, idx: number) => (
                                                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{taskItem.task?.title || 'Unknown Task'}</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">{taskItem.task?.task_number || '-'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                                                {/* Materials Needed */}
                                                                <div>
                                                                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Materials Needed</h5>
                                                                    {taskItem.materials_needed && taskItem.materials_needed.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            {taskItem.materials_needed.map((material: any, mIdx: number) => (
                                                                                <div key={mIdx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <p className="text-sm font-medium text-gray-900">{material.material_name}</p>
                                                                                        <span className="text-sm font-bold text-red-700">
                                                                                            {material.quantity} {material.unit}
                                                                                        </span>
                                                                                    </div>
                                                                                    {material.logged_by && (
                                                                                        <p className="text-xs text-gray-500 mt-1">Logged by: {material.logged_by}</p>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500 italic">No materials needed</p>
                                                                    )}
                                                                </div>

                                                                {/* Materials Received */}
                                                                <div>
                                                                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Materials Received</h5>
                                                                    {taskItem.materials_received && taskItem.materials_received.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            {taskItem.materials_received.map((material: any, mIdx: number) => (
                                                                                <div key={mIdx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <p className="text-sm font-medium text-gray-900">{material.material_name}</p>
                                                                                        <span className="text-sm font-bold text-green-700">
                                                                                            {material.quantity} {material.unit}
                                                                                        </span>
                                                                                    </div>
                                                                                    {material.logged_by && (
                                                                                        <p className="text-xs text-gray-500 mt-1">Logged by: {material.logged_by}</p>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500 italic">No materials received</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.billing_by_customer) && generatedReport.data.billing_by_customer.length > 0 ? (
                                        /* Customer Billing Report - Card-based layout */
                                        <div className="space-y-6">
                                            {generatedReport.data.billing_by_customer.map((billing: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    {/* Customer Header */}
                                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-semibold text-gray-900">{billing.customer?.company_name}</h4>
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">Contact:</span> {billing.customer?.contact_person}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">Email:</span> {billing.customer?.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Billable</p>
                                                                <p className="text-3xl font-bold text-purple-700">
                                                                    ${billing.total_billable?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Billing Details */}
                                                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {/* Labor Costs */}
                                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Labor</h5>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-600">Normal Hours:</span>
                                                                        <span className="font-medium text-gray-900">{billing.labor?.normal_hours?.toFixed(2) || '0.00'}h</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-600">Overtime Hours:</span>
                                                                        <span className="font-medium text-orange-600">{billing.labor?.overtime_hours?.toFixed(2) || '0.00'}h</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                                                        <span className="font-semibold text-gray-700">Total Hours:</span>
                                                                        <span className="font-bold text-gray-900">{billing.labor?.total_hours?.toFixed(2) || '0.00'}h</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                                                        <span className="font-semibold text-gray-700">Labor Cost:</span>
                                                                        <span className="font-bold text-green-700">${billing.labor?.labor_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Materials */}
                                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Materials</h5>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-600">Items Received:</span>
                                                                        <span className="font-medium text-gray-900">{billing.materials?.materials_received_count || 0}</span>
                                                                    </div>
                                                                    {billing.materials?.note && (
                                                                        <p className="text-xs text-gray-500 italic mt-2">{billing.materials.note}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Task Summary */}
                                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Tasks</h5>
                                                                <div className="flex items-center justify-center">
                                                                    <div className="text-center">
                                                                        <p className="text-4xl font-bold text-blue-700">{billing.total_tasks || 0}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Task Breakdown */}
                                                    {billing.task_breakdown && billing.task_breakdown.length > 0 && (
                                                        <div className="px-6 py-4">
                                                            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Task Breakdown</h5>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full">
                                                                    <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Task #</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Title</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Status</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Work Hours</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-200">
                                                                        {billing.task_breakdown.map((task: any, taskIdx: number) => (
                                                                            <tr key={taskIdx} className="hover:bg-green-50 transition-colors">
                                                                                <td className="px-4 py-2 text-sm font-mono text-gray-600">{task.task_number}</td>
                                                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{task.title}</td>
                                                                                <td className="px-4 py-2 text-sm">
                                                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${task.status === 'closed' ? 'bg-green-100 text-green-700' :
                                                                                        task.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                                                            task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                                                'bg-gray-100 text-gray-700'
                                                                                        }`}>
                                                                                        {task.status}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-2 text-sm text-gray-900">{task.work_hours?.toFixed(2) || '0.00'}h</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.worksheets) && generatedReport.data.worksheets.length > 0 ? (
                                        /* Technician Worksheet Report - Card-based layout */
                                        <div className="space-y-6">
                                            {generatedReport.data.worksheets.map((worksheet: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    {/* Technician Header */}
                                                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-semibold text-gray-900">{worksheet.technician?.name}</h4>
                                                                <p className="text-sm text-gray-600 mt-1">Technician ID: {worksheet.technician?.id}</p>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-4 text-right">
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Hours</p>
                                                                    <p className="text-xl font-bold text-blue-700">{worksheet.totals?.total_work_hours?.toFixed(2) || '0.00'}h</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Normal</p>
                                                                    <p className="text-xl font-bold text-gray-700">{worksheet.totals?.normal_hours?.toFixed(2) || '0.00'}h</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Overtime</p>
                                                                    <p className="text-xl font-bold text-orange-600">{worksheet.totals?.overtime_hours?.toFixed(2) || '0.00'}h</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Time Logs Table */}
                                                    {worksheet.time_logs && worksheet.time_logs.length > 0 && (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full">
                                                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                                    <tr>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Task</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Equipment</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Travel Start</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Arrived</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Departed</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Work Hours</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                                    {worksheet.time_logs.map((log: any, logIdx: number) => (
                                                                        <tr key={logIdx} className="hover:bg-green-50 transition-colors">
                                                                            <td className="px-4 py-3 text-sm">
                                                                                <div>
                                                                                    <p className="font-medium text-gray-900">{log.task_title}</p>
                                                                                    <p className="text-xs text-gray-500 font-mono">{log.task_number}</p>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm">
                                                                                <div>
                                                                                    <p className="font-medium text-gray-900">{log.equipment?.name || '-'}</p>
                                                                                    <p className="text-xs text-gray-500 font-mono">{log.equipment?.number || '-'}</p>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                                                {log.travel_started_at ? new Date(log.travel_started_at).toLocaleString('en-US', {
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                }) : '-'}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                                                {log.arrived_at ? new Date(log.arrived_at).toLocaleString('en-US', {
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                }) : '-'}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                                                {log.departed_at ? new Date(log.departed_at).toLocaleString('en-US', {
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                }) : '-'}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm">
                                                                                <div className="space-y-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-gray-600">Total:</span>
                                                                                        <span className="font-bold text-blue-700">{log.total_work_hours?.toFixed(2) || '0.00'}h</span>
                                                                                    </div>
                                                                                    {log.overtime_hours > 0 && (
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-xs text-gray-500">OT:</span>
                                                                                            <span className="text-xs font-medium text-orange-600">{log.overtime_hours?.toFixed(2)}h</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm">
                                                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${log.equipment_status_at_departure === 'functional' ? 'bg-green-100 text-green-700' :
                                                                                    log.equipment_status_at_departure === 'needs_repair' ? 'bg-red-100 text-red-700' :
                                                                                        log.equipment_status_at_departure === 'under_maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                                                            'bg-gray-100 text-gray-700'
                                                                                    }`}>
                                                                                    {log.equipment_status_at_departure?.replace(/_/g, ' ') || 'Unknown'}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}

                                                    {/* Summary Footer */}
                                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Total Tasks: <span className="font-semibold text-gray-900">{worksheet.totals?.total_tasks || 0}</span></span>
                                                            <span className="text-gray-600">
                                                                Total Work Hours: <span className="font-bold text-blue-700">{worksheet.totals?.total_work_hours?.toFixed(2) || '0.00'}h</span>
                                                                {worksheet.totals?.overtime_hours > 0 && (
                                                                    <span className="ml-2 text-orange-600">(OT: {worksheet.totals.overtime_hours.toFixed(2)}h)</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.performance) && generatedReport.data.performance.length > 0 ? (
                                        /* Technician Performance Report - Card-based layout */
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {generatedReport.data.performance.map((perf: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                                                        <h4 className="font-semibold text-gray-900">{perf.technician?.name}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">{perf.technician?.email}</p>
                                                    </div>
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Completed Tasks</span>
                                                            <span className="text-lg font-bold text-blue-700">{perf.completed_tasks}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Total Work Hours</span>
                                                            <span className="text-lg font-bold text-green-700">{perf.total_work_hours?.toFixed(2)}h</span>
                                                        </div>
                                                        {perf.avg_task_completion_time_hours !== null && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600">Avg Completion Time</span>
                                                                <span className="text-sm font-medium text-gray-900">{perf.avg_task_completion_time_hours?.toFixed(2)}h</span>
                                                            </div>
                                                        )}
                                                        {perf.customer_rating?.average !== null && (
                                                            <div className="pt-2 border-t border-gray-200">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600">Customer Rating</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-lg font-bold text-yellow-600">⭐ {perf.customer_rating.average}</span>
                                                                        <span className="text-xs text-gray-500">({perf.customer_rating.total_ratings})</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.productivity) && generatedReport.data.productivity.length > 0 ? (
                                        /* Technician Productivity Report - Card-based layout */
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {generatedReport.data.productivity.map((prod: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 border-b border-gray-200">
                                                        <h4 className="font-semibold text-gray-900">{prod.technician?.name}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">Productivity Metrics</p>
                                                    </div>
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Completed Tasks</span>
                                                            <span className="text-lg font-bold text-blue-700">{prod.completed_tasks}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Total Work Hours</span>
                                                            <span className="text-lg font-bold text-green-700">{prod.total_work_hours?.toFixed(2)}h</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-200 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600">Tasks per Day</span>
                                                                <span className="text-sm font-bold text-purple-700">{prod.tasks_per_day?.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600">Hours per Task</span>
                                                                <span className="text-sm font-bold text-orange-600">{prod.hours_per_task?.toFixed(2)}h</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-500">Date Range</span>
                                                                <span className="text-xs text-gray-600">{prod.date_range_days} days</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.teams) && generatedReport.data.teams.length > 0 ? (
                                        /* Team Performance Report - Card-based layout */
                                        <div className="space-y-6">
                                            {generatedReport.data.teams.map((team: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    {/* Team Header */}
                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-semibold text-gray-900">{team.team?.name}</h4>
                                                                <p className="text-sm text-gray-600 mt-1">{team.total_members} Team Members</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Completion Rate</p>
                                                                <p className="text-3xl font-bold text-blue-700">{team.completion_rate?.toFixed(1)}%</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Team Metrics */}
                                                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Tasks</p>
                                                                <p className="text-2xl font-bold text-gray-900">{team.total_tasks}</p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Completed Tasks</p>
                                                                <p className="text-2xl font-bold text-green-700">{team.completed_tasks}</p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Work Hours</p>
                                                                <p className="text-2xl font-bold text-blue-700">{team.total_work_hours?.toFixed(2)}h</p>
                                                            </div>
                                                        </div>

                                                        {/* Completion Progress Bar */}
                                                        <div className="mt-4">
                                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                                <span>Task Completion Progress</span>
                                                                <span>{team.completed_tasks} / {team.total_tasks}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                                    style={{ width: `${Math.min(team.completion_rate || 0, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Member Contributions */}
                                                    {team.member_contributions && team.member_contributions.length > 0 && (
                                                        <div className="px-6 py-4">
                                                            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Member Contributions</h5>
                                                            <div className="space-y-3">
                                                                {team.member_contributions.map((member: any, memberIdx: number) => (
                                                                    <div key={memberIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-gray-900">{member.technician?.name}</p>
                                                                            <div className="flex items-center gap-4 mt-1">
                                                                                <span className="text-xs text-gray-600">
                                                                                    Tasks: <span className="font-semibold text-blue-700">{member.tasks_completed}</span>
                                                                                </span>
                                                                                <span className="text-xs text-gray-600">
                                                                                    Hours: <span className="font-semibold text-green-700">{member.work_hours?.toFixed(2)}h</span>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {/* Individual Progress Indicator */}
                                                                        <div className="ml-4">
                                                                            {member.tasks_completed > 0 ? (
                                                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                                    Active
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                                    No Tasks
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.overtime_by_technician) && generatedReport.data.overtime_by_technician.length > 0 ? (
                                        /* Overtime Report - Card-based layout */
                                        <div className="space-y-6">
                                            {generatedReport.data.overtime_by_technician.map((overtime: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    {/* Technician Header */}
                                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-semibold text-gray-900">{overtime.technician?.name}</h4>
                                                                <p className="text-sm text-gray-600 mt-1">{overtime.technician?.email}</p>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-right">
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total OT Hours</p>
                                                                    <p className="text-2xl font-bold text-orange-600">{overtime.total_overtime_hours?.toFixed(2)}h</p>
                                                                </div>
                                                                {overtime.total_overtime_cost !== null && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total OT Cost</p>
                                                                        <p className="text-2xl font-bold text-red-600">${overtime.total_overtime_cost?.toFixed(2)}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Overtime Logs Table */}
                                                    {overtime.overtime_logs && overtime.overtime_logs.length > 0 && (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full">
                                                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                                    <tr>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Date</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Task Number</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Overtime Hours</th>
                                                                        {overtime.overtime_logs[0]?.overtime_cost !== null && (
                                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">Overtime Cost</th>
                                                                        )}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                                    {overtime.overtime_logs.map((log: any, logIdx: number) => (
                                                                        <tr key={logIdx} className="hover:bg-green-50 transition-colors">
                                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                                {new Date(log.date).toLocaleDateString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm font-mono text-gray-600">{log.task_number}</td>
                                                                            <td className="px-4 py-3 text-sm">
                                                                                <span className="font-bold text-orange-600">{log.overtime_hours?.toFixed(2)}h</span>
                                                                            </td>
                                                                            {log.overtime_cost !== null && (
                                                                                <td className="px-4 py-3 text-sm">
                                                                                    <span className="font-bold text-red-600">${log.overtime_cost?.toFixed(2)}</span>
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}

                                                    {/* Summary Footer */}
                                                    <div className="bg-orange-50 px-6 py-3 border-t border-orange-200">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-700">Total Overtime Entries: <span className="font-semibold text-gray-900">{overtime.overtime_logs?.length || 0}</span></span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-gray-700">
                                                                    Total Hours: <span className="font-bold text-orange-600">{overtime.total_overtime_hours?.toFixed(2)}h</span>
                                                                </span>
                                                                {overtime.total_overtime_cost !== null && (
                                                                    <span className="text-gray-700">
                                                                        Total Cost: <span className="font-bold text-red-600">${overtime.total_overtime_cost?.toFixed(2)}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(generatedReport.data?.requests) && generatedReport.data.requests.length > 0 ? (
                                        /* Service Request Detail Report - Expandable card layout */
                                        <div className="space-y-4">
                                            {generatedReport.data.requests.map((request: any, idx: number) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    {/* Request Header */}
                                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <h4 className="text-lg font-semibold text-gray-900">{request.title}</h4>
                                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${request.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                            request.status === 'accepted' || request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                                request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                                    request.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                                                                                        'bg-yellow-100 text-yellow-700'
                                                                        }`}>
                                                                        {request.status?.replace(/_/g, ' ')}
                                                                    </span>
                                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${request.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                                            request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                                    'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {request.priority}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Request Details Grid */}
                                                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {/* Customer Info */}
                                                            {request.customer && (
                                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                                                                    <p className="font-medium text-gray-900">{request.customer.name}</p>
                                                                    <p className="text-xs text-gray-600">{request.customer.email}</p>
                                                                    {request.customer.company && (
                                                                        <p className="text-xs text-gray-600 mt-1">{request.customer.company}</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Equipment Info */}
                                                            {request.equipment && (
                                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Equipment</p>
                                                                    <p className="font-medium text-gray-900">{request.equipment.name}</p>
                                                                    <p className="text-xs text-gray-600 font-mono">{request.equipment.number}</p>
                                                                    {request.facility && (
                                                                        <p className="text-xs text-gray-600 mt-1">📍 {request.facility.name}</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Timeline Info */}
                                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Timeline</p>
                                                                {request.response_time_hours !== null && (
                                                                    <p className="text-xs text-gray-600">Response: <span className="font-semibold">{request.response_time_hours}h</span></p>
                                                                )}
                                                                {request.resolution_time_hours !== null && (
                                                                    <p className="text-xs text-gray-600">Resolution: <span className="font-semibold">{request.resolution_time_hours}h</span></p>
                                                                )}
                                                                {request.customer_rating && (
                                                                    <p className="text-xs text-gray-600 mt-1">Rating: <span className="font-semibold text-yellow-600">⭐ {request.customer_rating}</span></p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Converted Task */}
                                                        {request.converted_task && (
                                                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                                <p className="text-xs text-blue-700 font-semibold mb-1">✓ Converted to Task</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-mono text-blue-900">{request.converted_task.task_number}</span>
                                                                    <span className="text-sm text-blue-800">{request.converted_task.title}</span>
                                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${request.converted_task.status === 'closed' ? 'bg-green-100 text-green-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                        {request.converted_task.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Timeline */}
                                                    {request.actions && request.actions.length > 0 && (
                                                        <div className="px-6 py-4">
                                                            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Action Timeline</h5>
                                                            <div className="space-y-2">
                                                                {request.actions.map((action: any, actionIdx: number) => (
                                                                    <div key={actionIdx} className="flex items-start gap-3 text-sm">
                                                                        <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-purple-500"></div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${action.action_type === 'created' ? 'bg-gray-100 text-gray-700' :
                                                                                        action.action_type === 'accepted' || action.action_type === 'converted' ? 'bg-green-100 text-green-700' :
                                                                                            action.action_type === 'rejected' || action.action_type === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                                                'bg-blue-100 text-blue-700'
                                                                                    }`}>
                                                                                    {action.action_type?.replace(/_/g, ' ')}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {new Date(action.created_at).toLocaleString('en-US', {
                                                                                        month: 'short',
                                                                                        day: 'numeric',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit'
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-gray-700 mt-1">{action.description}</p>
                                                                            {action.performed_by && (
                                                                                <p className="text-xs text-gray-500 mt-0.5">by {action.performed_by}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Show structured tables for object-based data */
                                        <div className="space-y-4">
                                            {Object.entries(generatedReport.data || {}).map(([key, value]) => {
                                                if (key === 'summary') return null; // Already shown above

                                                // Special handling for customer_satisfaction
                                                if (key === 'customer_satisfaction' && typeof value === 'object' && value !== null) {
                                                    const satisfaction = value as any;
                                                    return (
                                                        <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-purple-200">
                                                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                                    Customer Satisfaction
                                                                </h4>
                                                            </div>
                                                            <div className="p-4 space-y-4">
                                                                {/* Summary Stats */}
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                                        <p className="text-xs text-gray-500 mb-1">Average Rating</p>
                                                                        <p className="text-2xl font-bold text-gray-900">
                                                                            {satisfaction.avg_rating ? `${satisfaction.avg_rating} / 5.0` : 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                                        <p className="text-xs text-gray-500 mb-1">Total Feedback</p>
                                                                        <p className="text-2xl font-bold text-gray-900">
                                                                            {satisfaction.total_feedback || 0}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Rating Distribution */}
                                                                {satisfaction.rating_distribution && Object.keys(satisfaction.rating_distribution).length > 0 && (
                                                                    <div>
                                                                        <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                                                            Rating Distribution
                                                                        </h5>
                                                                        <div className="overflow-x-auto">
                                                                            <table className="w-full">
                                                                                <thead className="bg-gray-50">
                                                                                    <tr>
                                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                                                                                            Rating
                                                                                        </th>
                                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                                                                                            Count
                                                                                        </th>
                                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">
                                                                                            Percentage
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                                                    {Object.entries(satisfaction.rating_distribution).map(([rating, count]) => (
                                                                                        <tr key={rating} className="hover:bg-green-50 transition-colors">
                                                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                                                {rating} ⭐
                                                                                            </td>
                                                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                                                {count as number}
                                                                                            </td>
                                                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                                                {satisfaction.total_feedback > 0
                                                                                                    ? `${((count as number / satisfaction.total_feedback) * 100).toFixed(1)}%`
                                                                                                    : '0%'}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Check if value is a simple object (key-value pairs)
                                                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                                    const entries = Object.entries(value);
                                                    if (entries.length > 0) {
                                                        return (
                                                            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                                        {key.replace(/_/g, ' ')}
                                                                    </h4>
                                                                </div>
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                                                    {key.includes('status') ? 'Status' :
                                                                                        key.includes('priority') ? 'Priority' :
                                                                                            key.includes('type') ? 'Type' : 'Category'}
                                                                                </th>
                                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                                                    Count
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                                            {entries.map(([itemKey, itemValue]) => (
                                                                                <tr key={itemKey} className="hover:bg-green-50 transition-colors">
                                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                                                                                        {String(itemKey).replace(/_/g, ' ')}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                                                        {typeof itemValue === 'number'
                                                                                            ? itemValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                                                                            : String(itemValue || '-')}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        // Empty object - show no data message
                                                        return (
                                                            <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                    {key.replace(/_/g, ' ')}
                                                                </p>
                                                                <p className="text-sm text-gray-500 italic">No data available</p>
                                                            </div>
                                                        );
                                                    }
                                                }

                                                // For arrays - check if empty
                                                if (Array.isArray(value)) {
                                                    if (value.length === 0) {
                                                        return (
                                                            <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                    {key.replace(/_/g, ' ')}
                                                                </p>
                                                                <p className="text-sm text-gray-500 italic">No data available</p>
                                                            </div>
                                                        );
                                                    }
                                                    // Non-empty array - show as JSON
                                                    return (
                                                        <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                {key.replace(/_/g, ' ')}
                                                            </p>
                                                            <pre className="bg-white p-3 rounded border border-gray-200 text-xs overflow-x-auto">
                                                                {JSON.stringify(value, null, 2)}
                                                            </pre>
                                                        </div>
                                                    );
                                                }

                                                // For other values
                                                return (
                                                    <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                            {key.replace(/_/g, ' ')}
                                                        </p>
                                                        <div className="text-sm text-gray-900">
                                                            <p className="font-medium">
                                                                {typeof value === 'number'
                                                                    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                                                    : String(value || '-')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!generatedReport && !reportId && !isGenerating && (
                            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 shadow-sm p-12 text-center">
                                <div className="inline-flex p-3 bg-emerald-100 rounded-lg mb-4">
                                    <FileBarChart className="h-12 w-12 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Configure and Generate Report
                                </h3>
                                <p className="text-sm text-gray-600 max-w-md mx-auto">
                                    Set your filters above and click "Generate Report" to create your {selectedReport.name}.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* History View */}
                {activeView === 'history' && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                                        <History className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    Report Generation History
                                </h2>
                                <button
                                    onClick={() => {
                                        // Maintain current filter but reset to page 1
                                        loadAuditLogs(selectedReport?.type, 1);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </button>
                            </div>
                            
                            {/* Filter indicator */}
                            {selectedReport && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Filtered by:</span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-medium">
                                        {selectedReport.name}
                                        <button
                                            onClick={() => {
                                                setSelectedReport(null);
                                                loadAuditLogs(undefined, 1);
                                            }}
                                            className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                                        >
                                            ×
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>

                        {auditLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                Report
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                Format
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                Generated At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider font-semibold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {auditLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-green-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{log.report_name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{log.report_type}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {log.user_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 uppercase">
                                                        {log.format}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(log.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {log.execution_time ? `${Number(log.execution_time).toFixed(2)}s` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(log.generated_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {log.status === 'success' && log.format === 'json' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const response = await getReportDetail(log.id);
                                                                    if (response.success && response.data) {
                                                                        setGeneratedReport(response.data);
                                                                        setSelectedReport({
                                                                            type: log.report_type,
                                                                            name: log.report_name,
                                                                            description: ''
                                                                        });
                                                                        setActiveView('generate');
                                                                        toast.success('Historical report loaded!');
                                                                    }
                                                                } catch (error: any) {
                                                                    toast.error(error.message || 'Failed to load report');
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <FileText className="h-3 w-3" />
                                                            View
                                                        </button>
                                                    )}
                                                    {log.status === 'success' && log.format === 'pdf' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await downloadReportPdf(log.id);
                                                                    toast.success('PDF downloaded!');
                                                                } catch (error: any) {
                                                                    if (error.message.includes('expired')) {
                                                                        toast.error('Report data expired. PDF exports are only available for 1 hour after generation.');
                                                                    } else {
                                                                        toast.error(error.message || 'Failed to download PDF');
                                                                    }
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            PDF
                                                        </button>
                                                    )}
                                                    {log.status === 'success' && log.format === 'excel' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await downloadReportExcel(log.id);
                                                                    toast.success('Excel downloaded!');
                                                                } catch (error: any) {
                                                                    if (error.message.includes('expired')) {
                                                                        toast.error('Report data expired. Excel exports are only available for 1 hour after generation.');
                                                                    } else {
                                                                        toast.error(error.message || 'Failed to download Excel');
                                                                    }
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            Excel
                                                        </button>
                                                    )}
                                                    {log.status === 'failed' && (
                                                        <span className="text-xs text-gray-400 italic">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="inline-flex p-3 bg-emerald-100 rounded-lg mb-3">
                                    <History className="h-10 w-10 text-emerald-600" />
                                </div>
                                <p className="text-gray-600 font-medium">No report history found</p>
                                <p className="text-sm text-gray-500 mt-1">Generated reports will appear here</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {auditLogs.length > 0 && historyTotalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing <span className="font-medium">{((historyPage - 1) * historyPageSize) + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(historyPage * historyPageSize, historyTotalCount)}</span> of{' '}
                                        <span className="font-medium">{historyTotalCount}</span> reports
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => loadAuditLogs(selectedReport?.type, historyPage - 1)}
                                            disabled={historyPage === 1}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                historyPage === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, historyTotalPages) }, (_, i) => {
                                                let pageNum;
                                                if (historyTotalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (historyPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (historyPage >= historyTotalPages - 2) {
                                                    pageNum = historyTotalPages - 4 + i;
                                                } else {
                                                    pageNum = historyPage - 2 + i;
                                                }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => loadAuditLogs(selectedReport?.type, pageNum)}
                                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                            historyPage === pageNum
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => loadAuditLogs(selectedReport?.type, historyPage + 1)}
                                            disabled={historyPage === historyTotalPages}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                historyPage === historyTotalPages
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </OrganizationLayout>
    );
}
