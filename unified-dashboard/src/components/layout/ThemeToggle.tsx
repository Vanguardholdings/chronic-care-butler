'use client';

import { useThemeStore } from '@/stores/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('theme');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-[var(--bg-glass)]" />
    );
  }

  return (
    <div className="relative group">
      <button
        className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2"
        aria-label={t(theme)}
      >
        {theme === 'light' && <Sun className="w-5 h-5 text-[var(--text-secondary)]" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-[var(--text-secondary)]" />}
        {theme === 'system' && <Monitor className="w-5 h-5 text-[var(--text-secondary)]" />}
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-40 glass-card py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <button
          onClick={() => setTheme('light')}
          className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-white/10 ${theme === 'light' ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          <Sun className="w-4 h-4" />
          <span>{t('light')}</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-white/10 ${theme === 'dark' ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          <Moon className="w-4 h-4" />
          <span>{t('dark')}</span>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-white/10 ${theme === 'system' ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          <Monitor className="w-4 h-4" />
          <span>{t('system')}</span>
        </button>
      </div>
    </div>
  );
}
