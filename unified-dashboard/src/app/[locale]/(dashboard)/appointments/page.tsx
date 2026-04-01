'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePatientStore } from '@/stores/patientStore';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, CheckCircle, XCircle, X } from 'lucide-react';

interface Appointment {
  _id: string;
  patientId: string;
  patientName?: string;
  type: string;
  dateTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  doctor?: string;
}

interface AppointmentFormData {
  patientId: string;
  type: string;
  dateTime: string;
  notes: string;
  doctor: string;
}

export default function AppointmentsPage() {
  const t = useTranslations('appointments');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { token } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    type: 'followup',
    dateTime: '',
    notes: '',
    doctor: '',
  });

  useEffect(() => {
    if (token) {
      loadAppointments();
    }
  }, [token]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      await fetchPatients(token!);
      
      // Fetch appointments for each patient
      const allAppointments: Appointment[] = [];
      for (const patient of patients) {
        const response = await fetch(`http://localhost:3001/api/patients/${patient.id}/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            data.data.forEach((apt: any) => {
              allAppointments.push({
                _id: apt._id || apt.id,
                patientId: patient.id,
                patientName: patient.name,
                type: apt.type,
                dateTime: apt.dateTime,
                status: apt.status,
                notes: apt.notes,
                doctor: apt.doctor,
              });
            });
          }
        }
      }
      
      // Sort by date
      allAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      setAppointments(allAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.patientId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${formData.patientId}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status: 'scheduled',
        }),
      });
      
      if (response.ok) {
        await loadAppointments();
        setShowModal(false);
        setFormData({ patientId: '', type: 'followup', dateTime: '', notes: '', doctor: '' });
      }
    } catch (err) {
      console.error('Failed to create appointment:', err);
    }
  };

  const updateStatus = async (aptId: string, newStatus: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${aptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await loadAppointments();
      }
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const openAddModal = () => {
    setFormData({ 
      patientId: patients[0]?.id || '', 
      type: 'followup', 
      dateTime: new Date().toISOString().slice(0, 16), 
      notes: '', 
      doctor: '' 
    });
    setShowModal(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.dateTime.startsWith(today)).length;

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  const statusLabel = (status: string) => {
    if (status === 'confirmed') return t('statusConfirmed');
    if (status === 'scheduled') return t('statusPending');
    if (status === 'completed') return locale === 'zh' ? '已完成' : 'Completed';
    return t('statusCancelled');
  };

  const typeLabel = (type: string) => {
    if (type === 'followup') return t('typeFollowup');
    if (type === 'initial') return t('typeInitial');
    if (type === 'checkup') return t('typeCheckup');
    return type;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US'),
      time: date.toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {t('todayCount', { count: todayCount })}
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>{t('newAppointment')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: t('filterAll') },
          { key: 'confirmed', label: t('statusConfirmed') },
          { key: 'scheduled', label: t('statusPending') },
          { key: 'cancelled', label: t('statusCancelled') },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'gradient-bg text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            {tCommon('noData')}
          </div>
        ) : (
          filteredAppointments.map((apt, index) => {
            const { date, time } = formatDateTime(apt.dateTime);
            return (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {apt.patientName?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{apt.patientName}</h3>
                    <div className="flex items-center space-x-3 text-sm text-[var(--text-secondary)] mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </span>
                    </div>
                    {apt.doctor && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">{apt.doctor}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                    {typeLabel(apt.type)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                    apt.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                    apt.status === 'scheduled' ? 'bg-orange-500/20 text-orange-500' :
                    apt.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {apt.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                    {apt.status === 'scheduled' && <Clock className="w-4 h-4" />}
                    {apt.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                    <span>{statusLabel(apt.status)}</span>
                  </span>
                  
                  {apt.status === 'scheduled' && (
                    <>
                      <button 
                        onClick={() => updateStatus(apt._id, 'confirmed')}
                        className="p-2 rounded-lg hover:bg-white/10 text-green-500"
                        title="Confirm"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(apt._id, 'cancelled')}
                        className="p-2 rounded-lg hover:bg-white/10 text-red-500"
                        title="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('newAppointment')}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('patientCol')}</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="input-glass"
                    required
                  >
                    <option value="">{tCommon('select')}</option>
                    {patients.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('type')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-glass"
                  >
                    <option value="initial">{t('typeInitial')}</option>
                    <option value="followup">{t('typeFollowup')}</option>
                    <option value="checkup">{t('typeCheckup')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{locale === 'zh' ? '日期时间' : 'Date & Time'}</label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="input-glass"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('doctor')}</label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="input-glass"
                    placeholder={locale === 'zh' ? '医生姓名' : 'Doctor name'}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-glass min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div className="pt-4 flex space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                    {tCommon('cancel')}
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {tCommon('add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
