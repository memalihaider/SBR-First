'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore(state => state.refreshUser);

  useEffect(() => {
    // Initialize authentication state on app load
    refreshUser();
  }, [refreshUser]);

  return <>{children}</>;
}