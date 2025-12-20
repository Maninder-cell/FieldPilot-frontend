'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    FileText,
    Image as ImageIcon,
    File,
    FileSpreadsheet,
    FileCode,
    FileArchive,
    Video,
    Music,
} from 'lucide-react';
import { deleteAttachment } from '@/lib/tasks-api';
import { TaskAttachment } from '@/types/tasks';
import { toast } from 'react-hot-toast';

interface DeleteAttachmentModalProps {
  attachment: TaskAttachment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteAttachmentModal({ attachment, onClose, onSuccess }: DeleteAttachmentModalProps) {
  const [loading, setLoading] = useState(false);

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
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-blue-600" />
        </div>
      );
    }

    // PDFs
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return (
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText className="h-6 w-6 text-red-600" />
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
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-700" />
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
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <FileSpreadsheet className="h-6 w-6 text-green-600" />
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
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <File className="h-6 w-6 text-orange-600" />
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
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileCode className="h-6 w-6 text-purple-600" />
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
        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <FileArchive className="h-6 w-6 text-yellow-600" />
        </div>
      );
    }

    // Videos
    if (fileType.startsWith('video/') || fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) {
      return (
        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
          <Video className="h-6 w-6 text-pink-600" />
        </div>
      );
    }

    // Audio
    if (fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|ogg|m4a|flac)$/)) {
      return (
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Music className="h-6 w-6 text-indigo-600" />
        </div>
      );
    }

    // Default
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <FileText className="h-6 w-6 text-gray-600" />
      </div>
    );
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteAttachment(attachment.id);
      toast.success('Attachment deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete attachment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Attachment
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this file?
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  This action cannot be undone.
                </p>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">{getFileIcon(attachment)}</div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.filename}
                      </p>
                      <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                        <div>Size: {formatFileSize(attachment.file_size)}</div>
                        <div>Type: {attachment.file_type}</div>
                        <div>Uploaded by: {attachment.uploaded_by_name}</div>
                        <div>Date: {formatDate(attachment.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Delete File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
