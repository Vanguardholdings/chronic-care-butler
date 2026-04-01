'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePatientStore } from '@/stores/patientStore';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, User, X, Users, UserCheck } from 'lucide-react';

interface PatientFormData {
  name: string;
  age: number;
  gender: 'male' | 'female';
  condition: string;
  status: 'stable' | 'critical' | 'recovering';
  room?: string;
  doctor?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function PatientsPage() {
  const t = useTranslations('patients');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { token, user } = useAuthStore();
  const { patients, isLoading, error, fetchPatients, addPatient, updatePatient } = usePatientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningPatient, setAssigningPatient] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: 0,
    gender: 'male',
    condition: '',
    status: 'stable',
    room: '',
    doctor: '',
  });

  const isAdmin = user?.role === 'admin';
  const isNurse = user?.role === 'nurse';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    if (token) {
      fetchPatients(token);
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [token, fetchPatients, isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.condition?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, formData, token);
      } else {
        await addPatient(formData, token);
      }
      setShowModal(false);
      setEditingPatient(null);
      setFormData({ name: '', age: 0, gender: 'male', condition: '', status: 'stable', room: '', doctor: '' });
    } catch (err) {
      console.error('Failed to save patient:', err);
    }
  };

  const handleAssign = async (userId: string, type: 'nurse' | 'staff') => {
    if (!token || !assigningPatient) return;
    
    try {
      const endpoint = type === 'nurse' ? 'assign-nurse' : 'assign-staff';
      const response = await fetch(`http://localhost:3001/api/patients/${assigningPatient.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ [type === 'nurse' ? 'nurseId' : 'staffId']: userId }),
      });
      
      if (response.ok) {
        await fetchPatients(token);
      }
    } catch (err) {
      console.error('Failed to assign:', err);
    }
  };

  const handleUnassign = async (userId: string, type: 'nurse' | 'staff') => {
    if (!token || !assigningPatient) return;
    
    try {
      const endpoint = type === 'nurse' ? 'unassign-nurse' : 'unassign-staff';
      const response = await fetch(`http://localhost:3001/api/patients/${assigningPatient.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ [type === 'nurse' ? 'nurseId' : 'staffId']: userId }),
      });
      
      if (response.ok) {
        await fetchPatients(token);
      }
    } catch (err) {
      console.error('Failed to unassign:', err);
    }
  };

  const openEditModal = (patient: any) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age || 0,
      gender: patient.gender || 'male',
      condition: patient.condition || '',
      status: patient.status || 'stable',
      room: patient.room || '',
      doctor: patient.doctor || '',
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({ name: '', age: 0, gender: 'male', condition: '', status: 'stable', room: '', doctor: '' });
    setShowModal(true);
  };

  const openAssignModal = (patient: any) => {
    setAssigningPatient(patient);
    setShowAssignModal(true);
  };

  const statusLabel = (status: string) => {
    if (status === 'stable') return t('stable');
    if (status === 'critical') return t('critical');
    return t('recovering');
  };

  const nurses = users.filter(u => u.role === 'nurse');
  const staff = users.filter(u => u.role === 'staff');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {isNurse || isStaff ? t('myPatients', { count: patients.length }) : t('totalCount', { count: patients.length })}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('addPatient')}</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search')}
          className="input-glass pl-10 w-full max-w-md"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* Patients Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg">
                    {patient.name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{patient.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {patient.age}{locale === 'zh' ? '岁' : 'y'} · {patient.gender === 'male' ? t('male') : t('female')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => openEditModal(patient)}
                        className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openAssignModal(patient)}
                        className="p-2 rounded-lg hover:bg-white/10 text-blue-500"
                        title="Assign Staff"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/10 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-glass)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{t('condition')}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{patient.condition}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-[var(--text-secondary)]">{t('status')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    patient.status === 'stable' ? 'bg-green-500/20 text-green-500' :
                    patient.status === 'critical' ? 'bg-red-500/20 text-red-500' :
                    'bg-orange-500/20 text-orange-500'
                  }`}>
                    {statusLabel(patient.status)}
                  </span>
                </div>
                {patient.room && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-[var(--text-secondary)]">{t('room')}</span>
                    <span className="text-sm text-[var(--text-primary)]">{patient.room}</span>
                  </div>
                )}
                {patient.doctor && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-[var(--text-secondary)]">{t('doctor')}</span>
                    <span className="text-sm text-[var(--text-primary)]">{patient.doctor}</span>
                  </div>
                )}
                
                {/* Assigned Staff Info */}
                {(patient.assignedNurses?.length > 0 || patient.assignedStaff?.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-glass)]">
                    {patient.assignedNurses?.length > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)]">
                        <UserCheck className="w-3 h-3" />
                        <span>
                          {locale === 'zh' ? '护士: ' : 'Nurses: '}
                          {patient.assignedNurses.map((n: any) => n.name || n).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-secondary)]">{tCommon('noData')}</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && isAdmin && (
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
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {editingPatient ? t('editPatient') : t('addPatient')}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('name')}</label>
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
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('age')}</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className="input-glass"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('gender')}</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                      className="input-glass"
                    >
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('condition')}</label>
                  <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="input-glass"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input-glass"
                  >
                    <option value="stable">{t('stable')}</option>
                    <option value="critical">{t('critical')}</option>
                    <option value="recovering">{t('recovering')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('room')}</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('doctor')}</label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="input-glass"
                  />
                </div>

                <div className="pt-4 flex space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                    {tCommon('cancel')}
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingPatient ? tCommon('save') : tCommon('add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Staff Modal */}
      <AnimatePresence>
        {showAssignModal && isAdmin && assigningPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {locale === 'zh' ? '分配医护人员' : 'Assign Staff'} - {assigningPatient.name}
                </h2>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nurses Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  {locale === 'zh' ? '护士' : 'Nurses'}
                </h3>
                <div className="space-y-2">
                  {nurses.map((nurse) => {
                    const isAssigned = assigningPatient.assignedNurses?.some(
                      (n: any) => (n.id || n._id || n) === nurse.id
                    );
                    return (
                      <div key={nurse.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{nurse.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{nurse.email}</p>
                        </div>
                        <button
                          onClick={() => isAssigned 
                            ? handleUnassign(nurse.id, 'nurse') 
                            : handleAssign(nurse.id, 'nurse')
                          }
                          className={`px-3 py-1 rounded-lg text-sm ${
                            isAssigned 
                              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          }`}
                        >
                          {isAssigned 
                            ? (locale === 'zh' ? '移除' : 'Remove')
                            : (locale === 'zh' ? '分配' : 'Assign')
                          }
                        </button>
                      </div>
                    );
                  })}
                  {nurses.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">
                      {locale === 'zh' ? '没有护士账户' : 'No nurse accounts'}
                    </p>
                  )}
                </div>
              </div>

              {/* Staff Section */}
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  {locale === 'zh' ? '工作人员' : 'Staff'}
                </h3>
                <div className="space-y-2">
                  {staff.map((s) => {
                    const isAssigned = assigningPatient.assignedStaff?.some(
                      (st: any) => (st.id || st._id || st) === s.id
                    );
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{s.email}</p>
                        </div>
                        <button
                          onClick={() => isAssigned 
                            ? handleUnassign(s.id, 'staff') 
                            : handleAssign(s.id, 'staff')
                          }
                          className={`px-3 py-1 rounded-lg text-sm ${
                            isAssigned 
                              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          }`}
                        >
                          {isAssigned 
                            ? (locale === 'zh' ? '移除' : 'Remove')
                            : (locale === 'zh' ? '分配' : 'Assign')
                          }
                        </button>
                      </div>
                    );
                  })}
                  {staff.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">
                      {locale === 'zh' ? '没有工作人员账户' : 'No staff accounts'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
