'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  BarChart3,
  FileText,
  CheckSquare,
  Target,
  Settings,
  LogOut,
  Menu,
  X,
  Folder,
} from 'lucide-react';
import { Modal } from './Modal';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/dashboard/certifications', label: 'Certifications', icon: FileText },
    { href: '/dashboard/degrees', label: 'Degrees', icon: FileText },
    { href: '/dashboard/todos', label: 'Todos', icon: CheckSquare },
    { href: '/dashboard/notes', label: 'Notes', icon: FileText },
    { href: '/dashboard/goals', label: 'Goals', icon: Target },
    // Personal is handled specially: opens a password modal before navigation
    { href: '/dashboard/personal', label: 'Personal', icon: Folder, personal: true },
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => pathname === href;

  // Personal modal/password state (simple frontend-only check stored in localStorage)
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [personalInput, setPersonalInput] = useState('');

  const tryOpenPersonal = () => {
    // If the user is authenticated (logged in), allow access by default
    // — treat the login as the personal password by skipping the modal.
    if (isAuthenticated) {
      setIsOpen(false);
      router.push('/dashboard/personal');
      return;
    }

    // Reset input and show modal. We'll validate against localStorage value on submit.
    setPersonalInput('');
    setShowPersonalModal(true);
  };

  const submitPersonalPassword = () => {
    // Use stored password from localStorage; default fallback is 'password123'
    let stored = 'password123';
    try {
      if (typeof window !== 'undefined') {
        const s = localStorage.getItem('lc_personal_password');
        if (s && s.length > 0) stored = s;
      }
    } catch (e) {
      // ignore
    }

    if (personalInput === stored) {
      setShowPersonalModal(false);
      setTimeout(() => {
        setIsOpen(false);
        router.push('/dashboard/personal');
      }, 150);
    } else {
      // simple feedback
      alert('Incorrect password');
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8 mt-12 md:mt-0">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              LifeConsole
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon as any;
              const active = isActive(item.href);
              // Personal item is handled as a button that opens the password modal
              if ((item as any).personal) {
                return (
                  <button
                    key={item.href}
                    onClick={() => tryOpenPersonal()}
                    className={`flex items-center w-full text-left space-x-3 px-4 py-3 rounded-lg transition ${
                      active
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    active
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Personal password modal */}
          <Modal isOpen={showPersonalModal} onClose={() => setShowPersonalModal(false)} title="Enter Personal Password">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Please enter your personal password to continue.</p>
              <input
                autoFocus
                type="password"
                value={personalInput}
                onChange={(e) => setPersonalInput(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowPersonalModal(false)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800">Cancel</button>
                <button onClick={submitPersonalPassword} className="px-3 py-2 rounded bg-blue-600 text-white">Enter</button>
              </div>
            </div>
          </Modal>

          {/* User Section */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/dashboard/profile"
                className="flex-1 flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Profile</span>
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
