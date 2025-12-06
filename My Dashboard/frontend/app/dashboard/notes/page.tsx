'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Trash2, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const STORAGE_KEY = 'lc_notes';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setNotes(JSON.parse(raw));
      } catch (e) {
        setNotes([]);
      }
    }
  }, []);

  const persist = (next: Note[]) => {
    setNotes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleCreate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return alert('Please enter a title');
    const n: Note = {
      id: String(Date.now()),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([n, ...notes]);
    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete note?')) return;
    persist(notes.filter((n) => n.id !== id));
  };

  const filteredNotes = () => {
    if (!searchQuery || searchQuery.trim() === '') return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter((n) => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <div className="mt-3 max-w-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div>
          <Button
          onClick={() => {
            setTitle('');
            setContent('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No notes yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNotes().map((n) => (
            <div key={n.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{n.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">{n.content}</p>
                  <div className="text-xs text-gray-400 mt-3">{format(new Date(n.createdAt), 'PPpp')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // open read-only modal with content
                      setTitle(n.title);
                      setContent(n.content);
                      setIsModalOpen(true);
                    }}
                    title="View"
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 transition"
                  >
                    <FileText className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>

                  <button
                    onClick={() => handleDelete(n.id)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTitle('');
          setContent('');
        }}
        title={title || 'Note'}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Save</Button>
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setTitle(''); setContent(''); }} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
