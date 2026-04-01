import { create } from 'zustand';
import { appointmentsApi } from '@/lib/api/client';

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  type: string;
  dateTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  doctor?: string;
  location?: string;
  duration?: number;
}

interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  fetchAppointments: (token: string) => Promise<void>;
  fetchByPatient: (patientId: string, token: string) => Promise<void>;
  selectAppointment: (apt: Appointment | null) => void;
  createAppointment: (data: Omit<Appointment, 'id'>, token: string) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>, token: string) => Promise<void>;
  deleteAppointment: (id: string, token: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,

  fetchAppointments: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await appointmentsApi.getAll(token);
      set({ appointments: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchByPatient: async (patientId: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${patientId}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(r => r.json());
      set({ appointments: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectAppointment: (apt) => {
    set({ selectedAppointment: apt });
  },

  createAppointment: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await appointmentsApi.create(data, token);
      set((state) => ({
        appointments: [...state.appointments, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateAppointment: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await appointmentsApi.update(id, data, token);
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? response.data : a)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteAppointment: async (id, token) => {
    set({ isLoading: true });
    try {
      await fetch(`http://localhost:3001/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
