'use client';

import { useEffect, useState } from 'react';
import { goalAPI } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PreviewModal } from '@/components/PreviewModal';
import { Trash2, Plus, Target, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  text: string;
  completed: boolean;
}

interface Goal {
  _id: string;
  title: string;
  description?: string;
  targetDate: string;
  milestones: Milestone[];
  progress: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    milestones: [] as { text: string; completed: boolean }[],
  });
  const [milestoneDraft, setMilestoneDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalAPI.getAll();
      setGoals(response.data.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await goalAPI.update(editingId, formData);
        setGoals(goals.map((g) => (g._id === editingId ? { ...g, ...formData } : g)));
      } else {
        const response = await goalAPI.create(formData);
        setGoals([response.data.data, ...goals]);
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await goalAPI.delete(id);
      setGoals(goals.filter((g) => g._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal._id);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate.split('T')[0],
      milestones: goal.milestones,
    });
    setIsModalOpen(true);
  };

  const filteredGoals = () => {
    if (!searchQuery || searchQuery.trim() === '') return goals;
    const q = searchQuery.toLowerCase();
    return goals.filter(
      (g) => (g.title || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q)
    );
  };

  const addMilestone = () => {
    if (milestoneDraft.trim()) {
      setFormData({
        ...formData,
        milestones: [
          ...formData.milestones,
          { text: milestoneDraft, completed: false },
        ],
      });
      setMilestoneDraft('');
    }
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const toggleMilestone = (index: number) => {
    const updated = [...formData.milestones];
    updated[index].completed = !updated[index].completed;
    setFormData({ ...formData, milestones: updated });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetDate: '',
      milestones: [],
    });
    setMilestoneDraft('');
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <div className="mt-3 max-w-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals..."
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
          Add Goal
        </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No goals yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGoals().map((goal) => (
            <div
              key={goal._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {goal.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setPreviewOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(goal)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(goal._id)}
                    className="text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Milestones */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Milestones
                  </h4>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          disabled
                          className="w-4 h-4"
                        />
                        <span
                          className={milestone.completed ? 'line-through text-gray-500' : ''}
                        >
                          {milestone.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        title={editingId ? 'Edit Goal' : 'Add Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
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
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Date *</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Milestones</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add milestone..."
                value={milestoneDraft}
                onChange={(e) => setMilestoneDraft(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
              />
              <Button type="button" onClick={addMilestone} className="text-sm">
                Add
              </Button>
            </div>

            {formData.milestones.length > 0 && (
              <div className="space-y-2">
                {formData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => toggleMilestone(index)}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">{milestone.text}</span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
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
    </div>
  );
}
