'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';

const ROLE_KEY: Record<string, string> = {
  admin: 'admin',
  nurse: 'nurse',
  doctor: 'doctor',
};
import { 
  LayoutDashboard, 
  Users, 
  Pill, 
  Calendar, 
  FileText, 
  ActivitySquare,
  LogOut,
  Settings
} from 'lucide-react';

export function Sidebar() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { href: `/${locale}/dashboard`, icon: LayoutDashboard, label: t('dashboard') },
    { href: `/${locale}/patients`, icon: Users, label: t('patients') },
    { href: `/${locale}/medications`, icon: Pill, label: t('medications') },
    { href: `/${locale}/appointments`, icon: Calendar, label: t('appointments') },
    { href: `/${locale}/reports`, icon: FileText, label: t('reports') },
    { href: `/${locale}/settings`, icon: Settings, label: t('settings') },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[var(--sidebar-width)] glass border-r border-[var(--border-glass)] z-40">
      <div className="flex flex-col h-full">
        {/* User info */}
        <div className="p-4 border-b border-[var(--border-glass)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {tAuth(ROLE_KEY[user?.role || 'doctor'] || 'doctor')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'gradient-bg text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[var(--border-glass)]">
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
