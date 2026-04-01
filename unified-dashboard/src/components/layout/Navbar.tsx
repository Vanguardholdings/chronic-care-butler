'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { ActivitySquare, User, LogOut } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <ActivitySquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              {t('appName')}
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LanguageToggle />
            
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[var(--text-secondary)] hidden md:block">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="btn-primary text-sm"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
