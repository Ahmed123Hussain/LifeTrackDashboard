'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/Card';
import { goalAPI, certAPI, todoAPI, degreeAPI, uploadAPI } from '@/lib/api';
import apiClient from '@/lib/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  BookOpen,
  CheckSquare,
  Target,
  Loader,
} from 'lucide-react';

interface DashboardStats {
  certCount: number;
  degreeCount: number;
  completedTodos: number;
  totalTodos: number;
  upcomingGoals: number;
  todaysTodos: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // CV upload state (store metadata in localStorage)
  const [cv, setCv] = useState<{ fileUrl: string; fileName: string; fileType: string } | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  // Build an absolute file URL that points to the backend uploads directory.
  // `NEXT_PUBLIC_API_URL` may include a trailing `/api` path (e.g. http://localhost:5000/api).
  // Strip that `/api` part so we end up with the backend origin (http://localhost:5000).
  const buildFileUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//.test(fileUrl)) return fileUrl;
    // Prefer runtime axios baseURL (this is available in the browser and reflects NEXT_PUBLIC_API_URL if set).
    let clientBase = '';
    try {
      clientBase = (apiClient && (apiClient as any).defaults && (apiClient as any).defaults.baseURL) || '';
    } catch (e) {
      clientBase = '';
    }

    let base = (clientBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    if (base.endsWith('/api')) base = base.slice(0, -4);
    return `${base}${fileUrl}`;
  };

  useEffect(() => {
    const raw = localStorage.getItem('lc_cv');
    if (raw) {
      try {
        setCv(JSON.parse(raw));
      } catch (e) {
        setCv(null);
      }
    }
  }, []);

  const handleCvChange = async (f: File | null) => {
    if (!f) return;
    const form = new FormData();
    form.append('file', f);
    setCvUploading(true);
    try {
      // Use axios helper so Authorization header (interceptor) is applied
      const resp = await uploadAPI.uploadCV(form);
      const meta = resp.data.data;
      setCv(meta);
      localStorage.setItem('lc_cv', JSON.stringify(meta));
      alert('CV uploaded');
    } catch (e: any) {
      console.error('CV upload failed', e);
      // Handle common auth case
      const msg = e?.response?.data?.message || e?.message || String(e);
      if (e?.response?.status === 401 || /no token/i.test(msg)) {
        alert('CV upload failed: You must be logged in to upload a CV. Please login and try again.');
      } else {
        alert('CV upload failed: ' + msg);
      }
    } finally {
      setCvUploading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await goalAPI.getDashboardStats();
        setStats(response.data.data);

        // Generate chart data
        if (response.data.data) {
          setChartData([
            {
              name: 'Certifications',
              value: response.data.data.certCount,
            },
            {
              name: 'Degrees',
              value: response.data.data.degreeCount,
            },
            {
              name: 'Goals',
              value: response.data.data.upcomingGoals,
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const doUnifiedSearch = async () => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const q = searchQuery.toLowerCase();
      const [certsRes, degreesRes, todosRes, goalsRes] = await Promise.all([
        certAPI.getAll().catch(() => ({ data: { data: [] } })),
        degreeAPI.getAll().catch(() => ({ data: { data: [] } })),
        todoAPI.getAll().catch(() => ({ data: { data: [] } })),
        goalAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const certs = certsRes.data.data || [];
      const degrees = degreesRes.data.data || [];
      const todos = todosRes.data.data || [];
      const goals = goalsRes.data.data || [];

      const notesRaw = localStorage.getItem('lc_notes');
      const notes = notesRaw ? JSON.parse(notesRaw) : [];

      const results: any[] = [];
      certs.forEach((c: any) => {
        if ((c.title || '').toLowerCase().includes(q) || (c.organization || '').toLowerCase().includes(q)) {
          results.push({ type: 'Certification', title: c.title, id: c._id });
        }
      });
      degrees.forEach((d: any) => {
        if ((d.degreeName || '').toLowerCase().includes(q) || (d.university || '').toLowerCase().includes(q)) {
          results.push({ type: 'Degree', title: d.degreeName, id: d._id });
        }
      });
      todos.forEach((t: any) => {
        if ((t.task || '').toLowerCase().includes(q)) {
          results.push({ type: 'Todo', title: t.task, id: t._id });
        }
      });
      goals.forEach((g: any) => {
        if ((g.title || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q)) {
          results.push({ type: 'Goal', title: g.title, id: g._id });
        }
      });
      notes.forEach((n: any) => {
        if ((n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)) {
          results.push({ type: 'Note', title: n.title, id: n.id });
        }
      });

      setSearchResults(results.slice(0, 50));
    } catch (e) {
      console.error('Unified search failed', e);
    } finally {
      setSearching(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's your productivity overview.
        </p>

        {/* Unified Search */}
        <div className="mt-4">
          <div className="max-w-xl">
            <label className="sr-only">Search all</label>
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certifications, degrees, todos, goals, notes..."
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void doUnifiedSearch();
                  }
                }}
              />
              <button
                onClick={() => void doUnifiedSearch()}
                className="absolute right-1 top-1 bottom-1 px-3 rounded-r-lg bg-blue-600 text-white"
                aria-label="Search"
              >
                Search
              </button>
            </div>
            {searching && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Results</h3>
                <ul className="space-y-2 max-h-56 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <li key={i} className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-medium">{r.title}</span>
                      <span className="text-xs text-gray-500 ml-2">({r.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Certifications"
          value={stats?.certCount || 0}
          icon={<FileText className="w-6 h-6" />}
        />
        <Card
          title="Degrees"
          value={stats?.degreeCount || 0}
          icon={<BookOpen className="w-6 h-6" />}
        />
        <Card
          title="Tasks Completed"
          value={`${stats?.completedTodos || 0}/${stats?.totalTodos || 0}`}
          icon={<CheckSquare className="w-6 h-6" />}
        />
        <Card
          title="Upcoming Goals"
          value={stats?.upcomingGoals || 0}
          icon={<Target className="w-6 h-6" />}
        />
      </div>

      {/* CV Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resume / CV</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload your latest CV so it can be easily shared or downloaded.</p>
          </div>
          <div className="flex items-center gap-3">
            {cv ? (
              <a
                href={buildFileUrl(cv.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                View CV
              </a>
            ) : (
              <span className="text-sm text-gray-500">No CV uploaded</span>
            )}

            <input
              ref={cvInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleCvChange(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => cvInputRef.current?.click()}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              {cvUploading ? 'Uploading...' : 'Upload CV'}
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Tasks */}
      {stats?.todaysTodos && stats.todaysTodos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Tasks
          </h2>
          <div className="space-y-2">
            {stats.todaysTodos.map((todo) => (
              <div
                key={todo._id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <input type="checkbox" className="w-4 h-4" />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">{todo.task}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Priority: {todo.priority}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {todo.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
