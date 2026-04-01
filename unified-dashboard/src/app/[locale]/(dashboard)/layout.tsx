'use client';

import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const locale = useLocale();

  useEffect(() => {
    // Only redirect after hydration is complete
    if (hasHydrated && !isLoading && !isAuthenticated) {
      redirect(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, hasHydrated, locale]);

  // Show loading until hydration completes
  if (!hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <main className="flex-1 ml-[var(--sidebar-width)] p-6">
        {children}
      </main>
    </div>
  );
}
