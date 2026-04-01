'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');

  const toggleLocale = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    // Remove current locale from pathname and add new one
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    // Use replace instead of push to avoid history entry
    router.replace(newPathname);
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleLocale}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2"
        aria-label={t(locale)}
      >
        <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
        <span className="text-sm font-medium text-[var(--text-secondary)] uppercase">
          {locale}
        </span>
      </button>
    </div>
  );
}
