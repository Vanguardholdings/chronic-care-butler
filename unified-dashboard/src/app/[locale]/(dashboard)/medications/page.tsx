'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePatientStore } from '@/stores/patientStore';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pill, Clock, AlertCircle, CheckCircle, X, Edit2, Trash2 } from 'lucide-react';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  patientId: string;
  patientName?: string;
  adherence: number;
  isActive: boolean;
}

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  patientId: string;
  isActive: boolean;
}

export default function MedicationsPage() {
  const t = useTranslations('medications');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { token } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: '',
    patientId: '',
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      loadMedications();
    }
  }, [token]);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      await fetchPatients(token!);
      
      // Extract medications from patients
      const allMeds: Medication[] = [];
      patients.forEach((patient: any) => {
        if (patient.medications && Array.isArray(patient.medications)) {
          patient.medications.forEach((med: any) => {
            allMeds.push({
              _id: med._id || med.id,
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              patientId: patient.id,
              patientName: patient.name,
              adherence: med.adherence ? Math.round((med.adherence.filter((a: any) => a.taken).length / med.adherence.length) * 100) : 95,
              isActive: med.isActive !== false,
            });
          });
        }
      });
      setMedications(allMeds);
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.patientId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${formData.patientId}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await loadMedications();
        setShowModal(false);
        setFormData({ name: '', dosage: '', frequency: '', patientId: '', isActive: true });
      }
    } catch (err) {
      console.error('Failed to save medication:', err);
    }
  };

  const handleDelete = async (medId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/medications/${medId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        await loadMedications();
      }
    } catch (err) {
      console.error('Failed to delete medication:', err);
    }
  };

  const openAddModal = () => {
    setEditingMed(null);
    setFormData({ name: '', dosage: '', frequency: '', patientId: patients[0]?.id || '', isActive: true });
    setShowModal(true);
  };

  const activeMeds = medications.filter(m => m.isActive).length;
  const avgAdherence = medications.length > 0 
    ? Math.round(medications.reduce((sum, m) => sum + m.adherence, 0) / medications.length)
    : 0;

  const stats = [
    { label: t('activeMeds'), value: activeMeds.toString(), icon: Pill, color: 'blue' },
    { label: t('takenToday'), value: Math.round(activeMeds * 0.9).toString(), icon: CheckCircle, color: 'green' },
    { label: t('pendingReminders'), value: Math.round(activeMeds * 0.1).toString(), icon: Clock, color: 'orange' },
    { label: t('abnormalAlerts'), value: medications.filter(m => m.adherence < 80).length.toString(), icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>{t('addMedication')}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-card p-4 flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                stat.color === 'green' ? 'bg-green-500/20 text-green-500' :
                stat.color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Medications List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-glass)]">
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{t('medicationName')}</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{t('dosage')}</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{t('frequency')}</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{t('patientCol')}</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{t('adherence')}</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{t('status')}</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : medications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    {tCommon('noData')}
                  </td>
                </tr>
              ) : (
                medications.map((med, index) => (
                  <motion.tr
                    key={med._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[var(--border-glass)] hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Pill className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{med.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">{med.dosage}</td>
                    <td className="p-4 text-[var(--text-secondary)]">{med.frequency}</td>
                    <td className="p-4 text-[var(--text-primary)]">{med.patientName}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 rounded-full bg-[var(--bg-tertiary)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${med.adherence}%` }}
                          />
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">{med.adherence}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        med.isActive ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {med.isActive ? t('statusActive') : t('statusPaused')}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDelete(med._id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('addMedication')}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('medicationName')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-glass"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('dosage')}</label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      className="input-glass"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('frequency')}</label>
                    <input
                      type="text"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="input-glass"
                      required
                    />
                  </div>
                </div>

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
