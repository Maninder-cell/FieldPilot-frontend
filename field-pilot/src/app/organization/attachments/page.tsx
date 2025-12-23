'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/organization/OrganizationLayout';
import {
    Paperclip,
    Upload,
    Search,
    Filter,
    MoreVertical,
    Download,
    Trash2,
    Eye,
    Share2,
    Link2,
    FileImage,
    FileVideo,
    FileAudio,
    FileText,
    File,
    X,
    Loader2,
    HardDrive,
    FolderOpen
} from 'lucide-react';
import {
    getFiles,
    uploadFile,
    deleteFile,
    getStorageStats,
    formatFileSize,
    UserFile,
    StorageStats,
    FileFilters
} from '@/lib/files-api';
import { getApiUrl } from '@/lib/api-utils';
import { getAccessToken } from '@/lib/token-utils';

// File type icon mapping
const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.startsWith('video/')) return FileVideo;
    if (fileType.startsWith('audio/')) return FileAudio;
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return FileText;
    return File;
};

// File type color mapping
const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'bg-purple-100 text-purple-600';
    if (fileType.startsWith('video/')) return 'bg-pink-100 text-pink-600';
    if (fileType.startsWith('audio/')) return 'bg-amber-100 text-amber-600';
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-600';
    if (fileType.includes('document') || fileType.includes('word')) return 'bg-blue-100 text-blue-600';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
};

