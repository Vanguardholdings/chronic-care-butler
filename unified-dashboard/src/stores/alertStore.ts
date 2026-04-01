import { create } from 'zustand';
import { alertsApi } from '@/lib/api/client';

interface Alert {
  id: string;
  patientId: string;
  patientName?: string;
  type: 'medication' | 'appointment' | 'vital' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchAlerts: (token: string) => Promise<void>;
  markAsRead: (id: string, token: string) => Promise<void>;
  markAllAsRead: (token: string) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchAlerts: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await alertsApi.getAll(token);
      const alerts = response.data || [];
      const unreadCount = alerts.filter((a: Alert) => !a.isRead).length;
      set({ alerts, unreadCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (id, token) => {
    try {
      await alertsApi.markAsRead(id, token);
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markAllAsRead: async (token) => {
    try {
      const promises = get().alerts
        .filter((a) => !a.isRead)
        .map((a) => alertsApi.markAsRead(a.id, token));
      await Promise.all(promises);
      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
