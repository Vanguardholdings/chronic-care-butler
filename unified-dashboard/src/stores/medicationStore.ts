import { create } from 'zustand';
import { medicationsApi } from '@/lib/api/client';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  patientId: string;
  patientName?: string;
  isActive: boolean;
  adherence: number;
}

interface MedicationState {
  medications: Medication[];
  selectedMedication: Medication | null;
  isLoading: boolean;
  error: string | null;
  fetchMedications: (token: string) => Promise<void>;
  fetchByPatient: (patientId: string, token: string) => Promise<void>;
  selectMedication: (med: Medication | null) => void;
  createMedication: (data: Omit<Medication, 'id'>, token: string) => Promise<void>;
  updateMedication: (id: string, data: Partial<Medication>, token: string) => Promise<void>;
  deleteMedication: (id: string, token: string) => Promise<void>;
  recordAdherence: (id: string, taken: boolean, token: string) => Promise<void>;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  selectedMedication: null,
  isLoading: false,
  error: null,

  fetchMedications: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      // Note: Backend doesn't have a /medications endpoint for all meds
      // We'll fetch from individual patients in the page
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchByPatient: async (patientId: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await medicationsApi.getByPatient(patientId, token);
      set({ medications: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectMedication: (med) => {
    set({ selectedMedication: med });
  },

  createMedication: async (data, token) => {
    set({ isLoading: true });
    try {
      const response = await medicationsApi.create(
        { ...data, patientId: data.patientId },
        token
      );
      set((state) => ({
        medications: [...state.medications, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateMedication: async (id, data, token) => {
    set({ isLoading: true });
    try {
      const response = await medicationsApi.update(id, data, token);
      set((state) => ({
        medications: state.medications.map((m) => (m.id === id ? response.data : m)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteMedication: async (id, token) => {
    set({ isLoading: true });
    try {
      await medicationsApi.delete(id, token);
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  recordAdherence: async (id, taken, token) => {
    try {
      await fetch(`http://localhost:3001/api/medications/${id}/adherence`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date: new Date().toISOString(), taken }),
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
