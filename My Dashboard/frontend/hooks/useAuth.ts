// src/hooks/useAuth.ts
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { authAPI } from '@/lib/api';

export function useAuth() {
  const { user, token, logout, setAuth, updateUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  const handleUpdateProfile = useCallback(
    async (data: any) => {
      try {
        const response = await authAPI.updateProfile(data);
        updateUser(response.data.data);
        return response.data.data;
      } catch (error) {
        throw error;
      }
    },
    [updateUser]
  );

  return {
    user,
    token,
    logout: handleLogout,
    setAuth,
    updateProfile: handleUpdateProfile,
  };
}
