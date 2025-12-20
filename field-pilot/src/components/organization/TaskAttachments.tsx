'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Paperclip,
    Upload,
    Download,
    Trash2,
    FileText,
    Image as ImageIcon,
    X,
    File,
    FileSpreadsheet,
    FileCode,
    FileArchive,
    Video,
    Music,
    ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTaskAttachments, uploadAttachment, downloadAttachment } from '@/lib/tasks-api';
import { TaskAttachment } from '@/types/tasks';
import DeleteAttachmentModal from './DeleteAttachmentModal';

interface TaskAttachmentsProps {
    taskId: string;
    currentCount?: number;
    onAttachmentChange?: (delta: number) => void;
}

export default function TaskAttachments({ taskId, currentCount = 0, onAttachmentChange }: TaskAttachmentsProps) {
    const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState<TaskAttachment | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadAttachments();
    }, [taskId]);

    useEffect(() => {
        // Cleanup preview URL
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const loadAttachments = async () => {
        try {
            setIsLoading(true);
            const response = await getTaskAttachments(taskId);
            setAttachments(response.data || []);
        } catch (error: any) {
            console.error('Failed to load attachments:', error);
            toast.error('Failed to load attachments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (20MB max)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            toast.error('File size must not exceed 20MB');
            return;
        }

        // Validate file type - check both MIME type and extension
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();

        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        const allowedExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.webp',
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.csv',
            '.txt',
            '.ppt',
            '.pptx',
        ];

        const hasValidMimeType = allowedMimeTypes.includes(fileType);
        const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

        // Accept if either MIME type OR extension is valid (some browsers don't report correct MIME types)
        if (!hasValidMimeType && !hasValidExtension) {
            toast.error(
                'File type not supported. Please upload Images, PDF, Word, Excel, PowerPoint, or Text files.'
            );
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            await uploadAttachment(taskId, selectedFile);
            toast.success('File uploaded successfully');
            
            // Reset state
            setSelectedFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Reload attachments
            await loadAttachments();
            
            // Notify parent of change
            if (onAttachmentChange) {
                onAttachmentChange(1);
            }
        } catch (error: any) {
            console.error('Failed to upload file:', error);
            toast.error(error.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = (attachment: TaskAttachment) => {
        setAttachmentToDelete(attachment);
    };

    const handleDeleteSuccess = () => {
        // Reload attachments
        loadAttachments();
        
        // Notify parent of change
        if (onAttachmentChange) {
            onAttachmentChange(-1);
        }
    };

    const handleDownload = async (attachment: TaskAttachment) => {
        try {
            await downloadAttachment(attachment.id, attachment.filename);
            toast.success('Download started');
        } catch (error: any) {
            console.error('Failed to download file:', error);
            toast.error('Failed to download file');
        }
    };

    const handleOpenFile = (attachment: TaskAttachment) => {
        // Open file in new tab for preview
        if (attachment.file_url) {
            window.open(attachment.file_url, '_blank');
        } else {
            // Fallback to download if no URL
            handleDownload(attachment);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const getFileIcon = (attachment: TaskAttachment) => {
        const fileType = attachment.file_type.toLowerCase();
        const fileName = attachment.filename.toLowerCase();

        // Images
        if (attachment.is_image || fileType.startsWith('image/')) {
            return (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                </div>
            );
        }

        // PDFs
        if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
            return (
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                </div>
            );
        }

        // Word documents
        if (
            fileType.includes('word') ||
            fileType.includes('msword') ||
            fileType.includes('officedocument.wordprocessing') ||
            fileName.endsWith('.doc') ||
            fileName.endsWith('.docx')
        ) {
            return (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-700" />
                </div>
            );
        }

        // Excel spreadsheets
        if (
            fileType.includes('excel') ||
            fileType.includes('spreadsheet') ||
            fileName.endsWith('.xls') ||
            fileName.endsWith('.xlsx') ||
            fileName.endsWith('.csv')
        ) {
            return (
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                </div>
            );
        }

        // PowerPoint presentations
        if (
            fileType.includes('powerpoint') ||
            fileType.includes('presentation') ||
            fileName.endsWith('.ppt') ||
            fileName.endsWith('.pptx')
        ) {
            return (
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <File className="h-5 w-5 text-orange-600" />
                </div>
            );
        }

        // Code files
        if (
            fileName.endsWith('.js') ||
            fileName.endsWith('.ts') ||
            fileName.endsWith('.jsx') ||
            fileName.endsWith('.tsx') ||
            fileName.endsWith('.py') ||
            fileName.endsWith('.java') ||
            fileName.endsWith('.cpp') ||
            fileName.endsWith('.c') ||
            fileName.endsWith('.html') ||
            fileName.endsWith('.css') ||
            fileName.endsWith('.json') ||
            fileName.endsWith('.xml')
        ) {
            return (
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileCode className="h-5 w-5 text-purple-600" />
                </div>
            );
        }

        // Archives
        if (
            fileType.includes('zip') ||
            fileType.includes('rar') ||
            fileType.includes('7z') ||
            fileType.includes('tar') ||
            fileType.includes('gz') ||
            fileName.endsWith('.zip') ||
            fileName.endsWith('.rar') ||
            fileName.endsWith('.7z')
        ) {
            return (
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileArchive className="h-5 w-5 text-yellow-600" />
                </div>
            );
        }

        // Videos
        if (fileType.startsWith('video/') || fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) {
            return (
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Video className="h-5 w-5 text-pink-600" />
                </div>
            );
        }

        // Audio
        if (fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|ogg|m4a|flac)$/)) {
            return (
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Music className="h-5 w-5 text-indigo-600" />
                </div>
            );
        }

        // Default
        return (
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-emerald-600" />
                    Attachments ({attachments.length})
                </h2>
                {attachments.length > 5 && (
                    <span className="text-xs text-gray-500">Scroll to see more</span>
                )}
            </div>

            {/* Upload Section */}
            <div className="mb-4">
                {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                        >
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                            <span className="text-xs text-gray-500">Max file size: 20MB</span>
                            <span className="text-xs text-gray-500">
                                Supported: Images, PDF, Word, Excel, PowerPoint, Text
                            </span>
                        </label>
                    </div>
                ) : (
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                            <button
                                onClick={handleCancelUpload}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                            <button
                                onClick={handleCancelUpload}
                                disabled={isUploading}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Attachments List */}
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
            ) : attachments.length === 0 ? (
                <div className="text-center py-8">
                    <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No attachments yet</p>
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="shrink-0">{getFileIcon(attachment)}</div>
                            <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleOpenFile(attachment)}
                            >
                                <p className="text-sm font-medium text-gray-900 truncate hover:text-emerald-600 transition-colors">
                                    {attachment.filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.file_size)} • {attachment.uploaded_by_name} •{' '}
                                    {formatDate(attachment.created_at)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenFile(attachment);
                                    }}
                                    className="p-2 hover:bg-white rounded transition-colors"
                                    title="Open"
                                >
                                    <ExternalLink className="h-4 w-4 text-emerald-600" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(attachment);
                                    }}
                                    className="p-2 hover:bg-white rounded transition-colors"
                                    title="Download"
                                >
                                    <Download className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(attachment);
                                    }}
                                    className="p-2 hover:bg-white rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {attachmentToDelete && (
                <DeleteAttachmentModal
                    attachment={attachmentToDelete}
                    onClose={() => setAttachmentToDelete(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}
