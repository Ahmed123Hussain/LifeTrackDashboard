'use client';

import { Modal } from './Modal';
import { X } from 'lucide-react';
import apiClient from '@/lib/api';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: {
    label: string;
    value: string | number | undefined;
  }[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
}

export function PreviewModal({
  isOpen,
  onClose,
  title = 'Preview',
  content = [],
  fileUrl,
  fileName,
  fileType,
}: PreviewModalProps) {
  const apiBase = (apiClient && apiClient.defaults && apiClient.defaults.baseURL)
    ? (apiClient.defaults.baseURL as string).replace(/\/api$/, '')
    : (process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://https://lifetrackdashboard.onrender.com'));
  const fullFileUrl = fileUrl ? `${apiBase}${fileUrl}` : null;
  const isImage = fileType && fileType.startsWith('image/');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Content fields */}
        {content.map((item, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {item.label}
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-2 rounded">
              {item.value || '—'}
            </p>
          </div>
        ))}

        {/* File preview */}
        {fileUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachment
            </label>
            {isImage ? (
              <div className="rounded overflow-hidden max-h-64">
                <img
                  src={fullFileUrl!}
                  alt={fileName || 'attachment'}
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : (
              <a
                href={fullFileUrl!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition text-sm"
              >
                📄 {fileName || 'View File'}
              </a>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
