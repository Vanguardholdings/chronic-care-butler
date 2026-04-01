export interface Patient {
  id: string
  name: string
  avatar?: string
  age: number
  gender: 'male' | 'female'
  conditions: string[]
  room?: string
  bed?: string
  phone: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  wechatOpenid?: string
  caregiverOpenid?: string
  medications: Medication[]
  adherence: AdherenceRecord[]
  status: 'active' | 'inactive' | 'critical'
  lastCheckIn?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Medication {
  id: string
  name: string
  dosage: string
  purpose: string
  timeBucket: 'morning' | 'noon' | 'evening' | 'bedtime'
  withFood: boolean
  schedule: string[]
}

export interface AdherenceRecord {
  id: string
  patientId: string
  medicationId: string
  medicationName: string
  date: string
  timeBucket: string
  taken: boolean
  confirmedAt?: Date
  confirmedBy?: 'patient' | 'caregiver' | 'nurse'
  reason?: string
}

export interface Task {
  id: string
  patientId: string
  patientName: string
  type: 'medication' | 'followup' | 'appointment' | 'emergency'
  title: string
  description?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  dueAt: Date
  completedAt?: Date
  createdAt: Date
}

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'danger' | 'info'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

export interface AdherenceStats {
  totalPatients: number
  activePatients: number
  todayRate: number
  weeklyRate: number
  monthlyRate: number
  missedDoses: number
  pendingConfirmations: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'nurse' | 'admin' | 'doctor'
  department?: string
  shift?: 'day' | 'night'
}
