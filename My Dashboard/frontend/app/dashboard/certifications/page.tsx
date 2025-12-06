'use client';

import { useEffect, useState } from 'react';
import { certAPI } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PreviewModal } from '@/components/PreviewModal';
import { Trash2, Plus, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Certification {
  _id: string;
  title: string;
  organization: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    issueDate: '',
    expiryDate: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await certAPI.getAll();
      setCerts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await certAPI.update(editingId, formData);
        setCerts(certs.map((c) => (c._id === editingId ? { ...c, ...formData } : c)));
      } else {
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('organization', formData.organization);
        formDataObj.append('issueDate', formData.issueDate);
        if (formData.expiryDate) formDataObj.append('expiryDate', formData.expiryDate);
        if (file) formDataObj.append('file', file);

        const response = await certAPI.create(formDataObj);
        setCerts([response.data.data, ...certs]);
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save certification:', error);
      alert('Failed to save certification');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await certAPI.delete(id);
      setCerts(certs.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert._id);
    setFormData({
      title: cert.title,
      organization: cert.organization,
      issueDate: cert.issueDate.split('T')[0],
      expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      issueDate: '',
      expiryDate: '',
    });
    setFile(null);
    setEditingId(null);
  };

  const filteredCerts = () => {
    if (!searchQuery || searchQuery.trim() === '') return certs;
    const q = searchQuery.toLowerCase();
    return certs.filter(
      (c) => (c.title || '').toLowerCase().includes(q) || (c.organization || '').toLowerCase().includes(q)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Certifications</h1>
          <div className="mt-3 max-w-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search certifications..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div>
          <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredCerts().length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No certifications yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCerts().map((cert) => (
            <div
              key={cert._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {cert.organization}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>Issued: {format(new Date(cert.issueDate), 'MMM d, yyyy')}</span>
                    {cert.expiryDate && (
                      <span>Expires: {format(new Date(cert.expiryDate), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCert(cert);
                      setPreviewOpen(true);
                    }}
                    title="Preview"
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 transition"
                  >
                    <Eye className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>

                  <button
                    onClick={() => handleEdit(cert)}
                    title="Edit"
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(cert._id)}
                    title="Delete"
                    className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? 'Edit Certification' : 'Add Certification'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Organization *</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Issue Date *</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expiry Date</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>

          {!editingId && (
            <div>
              <label className="block text-sm font-medium mb-1">File (PDF/Image)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={selectedCert?.title || 'Preview'}
        content={[
          { label: 'Organization', value: selectedCert?.organization },
          { label: 'Issued Date', value: selectedCert ? format(new Date(selectedCert.issueDate), 'MMM d, yyyy') : undefined },
          { label: 'Expiry Date', value: selectedCert?.expiryDate ? format(new Date(selectedCert.expiryDate), 'MMM d, yyyy') : 'No expiry' },
        ]}
        fileUrl={selectedCert?.fileUrl}
        fileName={selectedCert?.fileName}
        fileType={selectedCert?.fileType}
      />
    </div>
  );
}
