// src/composables/useDashboardData.ts
import { ref, reactive, onMounted } from 'vue'

export interface Patient {
  id: string
  name: string
  age: number
  condition: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastVisit: string
  nextAppointment: string
  avatar: string
  vitals: {
    bloodPressure: string
    heartRate: number
    glucose: number
    oxygenSat: number
  }
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
  adherence: number
  status: 'active' | 'paused' | 'completed'
  refillDate: string
  sideEffects: string[]
}

export interface Appointment {
  id: string
  patientName: string
  doctor: string
  type: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress'
  isVirtual: boolean
}

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  patientId: string
  acknowledged: boolean
}

export interface ActivityItem {
  id: string
  action: string
  details: string
  timestamp: string
  icon: string
  color: string
}

export interface DashboardStats {
  totalPatients: number
  activeAlerts: number
  appointmentsToday: number
  medicationAdherence: number
  riskPatients: number
  completedVisits: number
}

export function useDashboardData() {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const hasData = ref(true)

  const stats = reactive<DashboardStats>({
    totalPatients: 0,
    activeAlerts: 0,
    appointmentsToday: 0,
    medicationAdherence: 0,
    riskPatients: 0,
    completedVisits: 0
  })

  const patients = ref<Patient[]>([])
  const medications = ref<Medication[]>([])
  const appointments = ref<Appointment[]>([])
  const alerts = ref<Alert[]>([])
  const activities = ref<ActivityItem[]>([])

  const weeklyData = ref<number[]>([])
  const monthlyTrend = ref<number[]>([])

  async function loadData() {
    loading.value = true
    error.value = null

    try {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1200))

      stats.totalPatients = 1247
      stats.activeAlerts = 8
      stats.appointmentsToday = 23
      stats.medicationAdherence = 87
      stats.riskPatients = 14
      stats.completedVisits = 156

      patients.value = [
        {
          id: 'p1',
          name: 'Eleanor Mitchell',
          age: 72,
          condition: 'Type 2 Diabetes, Hypertension',
          riskLevel: 'high',
          lastVisit: '2024-01-15',
          nextAppointment: '2024-02-01',
          avatar: 'EM',
          vitals: { bloodPressure: '142/88', heartRate: 78, glucose: 186, oxygenSat: 96 }
        },
        {
          id: 'p2',
          name: 'James Chen',
          age: 65,
          condition: 'COPD, Heart Failure',
          riskLevel: 'critical',
          lastVisit: '2024-01-18',
          nextAppointment: '2024-01-25',
          avatar: 'JC',
          vitals: { bloodPressure: '158/95', heartRate: 92, glucose: 124, oxygenSat: 91 }
        },
        {
          id: 'p3',
          name: 'Maria Santos',
          age: 58,
          condition: 'Rheumatoid Arthritis',
          riskLevel: 'medium',
          lastVisit: '2024-01-12',
          nextAppointment: '2024-02-10',
          avatar: 'MS',
          vitals: { bloodPressure: '128/82', heartRate: 72, glucose: 98, oxygenSat: 98 }
        },
        {
          id: 'p4',
          name: 'Robert Park',
          age: 44,
          condition: 'Asthma, Anxiety',
          riskLevel: 'low',
          lastVisit: '2024-01-20',
          nextAppointment: '2024-03-05',
          avatar: 'RP',
          vitals: { bloodPressure: '118/76', heartRate: 68, glucose: 92, oxygenSat: 99 }
        },
        {
          id: 'p5',
          name: 'Dorothy Williams',
          age: 81,
          condition: 'Alzheimer\'s, Osteoporosis',
          riskLevel: 'high',
          lastVisit: '2024-01-10',
          nextAppointment: '2024-01-28',
          avatar: 'DW',
          vitals: { bloodPressure: '136/84', heartRate: 74, glucose: 110, oxygenSat: 95 }
        }
      ]

      medications.value = [
        {
          id: 'm1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily',
          time: '08:00, 20:00', adherence: 92, status: 'active',
          refillDate: '2024-02-15', sideEffects: ['Nausea', 'Diarrhea']
        },
        {
          id: 'm2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily',
          time: '09:00', adherence: 88, status: 'active',
          refillDate: '2024-02-20', sideEffects: ['Dry cough', 'Dizziness']
        },
        {
          id: 'm3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily',
          time: '21:00', adherence: 95, status: 'active',
          refillDate: '2024-03-01', sideEffects: ['Muscle pain']
        },
        {
          id: 'm4', name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed',
          time: 'PRN', adherence: 76, status: 'active',
          refillDate: '2024-02-10', sideEffects: ['Tremor', 'Rapid heartbeat']
        },
        {
          id: 'm5', name: 'Prednisone', dosage: '5mg', frequency: 'Once daily',
          time: '08:00', adherence: 84, status: 'paused',
          refillDate: '—', sideEffects: ['Weight gain', 'Insomnia']
        }
      ]

      appointments.value = [
        {
          id: 'a1', patientName: 'James Chen', doctor: 'Dr. Sarah Kim',
          type: 'Cardiology Follow-up', date: '2024-01-25', time: '09:00 AM',
          status: 'scheduled', isVirtual: false
        },
        {
          id: 'a2', patientName: 'Eleanor Mitchell', doctor: 'Dr. Michael Torres',
          type: 'Diabetes Management', date: '2024-01-25', time: '10:30 AM',
          status: 'in-progress', isVirtual: true
        },
        {
          id: 'a3', patientName: 'Dorothy Williams', doctor: 'Dr. Lisa Wang',
          type: 'Neurology Check-up', date: '2024-01-28', time: '02:00 PM',
          status: 'scheduled', isVirtual: false
        },
        {
          id: 'a4', patientName: 'Maria Santos', doctor: 'Dr. James Park',
          type: 'Rheumatology Review', date: '2024-01-22', time: '11:00 AM',
          status: 'completed', isVirtual: true
        },
        {
          id: 'a5', patientName: 'Robert Park', doctor: 'Dr. Emily Brown',
          type: 'General Check-up', date: '2024-01-20', time: '03:30 PM',
          status: 'completed', isVirtual: false
        }
      ]

      alerts.value = [
        {
          id: 'al1', type: 'critical',
          title: 'Critical Vitals — James Chen',
          message: 'Blood pressure reading 158/95 mmHg exceeds critical threshold. O2 saturation at 91%.',
          timestamp: '5 min ago', patientId: 'p2', acknowledged: false
        },
        {
          id: 'al2', type: 'warning',
          title: 'Missed Medication — Eleanor Mitchell',
          message: 'Evening Metformin dose was not confirmed. 2 hours overdue.',
          timestamp: '2 hours ago', patientId: 'p1', acknowledged: false
        },
        {
          id: 'al3', type: 'warning',
          title: 'Glucose Spike — Eleanor Mitchell',
          message: 'Blood glucose at 186 mg/dL, above target range of 80-130 mg/dL.',
          timestamp: '3 hours ago', patientId: 'p1', acknowledged: true
        },
        {
          id: 'al4', type: 'info',
          title: 'Prescription Refill Due',
          message: 'Albuterol Inhaler refill needed by Feb 10 for Robert Park.',
          timestamp: '1 day ago', patientId: 'p4', acknowledged: false
        },
        {
          id: 'al5', type: 'critical',
          title: 'Fall Risk — Dorothy Williams',
          message: 'Activity sensor detected unusual pattern. Possible fall event at 14:23.',
          timestamp: '30 min ago', patientId: 'p5', acknowledged: false
        }
      ]

      activities.value = [
        { id: 'ac1', action: 'Vitals Recorded', details: 'James Chen — BP 158/95, HR 92, SpO2 91%', timestamp: '5 min ago', icon: 'mdi-heart-pulse', color: '#ef4444' },
        { id: 'ac2', action: 'Appointment Completed', details: 'Maria Santos — Rheumatology Review with Dr. Park', timestamp: '1 hour ago', icon: 'mdi-calendar-check', color: '#10b981' },
        { id: 'ac3', action: 'Medication Administered', details: 'Eleanor Mitchell — Metformin 500mg (morning)', timestamp: '2 hours ago', icon: 'mdi-pill', color: '#6366f1' },
        { id: 'ac4', action: 'Lab Results Available', details: 'Robert Park — Complete Blood Count normal', timestamp: '3 hours ago', icon: 'mdi-flask', color: '#f59e0b' },
        { id: 'ac5', action: 'Care Plan Updated', details: 'Dorothy Williams — Added fall prevention protocol', timestamp: '4 hours ago', icon: 'mdi-clipboard-text', color: '#2563eb' },
        { id: 'ac6', action: 'New Patient Registered', details: 'Thomas Rivera — Chronic Kidney Disease Stage 3', timestamp: '5 hours ago', icon: 'mdi-account-plus', color: '#10b981' },
        { id: 'ac7', action: 'Alert Acknowledged', details: 'Dr. Kim acknowledged critical vitals for J. Chen', timestamp: '6 hours ago', icon: 'mdi-bell-check', color: '#64748b' }
      ]

      weeklyData.value = [42, 38, 51, 47, 53, 44, 49]
      monthlyTrend.value = [82, 84, 83, 87, 85, 89, 87, 91, 88, 90, 87, 92]

      hasData.value = true
    } catch (e) {
      error.value = 'Failed to load dashboard data. Please try again.'
    } finally {
      loading.value = false
    }
  }

  function acknowledgeAlert(alertId: string) {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) alert.acknowledged = true
  }

  function simulateEmpty() {
    hasData.value = false
    patients.value = []
    medications.value = []
    appointments.value = []
    alerts.value = []
    activities.value = []
  }

  function simulateError() {
    error.value = 'Connection lost. Unable to fetch real-time data from the healthcare network.'
  }

  onMounted(loadData)

  return {
    loading,
    error,
    hasData,
    stats,
    patients,
    medications,
    appointments,
    alerts,
    activities,
    weeklyData,
    monthlyTrend,
    loadData,
    acknowledgeAlert,
    simulateEmpty,
    simulateError
  }
}