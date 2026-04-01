'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Moon, Globe, Save, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('profile');
  const t = useTranslations('settings');

  const tabs = [
    { id: 'profile', label: t('profileTab'), icon: User },
    { id: 'notifications', label: t('notificationsTab'), icon: Bell },
    { id: 'security', label: t('securityTab'), icon: Shield },
    { id: 'appearance', label: t('appearanceTab'), icon: Moon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <p className="text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'gradient-bg text-white'
                      : 'text-[var(--text-secondary)] hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('profileTitle')}</h2>
                
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-[var(--text-primary)]">{user?.name}</p>
                    <p className="text-[var(--text-secondary)]">{user?.email}</p>
                    <p className="text-sm text-[var(--text-muted)] capitalize">{user?.role}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('nameLabel')}</label>
                    <input type="text" defaultValue={user?.name} className="input-glass" />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('emailLabel')}</label>
                    <input type="email" defaultValue={user?.email} className="input-glass" readOnly />
                  </div>
                </div>

                <button className="btn-primary flex items-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>{t('saveChanges')}</span>
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('notificationsTitle')}</h2>
                
                {[
                  { id: 'email', label: t('emailNotif'), desc: t('emailNotifDesc') },
                  { id: 'push', label: t('pushNotif'), desc: t('pushNotifDesc') },
                  { id: 'sms', label: t('smsNotif'), desc: t('smsNotifDesc') },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-[var(--border-glass)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('securityTitle')}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('currentPassword')}</label>
                    <input type="password" className="input-glass" placeholder={t('currentPasswordPlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('newPassword')}</label>
                    <input type="password" className="input-glass" placeholder={t('newPasswordPlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('confirmPassword')}</label>
                    <input type="password" className="input-glass" placeholder={t('confirmPasswordPlaceholder')} />
                  </div>
                </div>

                <button className="btn-primary">{t('updatePassword')}</button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('appearanceTitle')}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[var(--border-glass)]">
                    <div className="flex items-center space-x-3">
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{t('darkMode')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('darkModeDesc')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="relative inline-flex items-center cursor-pointer"
                    >
                      <div className={`w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
