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
    FolderOpen,
    Pencil,
    Tag,
    Save,
    Copy,
    Check,
    Clock,
    Globe,
    LinkIcon,
    Unlink,
    BarChart3,
    TrendingUp,
    CheckSquare,
    Square,
    Archive,
    AlertTriangle
} from 'lucide-react';
import {
    getFiles,
    uploadFile,
    updateFile,
    deleteFile,
    attachFile,
    detachFile,
    createFileShare,
    getStorageStats,
    getStorageBreakdown,
    getLargestFiles,
    formatFileSize,
    UserFile,
    StorageStats,
    FileFilters
} from '@/lib/files-api';
import { getTasks } from '@/lib/tasks-api';
import { Task } from '@/types/tasks';
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

// File type color mapping (for icons)
const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'bg-blue-100 text-blue-600';
    if (fileType.startsWith('video/')) return 'bg-pink-100 text-pink-600';
    if (fileType.startsWith('audio/')) return 'bg-amber-100 text-amber-600';
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-600';
    if (fileType.includes('document') || fileType.includes('word')) return 'bg-indigo-100 text-indigo-600';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
};

// Chart bar colors - varied palette
const chartColors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-teal-500',
];

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
    const [showEditModal, setShowEditModal] = useState(false);
    const [fileToEdit, setFileToEdit] = useState<UserFile | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', tags: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [fileToShare, setFileToShare] = useState<UserFile | null>(null);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [shareSettings, setShareSettings] = useState({ canDownload: true, expiresIn: '7' });
    // Bulk selection
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    // Storage breakdown
    const [storageBreakdown, setStorageBreakdown] = useState<Record<string, { count: number; total_size_bytes: number; total_size_mb: number }> | null>(null);
    const [largestFiles, setLargestFiles] = useState<UserFile[]>([]);
    const [showStorageModal, setShowStorageModal] = useState(false);
    // Attach to task
    const [showAttachModal, setShowAttachModal] = useState(false);
    const [fileToAttach, setFileToAttach] = useState<UserFile | null>(null);
    const [taskIdInput, setTaskIdInput] = useState('');
    const [isAttaching, setIsAttaching] = useState(false);
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [taskSearchQuery, setTaskSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
            // Refresh storage breakdown if modal is open
            if (showStorageModal) {
                await fetchStorageBreakdown();
            }
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

    // Open edit modal
    const handleEditFile = (file: UserFile) => {
        setFileToEdit(file);
        setEditForm({
            title: file.title || file.filename,
            description: file.description || '',
            tags: file.tags?.join(', ') || ''
        });
        setShowEditModal(true);
        setActiveDropdown(null);
    };

    // Save file changes
    const saveFileChanges = async () => {
        if (!fileToEdit) return;

        try {
            setIsSaving(true);
            await updateFile(fileToEdit.id, {
                title: editForm.title,
                description: editForm.description,
                tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            await fetchFiles();
            setShowEditModal(false);
            setFileToEdit(null);
        } catch (error) {
            console.error('Failed to update file:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel edit
    const cancelEdit = () => {
        setShowEditModal(false);
        setFileToEdit(null);
    };

    // Open share modal
    const handleShareFile = (file: UserFile) => {
        setFileToShare(file);
        setShareLink(null);
        setLinkCopied(false);
        setShareSettings({ canDownload: true, expiresIn: '7' });
        setShowShareModal(true);
        setActiveDropdown(null);
    };

    // Generate share link
    const generateShareLink = async () => {
        if (!fileToShare) return;

        try {
            setIsGeneratingLink(true);

            // Calculate expiry date
            const expiresAt = shareSettings.expiresIn !== 'never'
                ? new Date(Date.now() + parseInt(shareSettings.expiresIn) * 24 * 60 * 60 * 1000).toISOString()
                : undefined;

            const response = await createFileShare({
                file_id: fileToShare.id,
                generate_public_link: true,
                can_download: shareSettings.canDownload,
                expires_at: expiresAt
            });

            if (response.data?.share_token) {
                const baseUrl = window.location.origin;
                setShareLink(`${baseUrl}/shared/${response.data.share_token}`);
            }
        } catch (error) {
            console.error('Failed to generate share link:', error);
        } finally {
            setIsGeneratingLink(false);
        }
    };

    // Copy link to clipboard
    const copyShareLink = async () => {
        if (!shareLink) return;

        try {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    // Close share modal
    const closeShareModal = () => {
        setShowShareModal(false);
        setFileToShare(null);
        setShareLink(null);
        setLinkCopied(false);
    };

    // ============================================
    // Bulk Selection Handlers
    // ============================================

    const toggleFileSelection = (fileId: string) => {
        setSelectedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    };

    const selectAllFiles = () => {
        if (selectedFiles.size === files.length) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(files.map(f => f.id)));
        }
    };

    const clearSelection = () => {
        setSelectedFiles(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedFiles.size === 0) return;

        try {
            setIsBulkDeleting(true);
            await Promise.all(
                Array.from(selectedFiles).map(fileId => deleteFile(fileId))
            );
            await fetchFiles();
            await fetchStorageStats();
            setSelectedFiles(new Set());
        } catch (error) {
            console.error('Failed to delete files:', error);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleBulkDownload = async () => {
        const filesToDownload = files.filter(f => selectedFiles.has(f.id));
        for (const file of filesToDownload) {
            await handleDownloadFile(file);
        }
    };

    // ============================================
    // Storage Breakdown Handlers
    // ============================================

    const fetchStorageBreakdown = async () => {
        try {
            const [breakdownResponse, largestResponse] = await Promise.all([
                getStorageBreakdown(),
                getLargestFiles(5)
            ]);
            setStorageBreakdown(breakdownResponse.data);
            setLargestFiles(largestResponse.data);
        } catch (error) {
            console.error('Failed to fetch storage breakdown:', error);
        }
    };

    const openStorageModal = async () => {
        setShowStorageModal(true);
        await fetchStorageBreakdown();
    };

    // ============================================
    // Attach/Detach Handlers
    // ============================================

    const handleAttachFile = async (file: UserFile) => {
        setFileToAttach(file);
        setTaskIdInput('');
        setSelectedTask(null);
        setTaskSearchQuery('');
        setShowAttachModal(true);
        setActiveDropdown(null);

        // Fetch available tasks
        try {
            setIsLoadingTasks(true);
            const response = await getTasks({ page_size: 100 });
            setAvailableTasks(response.data || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const confirmAttachFile = async () => {
        if (!fileToAttach || !selectedTask) return;

        try {
            setIsAttaching(true);
            await attachFile(fileToAttach.id, { task_id: selectedTask.id });
            await fetchFiles();
            setShowAttachModal(false);
            setFileToAttach(null);
            setSelectedTask(null);
            setTaskSearchQuery('');
        } catch (error) {
            console.error('Failed to attach file:', error);
        } finally {
            setIsAttaching(false);
        }
    };

    const handleDetachFile = async (file: UserFile) => {
        try {
            await detachFile(file.id);
            await fetchFiles();
            setActiveDropdown(null);
        } catch (error) {
            console.error('Failed to detach file:', error);
        }
    };

    const closeAttachModal = () => {
        setShowAttachModal(false);
        setFileToAttach(null);
        setSelectedTask(null);
        setTaskSearchQuery('');
    };

    // Filter tasks based on search query and exclude closed tasks
    const filteredTasks = availableTasks.filter(task =>
        task.status !== 'closed' && (
            task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
            task.task_number?.toLowerCase().includes(taskSearchQuery.toLowerCase())
        )
    );

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
                            <button
                                onClick={openStorageModal}
                                className="mt-3 w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1"
                            >
                                <BarChart3 className="w-4 h-4" />
                                View Details
                            </button>
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

                {/* Bulk Action Toolbar */}
                {selectedFiles.size > 0 && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={selectAllFiles}
                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                            >
                                {selectedFiles.size === files.length ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <Square className="w-5 h-5" />
                                )}
                                {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-sm text-emerald-700 font-medium">
                                {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBulkDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isBulkDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete
                            </button>
                            <button
                                onClick={clearSelection}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        </div>
                    </div>
                )}

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
                                    className={`bg-white rounded-xl border hover:shadow-lg transition-shadow group relative ${selectedFiles.has(file.id) ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
                                        }`}
                                >
                                    {/* Selection Checkbox */}
                                    <div
                                        className="absolute top-2 left-2 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFileSelection(file.id);
                                        }}
                                    >
                                        <button
                                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${selectedFiles.has(file.id)
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/90 border border-gray-300 text-gray-400 hover:border-emerald-500'
                                                }`}
                                        >
                                            {selectedFiles.has(file.id) ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

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
                                                            <button
                                                                onClick={() => handleEditFile(file)}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                                Edit Details
                                                            </button>
                                                            <button
                                                                onClick={() => handleShareFile(file)}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                            >
                                                                <Share2 className="w-4 h-4" />
                                                                Share
                                                            </button>
                                                            {file.task ? (
                                                                <button
                                                                    onClick={() => handleDetachFile(file)}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                                >
                                                                    <Unlink className="w-4 h-4" />
                                                                    Detach from Task
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAttachFile(file)}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                                >
                                                                    <LinkIcon className="w-4 h-4" />
                                                                    Attach to Task
                                                                </button>
                                                            )}
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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
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

            {/* Edit File Modal */}
            {showEditModal && fileToEdit && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={cancelEdit}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Pencil className="w-5 h-5" />
                                Edit File Details
                            </h3>
                            <button
                                onClick={cancelEdit}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* File Name (read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Name
                                </label>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg text-gray-600">
                                    {(() => {
                                        const Icon = getFileTypeIcon(fileToEdit.file_type);
                                        return <Icon className="w-4 h-4" />;
                                    })()}
                                    <span className="truncate">{fileToEdit.filename}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    placeholder="Enter a title for this file"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Add a description..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-4 h-4" />
                                        Tags
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={editForm.tags}
                                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                    placeholder="Enter tags separated by commas"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate tags with commas (e.g., invoice, report, 2024)</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={cancelEdit}
                                disabled={isSaving}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveFileChanges}
                                disabled={isSaving}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share File Modal */}
            {showShareModal && fileToShare && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={closeShareModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Emerald Theme */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Share2 className="w-5 h-5" />
                                Share File
                            </h3>
                            <button
                                onClick={closeShareModal}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* File Info */}
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                                {(() => {
                                    const Icon = getFileTypeIcon(fileToShare.file_type);
                                    return <Icon className="w-8 h-8 text-emerald-600" />;
                                })()}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{fileToShare.filename}</p>
                                    <p className="text-sm text-gray-500">{formatFileSize(fileToShare.file_size)}</p>
                                </div>
                            </div>

                            {/* Share Settings */}
                            {!shareLink && (
                                <div className="space-y-4">
                                    {/* Allow Download */}
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={shareSettings.canDownload}
                                            onChange={(e) => setShareSettings({ ...shareSettings, canDownload: e.target.checked })}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">Allow download</p>
                                            <p className="text-sm text-gray-500">Recipients can download the file</p>
                                        </div>
                                    </label>

                                    {/* Expiry */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-emerald-600" />
                                            Link expires in
                                        </label>
                                        <select
                                            value={shareSettings.expiresIn}
                                            onChange={(e) => setShareSettings({ ...shareSettings, expiresIn: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        >
                                            <option value="1">1 day</option>
                                            <option value="7">7 days</option>
                                            <option value="30">30 days</option>
                                            <option value="90">90 days</option>
                                            <option value="never">Never</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Generated Link */}
                            {shareLink && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                                        <Check className="w-5 h-5" />
                                        <span className="font-medium">Link generated successfully!</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={shareLink}
                                            readOnly
                                            className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600"
                                        />
                                        <button
                                            onClick={copyShareLink}
                                            className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${linkCopied
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}
                                        >
                                            {linkCopied ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Globe className="w-4 h-4" />
                                        Anyone with this link can access the file
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={closeShareModal}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                {shareLink ? 'Done' : 'Cancel'}
                            </button>
                            {!shareLink && (
                                <button
                                    onClick={generateShareLink}
                                    disabled={isGeneratingLink}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isGeneratingLink ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Link2 className="w-4 h-4" />
                                            Generate Link
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Storage Breakdown Modal */}
            {showStorageModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowStorageModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Emerald Theme */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Storage Details
                            </h3>
                            <button
                                onClick={() => setShowStorageModal(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Overall Storage Summary */}
                            {storageStats && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-700">Total Storage Used</span>
                                        <span className="text-lg font-bold text-emerald-600">
                                            {storageStats.usage_gb.toFixed(2)} GB
                                        </span>
                                    </div>
                                    {!storageStats.is_unlimited && (
                                        <div>
                                            <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full rounded-full transition-all ${storageStats.percentage_used > 90 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                                        storageStats.percentage_used > 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                            'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min(storageStats.percentage_used, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>{storageStats.percentage_used.toFixed(1)}% used</span>
                                                <span>{storageStats.limit_gb} GB limit</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Storage Breakdown by Type */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Archive className="w-4 h-4 text-emerald-600" />
                                    Storage by File Type
                                </h4>
                                {storageBreakdown ? (
                                    <div className="space-y-4">
                                        {Object.entries(storageBreakdown).map(([type, data], index) => {
                                            const totalSize = storageStats?.usage_bytes || 1;
                                            // Use total_size_bytes from API response
                                            const sizeValue = typeof data.total_size_bytes === 'number' && !isNaN(data.total_size_bytes) ? data.total_size_bytes : 0;
                                            const percentage = totalSize > 0 ? (sizeValue / totalSize) * 100 : 0;
                                            const FileIcon = getFileTypeIcon(type);
                                            const barColor = chartColors[index % chartColors.length];

                                            return (
                                                <div key={type} className="group">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`p-2 rounded-lg ${getFileTypeColor(type)}`}>
                                                            <FileIcon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-baseline">
                                                                <span className="font-medium text-gray-900 text-sm truncate">{type}</span>
                                                                <span className="text-sm text-gray-600 font-medium ml-2 whitespace-nowrap">
                                                                    {data.count} {data.count === 1 ? 'file' : 'files'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700 min-w-[80px] text-right">
                                                            {formatFileSize(sizeValue)}
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden ml-11">
                                                        <div
                                                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                                            style={{ width: `${Math.max(percentage, 2)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1 ml-11">
                                                        {percentage.toFixed(1)}% of total storage
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Largest Files */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    Largest Files
                                </h4>
                                {largestFiles.length > 0 ? (
                                    <div className="space-y-2">
                                        {largestFiles.map((file, index) => {
                                            const FileIcon = getFileTypeIcon(file.file_type);
                                            const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700', 'text-gray-500', 'text-gray-500'];
                                            return (
                                                <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className={`text-lg font-bold w-6 text-center ${rankColors[index] || 'text-gray-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className={`p-2 rounded-lg ${getFileTypeColor(file.file_type)}`}>
                                                        <FileIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{file.filename}</p>
                                                        <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteFile(file)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete file"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">No files found</p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setShowStorageModal(false)}
                                className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attach to Task Modal */}
            {showAttachModal && fileToAttach && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={closeAttachModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Emerald Theme */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <LinkIcon className="w-5 h-5" />
                                Attach to Task
                            </h3>
                            <button
                                onClick={closeAttachModal}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                            {/* File Info */}
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                                {(() => {
                                    const Icon = getFileTypeIcon(fileToAttach.file_type);
                                    return <Icon className="w-8 h-8 text-emerald-600" />;
                                })()}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{fileToAttach.filename}</p>
                                    <p className="text-sm text-gray-500">{formatFileSize(fileToAttach.file_size)}</p>
                                </div>
                            </div>

                            {/* Task Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Search className="w-4 h-4 text-emerald-600" />
                                    Select a Task
                                </label>

                                {/* Search Input */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={taskSearchQuery}
                                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                                        placeholder="Search tasks by title or number..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    />
                                </div>

                                {/* Tasks List */}
                                <div className="border border-gray-200 rounded-lg max-h-[250px] overflow-y-auto">
                                    {isLoadingTasks ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                            <span className="ml-2 text-gray-500">Loading tasks...</span>
                                        </div>
                                    ) : filteredTasks.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            <p>{taskSearchQuery ? 'No tasks found' : 'No tasks available'}</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {filteredTasks.map(task => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => setSelectedTask(task)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedTask?.id === task.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-medium truncate ${selectedTask?.id === task.id ? 'text-emerald-700' : 'text-gray-900'}`}>
                                                                {task.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {task.task_number && (
                                                                    <span className="text-xs text-gray-500">#{task.task_number}</span>
                                                                )}
                                                                <span className={`text-xs px-1.5 py-0.5 rounded ${task.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                                    task.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {task.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {selectedTask?.id === task.id && (
                                                            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Task Display */}
                                {selectedTask && (
                                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <p className="text-sm text-emerald-700">
                                            <span className="font-medium">Selected:</span> {selectedTask.title}
                                            {selectedTask.task_number && ` (#${selectedTask.task_number})`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                            <button
                                onClick={closeAttachModal}
                                disabled={isAttaching}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAttachFile}
                                disabled={isAttaching || !selectedTask}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isAttaching ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Attaching...
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon className="w-4 h-4" />
                                        Attach File
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
