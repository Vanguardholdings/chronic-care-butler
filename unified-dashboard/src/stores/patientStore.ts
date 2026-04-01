import { create } from 'zustand';
import { patientsApi } from '@/lib/api/client';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: 'stable' | 'critical' | 'recovering';
  lastVisit?: string;
  email?: string;
  phone?: string;
  room?: string;
  doctor?: string;
  assignedNurses?: string[];
  assignedStaff?: string[];
}

interface PatientFormData {
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: 'stable' | 'critical' | 'recovering';
  [key: string]: any;
}

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  fetchPatients: (token: string) => Promise<void>;
  selectPatient: (patient: Patient | null) => void;
  addPatient: (patient: PatientFormData, token: string) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>, token: string) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  selectedPatient: null,
  isLoading: false,
  error: null,

  fetchPatients: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await patientsApi.getAll(token);
      set({ patients: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectPatient: (patient) => {
    set({ selectedPatient: patient });
  },

  addPatient: async (patient, token) => {
    set({ isLoading: true });
    try {
      const response = await patientsApi.create(patient, token);
      set((state) => ({
        patients: [...state.patients, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updatePatient: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await patientsApi.update(id, data, token);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? response.data : p)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
