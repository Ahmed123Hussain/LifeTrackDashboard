'use client';

import { useEffect, useState } from 'react';
import { todoAPI } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PreviewModal } from '@/components/PreviewModal';
import { Trash2, Plus, CheckSquare, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Todo {
  _id: string;
  task: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  deadline?: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    task: '',
    priority: 'medium',
    status: 'pending',
    deadline: '',
  });

  useEffect(() => {
    fetchTodos();
  }, [filterStatus, filterPriority]);

  const fetchTodos = async () => {
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;

      const response = await todoAPI.getAll(params);
      setTodos(response.data.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await todoAPI.update(editingId, formData);
        setTodos(todos.map((t) => (t._id === editingId ? { ...t, ...(formData as Partial<Todo>) } : t)));
      } else {
        const response = await todoAPI.create(formData);
        setTodos([response.data.data, ...todos]);
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save todo:', error);
      alert('Failed to save todo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await todoAPI.delete(id);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const filteredTodos = () => {
    let list = todos;
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => (t.task || '').toLowerCase().includes(q));
    }
    return list;
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo._id);
    setFormData({
      task: todo.task,
      priority: todo.priority,
      status: todo.status,
      deadline: todo.deadline ? todo.deadline.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      task: '',
      priority: 'medium',
      status: 'pending',
      deadline: '',
    });
    setEditingId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'pending':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Todos</h1>
          <div className="mt-3 max-w-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
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
          Add Todo
        </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : todos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No todos yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTodos().map((todo) => (
            <div
              key={todo._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {todo.task}
                  </h3>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(todo.status)}`}>
                      {todo.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                    {todo.deadline && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        Due: {format(new Date(todo.deadline), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedTodo(todo);
                      setPreviewOpen(true);
                    }}
                    className="text-sm"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(todo)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(todo._id)}
                    className="text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
        title={editingId ? 'Edit Todo' : 'Add Todo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task *</label>
            <input
              type="text"
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
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
        title={selectedTodo?.task || 'Preview'}
        content={[
          { label: 'Status', value: selectedTodo?.status },
          { label: 'Priority', value: selectedTodo?.priority },
          { label: 'Deadline', value: selectedTodo?.deadline ? format(new Date(selectedTodo.deadline), 'MMM d, yyyy') : 'No deadline' },
        ]}
      />
    </div>
  );
}
