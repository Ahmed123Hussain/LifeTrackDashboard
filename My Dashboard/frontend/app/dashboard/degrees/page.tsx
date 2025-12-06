'use client';

import { useEffect, useState } from 'react';
import apiClient, { degreeAPI } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PreviewModal } from '@/components/PreviewModal';
import { Trash2, Plus, BookOpen, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Degree {
  _id: string;
  degreeName: string;
  university: string;
  startDate: string;
  endDate: string;
  gpa?: number;
  notes?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
}

export default function DegreesPage() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    degreeName: '',
    university: '',
    startDate: '',
    endDate: '',
    gpa: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const response = await degreeAPI.getAll();
      setDegrees(response.data.data);
    } catch (error) {
      console.error('Failed to fetch degrees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        degreeName: formData.degreeName,
        university: formData.university,
        startDate: formData.startDate,
        endDate: formData.endDate,
        ...(formData.gpa && { gpa: parseFloat(formData.gpa) }),
        ...(formData.notes && { notes: formData.notes }),
      };

      if (selectedFile) {
        const form = new FormData();
        form.append('degreeName', payload.degreeName);
        form.append('university', payload.university);
        form.append('startDate', payload.startDate);
        form.append('endDate', payload.endDate);
        if (payload.gpa !== undefined) form.append('gpa', String(payload.gpa));
        if (payload.notes !== undefined) form.append('notes', String(payload.notes));
        form.append('file', selectedFile);

        if (editingId) {
          const response = await degreeAPI.update(editingId, form);
          setDegrees(degrees.map((d) => (d._id === editingId ? response.data.data : d)));
        } else {
          const response = await degreeAPI.create(form);
          setDegrees([response.data.data, ...degrees]);
        }
      } else {
        if (editingId) {
          await degreeAPI.update(editingId, payload);
          setDegrees(degrees.map((d) => (d._id === editingId ? { ...d, ...payload } : d)));
        } else {
          const response = await degreeAPI.create(payload);
          setDegrees([response.data.data, ...degrees]);
        }
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save degree:', error);
      alert('Failed to save degree');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await degreeAPI.delete(id);
      setDegrees(degrees.filter((d) => d._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (degree: Degree) => {
    setEditingId(degree._id);
    setFormData({
      degreeName: degree.degreeName,
      university: degree.university,
      startDate: degree.startDate.split('T')[0],
      endDate: degree.endDate.split('T')[0],
      gpa: degree.gpa?.toString() || '',
      notes: degree.notes || '',
    });
    setSelectedFile(null);
    if (degree.fileUrl && degree.fileType && degree.fileType.startsWith('image/')) {
      const remote = `${(apiClient.defaults.baseURL || '').replace(/\/api$/, '')}${degree.fileUrl}`;
      setPreviewUrl(remote);
    } else {
      setPreviewUrl(null);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      degreeName: '',
      university: '',
      startDate: '',
      endDate: '',
      gpa: '',
      notes: '',
    });
    setEditingId(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const filteredDegrees = () => {
    if (!searchQuery || searchQuery.trim() === '') return degrees;
    const q = searchQuery.toLowerCase();
    return degrees.filter(
      (d) => (d.degreeName || '').toLowerCase().includes(q) || (d.university || '').toLowerCase().includes(q)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Degrees & Education</h1>
          <div className="mt-3 max-w-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search degrees..."
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
          Add Degree
        </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : degrees.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No degrees yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDegrees().map((degree) => (
            <div
              key={degree._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {degree.fileUrl && (
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {degree.fileType && degree.fileType.startsWith('image/') ? (
                        <img
                          src={`${(apiClient.defaults.baseURL || '').replace(/\/api$/, '')}${degree.fileUrl}`}
                          alt={degree.fileName || 'attachment'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <a
                          href={`${(apiClient.defaults.baseURL || '').replace(/\/api$/, '')}${degree.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400"
                        >
                          View PDF
                        </a>
                      )}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {degree.degreeName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {degree.university}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {format(new Date(degree.startDate), 'MMM yyyy')} -{' '}
                        {format(new Date(degree.endDate), 'MMM yyyy')}
                      </span>
                      {degree.gpa && <span>GPA: {degree.gpa}</span>}
                    </div>
                    {degree.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {degree.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDegree(degree);
                      setPreviewOpen(true);
                    }}
                    title="Preview"
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 transition"
                  >
                    <Eye className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>

                  <button
                    onClick={() => handleEdit(degree)}
                    title="Edit"
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(degree._id)}
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
        title={editingId ? 'Edit Degree' : 'Add Degree'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Degree Name *</label>
            <input
              type="text"
              value={formData.degreeName}
              onChange={(e) => setFormData({ ...formData, degreeName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">University *</label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attachment (PDF or Image)</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSelectedFile(f);
                if (f && f.type.startsWith('image/')) {
                  const url = URL.createObjectURL(f);
                  setPreviewUrl(url);
                } else {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setPreviewUrl(null);
                }
              }}
            />

            {previewUrl && (
              <div className="mt-2 w-32 h-32 rounded overflow-hidden">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

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
        title={selectedDegree?.degreeName || 'Preview'}
        content={[
          { label: 'University', value: selectedDegree?.university },
          { label: 'Start Date', value: selectedDegree ? format(new Date(selectedDegree.startDate), 'MMM yyyy') : undefined },
          { label: 'End Date', value: selectedDegree ? format(new Date(selectedDegree.endDate), 'MMM yyyy') : undefined },
          { label: 'GPA', value: selectedDegree?.gpa?.toString() },
          { label: 'Notes', value: selectedDegree?.notes },
        ]}
        fileUrl={selectedDegree?.fileUrl}
        fileName={selectedDegree?.fileName}
        fileType={selectedDegree?.fileType}
      />
    </div>
  );
}
