'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Bell, 
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAlerts: number;
  medicationAdherence: number;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { user, token } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAlerts: 0,
    medicationAdherence: 94,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchPatients(token!),
        fetchAppointments(token!),
      ]);
      
      // Calculate real stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(a => 
        a.dateTime.startsWith(today)
      ).length;
      
      setStats({
        totalPatients: patients.length,
        todayAppointments,
        pendingAlerts: 7, // Will be from alert store
        medicationAdherence: 94, // Calculate from medication adherence
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: t('stats.totalPatients'), value: stats.totalPatients.toLocaleString(), change: '+12%', color: 'blue' },
    { icon: Calendar, label: t('stats.todayAppointments'), value: stats.todayAppointments.toString(), change: '+5%', color: 'green' },
    { icon: Bell, label: t('stats.pendingAlerts'), value: stats.pendingAlerts.toString(), change: '-3', color: 'orange' },
    { icon: TrendingUp, label: t('stats.medicationAdherence'), value: `${stats.medicationAdherence}%`, change: '+2%', color: 'purple' },
  ];

  const recentPatients = patients.slice(0, 4);

  const statusLabel = (status: string) => {
    if (status === 'stable') return t('statusStable');
    if (status === 'critical') return t('statusCritical');
    return t('statusRecovering');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {t('welcome')}{locale === 'zh' ? '，' : ', '}{user?.name || t('defaultUser')}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-orange-500'}`}>
                    {stat.change} {t('vsLastWeek')}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                  stat.color === 'green' ? 'bg-green-500/20 text-green-500' :
                  stat.color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
                  'bg-purple-500/20 text-purple-500'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t('recentPatients')}
            </h2>
            <button className="text-sm text-[var(--color-primary)] hover:underline">
              {t('viewAll')}
            </button>
          </div>
          {recentPatients.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              {tCommon('noData')}
            </div>
          ) : (
            <div className="space-y-4">
              {recentPatients.map((patient, index) => (
                <div 
                  key={patient.id || index}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {patient.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{patient.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {patient.age}{locale === 'zh' ? '岁' : 'y'} · {patient.condition}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      patient.status === 'stable' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-orange-500/20 text-orange-500'
                    }`}>
                      {statusLabel(patient.status)}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {patient.lastVisit || tCommon('noData')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            {t('quickActions')}
          </h2>
          <div className="space-y-3">
            {[
              { icon: Users, label: t('addPatient'), color: 'blue', href: '/patients' },
              { icon: Calendar, label: t('scheduleAppt'), color: 'green', href: '/appointments' },
              { icon: Activity, label: t('recordVitals'), color: 'purple', href: '/patients' },
              { icon: AlertCircle, label: t('viewAlerts'), color: 'orange', href: '/dashboard' },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <a
                  key={index}
                  href={action.href}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors text-left block"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    action.color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                    action.color === 'green' ? 'bg-green-500/20 text-green-500' :
                    action.color === 'purple' ? 'bg-purple-500/20 text-purple-500' :
                    'bg-orange-500/20 text-orange-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{action.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