export default function AttachmentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [files, setFiles] = useState<UserFile[]>([]);
    const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<UserFile | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<UserFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pagination, setPagination] = useState({
        count: 0,
        page: 1,
        pageSize: 20,
        hasNext: false,
        hasPrevious: false
    });

    // Fetch files
    const fetchFiles = useCallback(async () => {
        try {
            setIsLoading(true);

            const filters: FileFilters = {
                page: pagination.page,
                page_size: pagination.pageSize,
                search: searchQuery || undefined,
            };

            if (filterType === 'images') {
                filters.is_image = true;
            } else if (filterType === 'attached') {
                filters.is_attached = true;
            } else if (filterType === 'unattached') {
                filters.is_attached = false;
            }

            const response = await getFiles(filters);
            setFiles(response.results || []);
            setPagination(prev => ({
                ...prev,
                count: response.count,
                hasNext: !!response.next,
                hasPrevious: !!response.previous
            }));
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.pageSize, searchQuery, filterType]);

    // Fetch storage stats
    const fetchStorageStats = useCallback(async () => {
        try {
            const response = await getStorageStats();
            setStorageStats(response.data);
        } catch (error) {
            console.error('Failed to fetch storage stats:', error);
        }
    }, []);

    // Auth check
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchFiles();
            fetchStorageStats();
        }
    }, [user, fetchFiles, fetchStorageStats]);

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setIsUploading(true);
        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                await uploadFile(selectedFiles[i]);
            }
            await fetchFiles();
            await fetchStorageStats();
            setShowUploadModal(false);
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert(error instanceof Error ? error.message : 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    // Open delete confirmation modal
    const handleDeleteFile = (file: UserFile) => {
        setFileToDelete(file);
        setShowDeleteModal(true);
        setActiveDropdown(null);
    };

    // Confirm and execute file deletion
    const confirmDelete = async () => {
        if (!fileToDelete) return;

        try {
            setIsDeleting(true);
            await deleteFile(fileToDelete.id);
            await fetchFiles();
            await fetchStorageStats();
            setShowDeleteModal(false);
            setFileToDelete(null);
        } catch (error) {
            console.error('Failed to delete file:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setFileToDelete(null);
    };

    // Handle file download
    const handleDownloadFile = async (file: UserFile) => {
        try {
            const token = getAccessToken();
            const apiUrl = getApiUrl(true);

            // Convert the file URL to use the API proxy
            const fileUrl = getProxiedFileUrl(file.file);

            const response = await fetch(fileUrl, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setActiveDropdown(null);
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    // Helper to convert tenant subdomain URL to proper API URL
    const getProxiedFileUrl = (fileUrl: string): string => {
        // If URL contains tenant subdomain like "tenant-slug.localhost", 
        // convert it to use the main API with proper routing
        try {
            const url = new URL(fileUrl);
            // Replace tenant subdomain with regular localhost for local dev
            if (url.hostname.includes('.localhost')) {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                // Keep the path but use the base URL
                return `${baseUrl}${url.pathname}`;
            }
            return fileUrl;
        } catch {
            return fileUrl;
        }
    };

    // Handle file preview
    const handlePreviewFile = async (file: UserFile) => {
        setSelectedFile(file);
        setShowPreview(true);
        setActiveDropdown(null);
        setPreviewLoading(true);
        setPreviewUrl(null);

        try {
            const token = getAccessToken();
            const fileUrl = getProxiedFileUrl(file.file);

            const response = await fetch(fileUrl, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!response.ok) throw new Error('Failed to load preview');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setPreviewUrl(blobUrl);
        } catch (error) {
            console.error('Failed to load preview:', error);
            setPreviewUrl(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    // Cleanup preview URL when closing modal
    const handleClosePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setShowPreview(false);
        setSelectedFile(null);
        setPreviewUrl(null);
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
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Attachments</h1>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600">
                            Manage your files and attachments
                        </p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Files
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* Storage Stats */}
                {storageStats && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <HardDrive className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Storage Used</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {storageStats.usage_gb.toFixed(2)} GB
                                    </p>
                                </div>
                            </div>
                            {!storageStats.is_unlimited && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>{storageStats.percentage_used.toFixed(1)}% used</span>
                                        <span>{storageStats.limit_gb} GB limit</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${storageStats.percentage_used > 90 ? 'bg-red-500' :
                                                storageStats.percentage_used > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}
                                            style={{ width: `${Math.min(storageStats.percentage_used, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FolderOpen className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Files</p>
                                    <p className="text-lg font-semibold text-gray-900">{storageStats.file_count}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <HardDrive className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Remaining</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {storageStats.is_unlimited ? 'Unlimited' : `${storageStats.remaining_gb?.toFixed(2)} GB`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Paperclip className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Plan</p>
                                    <p className="text-lg font-semibold text-gray-900">{storageStats.subscription_plan}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="all">All Files</option>
                            <option value="images">Images Only</option>
                            <option value="attached">Attached</option>
                            <option value="unattached">Unattached</option>
                        </select>
                    </div>
                </div>

                {/* Files Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                        <p className="text-gray-500 mb-4">Upload your first file to get started</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Files
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {files.map((file) => {
                            const FileIcon = getFileTypeIcon(file.file_type);
                            const colorClass = getFileTypeColor(file.file_type);

                            return (
                                <div
                                    key={file.id}
                                    className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow group relative"
                                >
                                    {/* Preview Area */}
                                    <div
                                        className="aspect-video bg-gray-100 flex items-center justify-center cursor-pointer relative rounded-t-xl overflow-hidden"
                                        onClick={() => handlePreviewFile(file)}
                                    >
                                        {file.is_image ? (
                                            <img
                                                src={getProxiedFileUrl(file.file)}
                                                alt={file.filename}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to icon if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className={`p-4 rounded-full ${colorClass}`}>
                                                <FileIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Eye className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* File Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 className="font-medium text-gray-900 truncate" title={file.filename}>
                                                    {file.title || file.filename}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">{file.filename}</p>
                                                <p className="text-xs text-gray-400 mt-1">{formatFileSize(file.file_size)}</p>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === file.id ? null : file.id);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                                {activeDropdown === file.id && (
                                                    <>
                                                        {/* Backdrop to close dropdown */}
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setActiveDropdown(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]">
                                                            <button
                                                                onClick={() => handlePreviewFile(file)}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadFile(file)}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download
                                                            </button>
                                                            <div className="border-t border-gray-100 my-1" />
                                                            <button
                                                                onClick={() => handleDeleteFile(file)}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tags/Status */}
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {file.task && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                    Task attached
                                                </span>
                                            )}
                                            {file.is_public && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                    Public
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.count > pagination.pageSize && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.count)} of {pagination.count} files
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={!pagination.hasPrevious}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={!pagination.hasNext}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowUploadModal(false)}
                        />
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Upload Files</h2>
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
                                            <p className="text-gray-600 font-medium">Uploading...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-emerald-100 p-4 rounded-full w-fit mx-auto mb-4">
                                                <Upload className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <p className="text-gray-700 font-medium mb-2">Drag and drop files here</p>
                                            <p className="text-gray-500 text-sm mb-4">or</p>
                                            <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer font-medium shadow-lg shadow-emerald-500/30">
                                                <Upload className="w-4 h-4" />
                                                Browse Files
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-400 mt-4">
                                                Supported: Images, PDFs, Documents, and more
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && selectedFile && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={handleClosePreview}
                        />
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Eye className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white truncate">{selectedFile.filename}</h2>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleDownloadFile(selectedFile)}
                                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                        title="Download"
                                    >
                                        <Download className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleClosePreview}
                                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 overflow-auto bg-gray-50">
                                {previewLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
                                        <p className="text-gray-600 font-medium">Loading preview...</p>
                                    </div>
                                ) : previewUrl && selectedFile.is_image ? (
                                    <img
                                        src={previewUrl}
                                        alt={selectedFile.filename}
                                        className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                                    />
                                ) : previewUrl && selectedFile.file_type === 'application/pdf' ? (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-[60vh] rounded-lg"
                                        title={selectedFile.filename}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <div className={`inline-flex p-6 rounded-full ${getFileTypeColor(selectedFile.file_type)} mb-4`}>
                                            {(() => {
                                                const Icon = getFileTypeIcon(selectedFile.file_type);
                                                return <Icon className="w-12 h-12" />;
                                            })()}
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedFile.filename}</h3>
                                        <p className="text-gray-500 mb-4">{formatFileSize(selectedFile.file_size)}</p>
                                        {!previewLoading && !previewUrl && (
                                            <p className="text-sm text-amber-600 mb-4">Preview not available for this file type</p>
                                        )}
                                        <button
                                            onClick={() => handleDownloadFile(selectedFile)}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-500/30"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download File
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* File Details Footer */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Size:</span>
                                        <span className="ml-2 text-gray-900 font-medium">{formatFileSize(selectedFile.file_size)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Type:</span>
                                        <span className="ml-2 text-gray-900 font-medium">{selectedFile.file_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Uploaded by:</span>
                                        <span className="ml-2 text-gray-900 font-medium">{selectedFile.uploaded_by?.full_name || 'Unknown'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <span className="ml-2 text-gray-900 font-medium">{new Date(selectedFile.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && fileToDelete && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={cancelDelete}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                            <h3 className="text-lg font-semibold text-white">Delete File</h3>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium mb-1">Are you sure you want to delete this file?</p>
                                    <p className="text-gray-500 text-sm mb-2">
                                        <span className="font-medium text-gray-700">{fileToDelete.filename}</span>
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        This action cannot be undone. The file will be permanently removed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete File
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </OrganizationLayout>
    );
}
