'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

interface Alert {
  _id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  acknowledged: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { token, user } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAlerts();
      // Poll every 30 seconds
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/alerts?limit=5&acknowledged=false', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
        setUnreadCount(data.pagination?.total || data.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 glass-card z-50"
          >
            <div className="p-3 border-b border-[var(--border-glass)]">
              <h3 className="font-semibold text-[var(--text-primary)]">
                Notifications
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="p-4 text-center text-[var(--text-muted)]">
                  No new notifications
                </p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-3 border-b border-[var(--border-glass)] hover:bg-white/5"
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(alert.priority)}`} />
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-primary)]">
                          {alert.message}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(alert._id)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
