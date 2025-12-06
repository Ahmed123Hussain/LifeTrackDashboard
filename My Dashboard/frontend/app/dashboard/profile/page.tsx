'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Loader } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    theme: user?.theme || 'light',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.data);
      setIsModalOpen(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Profile Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white text-4xl font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Theme: {user?.theme}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="mb-6"
        >
          Edit Profile
        </Button>

        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme
            </label>
            <select
              value={formData.theme}
              onChange={(e) =>
                setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" isLoading={loading} className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
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
