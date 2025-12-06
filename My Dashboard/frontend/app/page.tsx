'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return null;
}
