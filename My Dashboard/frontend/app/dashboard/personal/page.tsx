"use client";

import { useEffect, useState, useRef } from 'react';
import { FileText, Home, CreditCard, FilePlus, Trash2 } from 'lucide-react';
import { uploadAPI } from '@/lib/api';

type Doc = {
  id: string;
  tab: string;
  title: string;
  details?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
};

export default function PersonalPage() {
  const tabs = [
    { id: 'personal', label: 'Personal Documents', icon: FileText },
    { id: 'property', label: 'Property Documents', icon: Home },
    { id: 'bank', label: 'Bank Documents', icon: CreditCard },
  ];

  const [active, setActive] = useState('personal');

  // change-password UI
  const [showChange, setShowChange] = useState(false);
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const saveNewPassword = () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('lc_personal_password') || 'password123' : 'password123';
    if (stored && stored.length > 0 && stored !== 'password123') {
      if (current !== stored) {
        alert('Current password is incorrect');
        return;
      }
    }

    if (!newPass || newPass.length < 4) {
      alert('New password must be at least 4 characters');
      return;
    }
    if (newPass !== confirmPass) {
      alert('New passwords do not match');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('lc_personal_password', newPass);
    }
    setShowChange(false);
    setCurrent('');
    setNewPass('');
    setConfirmPass('');
    alert('Personal password updated');
  };

  // upload state
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [docs, setDocs] = useState<Doc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Doc[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lc_personal_docs');
      if (raw) setDocs(JSON.parse(raw));
    } catch (e) {
      setDocs([]);
    }
  }, []);

  const saveDocs = (next: Doc[]) => {
    setDocs(next);
    try {
      localStorage.setItem('lc_personal_docs', JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const buildFileUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//.test(fileUrl)) return fileUrl;
    let base = (process.env.NEXT_PUBLIC_API_URL || 'https://lifetrackdashboard.onrender.com').replace(/\/$/, '');
    if (base.endsWith('/api')) base = base.slice(0, -4);
    return `${base}${fileUrl}`;
  };

  const handleFileChange = (f: File | null) => {
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please choose a file');
    if (!title || title.trim().length === 0) return alert('Please provide a title');

    const form = new FormData();
    form.append('file', file);

    setUploading(true);
    try {
      const res = await uploadAPI.uploadCV(form);
      const meta = res.data.data;

      const doc: Doc = {
        id: String(Date.now()),
        tab: active,
        title: title.trim(),
        details: details.trim(),
        fileUrl: meta.fileUrl,
        fileName: meta.fileName,
        fileType: meta.fileType,
        uploadedAt: new Date().toISOString(),
      };

      const next = [doc, ...docs];
      saveDocs(next);

      // reset form
      setTitle('');
      setDetails('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      console.error('Upload failed', e);
      const msg = e?.response?.data?.message || e?.message || String(e);
      alert('Upload failed: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this document?')) return;
    const next = docs.filter((d) => d.id !== id);
    saveDocs(next);
  };

  const docsForTab = docs.filter((d) => d.tab === active);

  const doSearch = (q: string) => {
    const ql = q.trim().toLowerCase();
    if (!ql) {
      setSearchResults(null);
      return;
    }
    const results = docs.filter((d) => {
      return (
        (d.title || '').toLowerCase().includes(ql) ||
        (d.details || '').toLowerCase().includes(ql) ||
        (d.fileName || '').toLowerCase().includes(ql)
      );
    });
    setSearchResults(results);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Personal</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Secure area for personal documents. Provide password to access (frontend-only for now).</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery); }}
              placeholder="Search documents by title, details or filename..."
              className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-80"
            />
            <button onClick={() => doSearch(searchQuery)} className="px-3 py-2 rounded bg-blue-600 text-white">Search</button>
            <button onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700">Clear</button>
          </div>

          <div>
          <button
            onClick={() => setShowChange(!showChange)}
            className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-sm"
          >
            {showChange ? 'Cancel' : 'Change Personal Password'}
          </button>
          </div>
        </div>

        {showChange && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
            <label className="text-sm text-gray-700 dark:text-gray-300">Current Password</label>
            <input value={current} onChange={(e) => setCurrent(e.target.value)} type="password" className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2" />
            <label className="text-sm text-gray-700 dark:text-gray-300">New Password</label>
            <input value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2" />
            <label className="text-sm text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <input value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} type="password" className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-3" />
            <div className="flex justify-end">
              <button onClick={saveNewPassword} className="px-3 py-2 rounded bg-blue-600 text-white">Save Password</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
          {tabs.map((t) => {
            const Icon = t.icon as any;
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Upload form */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-1 md:col-span-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            <input placeholder="Details (optional)" value={details} onChange={(e) => setDetails(e.target.value)} className="col-span-1 md:col-span-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            <div className="col-span-1 md:col-span-1 flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} className="text-sm" />
              <button onClick={handleUpload} disabled={uploading} className="px-3 py-2 bg-blue-600 text-white rounded">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab content containers / Search results */}
        <div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tabs.find(t => t.id === active)?.label}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload or list {tabs.find(t => t.id === active)?.label.toLowerCase()}.</p>

            <div className="mt-4">
              {searchResults ? (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Showing {searchResults.length} result(s) for &quot;{searchQuery}&quot;</p>
                  <ul className="space-y-3">
                    {searchResults.map((d) => (
                      <li key={d.id} className="flex items-start justify-between bg-gray-50 dark:bg-gray-900 rounded p-3 border border-gray-100 dark:border-gray-700">
                        <div>
                          <div className="flex items-center gap-3">
                            <FilePlus className="w-5 h-5 text-blue-600" />
                            <div>
                              <a href={buildFileUrl(d.fileUrl)} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 dark:text-white">{d.title}</a>
                              <div className="text-xs text-gray-500">{d.fileName} · {new Date(d.uploadedAt).toLocaleString()} · {tabs.find(t=>t.id===d.tab)?.label}</div>
                            </div>
                          </div>
                          {d.details && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{d.details}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDelete(d.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                (docsForTab.length === 0) ? (
                  <div className="min-h-[120px] border border-dashed border-gray-200 dark:border-gray-700 rounded-md p-4 flex items-center justify-center text-sm text-gray-500">
                    (Empty) Add upload UI or list here later.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {docsForTab.map((d) => (
                      <li key={d.id} className="flex items-start justify-between bg-gray-50 dark:bg-gray-900 rounded p-3 border border-gray-100 dark:border-gray-700">
                        <div>
                          <div className="flex items-center gap-3">
                            <FilePlus className="w-5 h-5 text-blue-600" />
                            <div>
                              <a href={buildFileUrl(d.fileUrl)} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 dark:text-white">{d.title}</a>
                              <div className="text-xs text-gray-500">{d.fileName} · {new Date(d.uploadedAt).toLocaleString()}</div>
                            </div>
                          </div>
                          {d.details && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{d.details}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDelete(d.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
