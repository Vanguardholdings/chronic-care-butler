import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Patient, Task, Notification, AdherenceStats } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  // Mock data for demonstration
  const stats = ref<AdherenceStats>({
    totalPatients: 156,
    activePatients: 142,
    todayRate: 87.5,
    weeklyRate: 82.3,
    monthlyRate: 85.1,
    missedDoses: 12,
    pendingConfirmations: 8,
  })

  const patients = ref<Patient[]>([
    {
      id: '1',
      name: '张建国',
      age: 68,
      gender: 'male',
      conditions: ['高血压', '糖尿病'],
      room: '301',
      bed: 'A',
      phone: '138****1234',
      status: 'active',
      medications: [],
      adherence: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: '李秀英',
      age: 72,
      gender: 'female',
      conditions: ['高血压'],
      room: '302',
      bed: 'B',
      phone: '139****5678',
      status: 'critical',
      medications: [],
      adherence: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const tasks = ref<Task[]>([
    {
      id: '1',
      patientId: '1',
      patientName: '张建国',
      type: 'medication',
      title: '未确认服药 - 降压药',
      priority: 'medium',
      status: 'pending',
      dueAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      patientId: '2',
      patientName: '李秀英',
      type: 'emergency',
      title: '紧急: 血压异常',
      priority: 'urgent',
      status: 'pending',
      dueAt: new Date(),
      createdAt: new Date(),
    },
  ])

  const notifications = ref<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: '未确认服药',
      message: '张建国 未确认服用降压药',
      read: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      type: 'danger',
      title: '紧急情况',
      message: '李秀英 血压异常升高',
      read: false,
      createdAt: new Date(),
    },
  ])

  const urgentTasks = computed(() => tasks.value.filter(t => t.priority === 'urgent' && t.status !== 'completed'))
  const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.read))

  const markTaskComplete = (taskId: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = 'completed'
      task.completedAt = new Date()
    }
  }

  const markNotificationRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  return {
    stats,
    patients,
    tasks,
    notifications,
    urgentTasks,
    pendingTasks,
    unreadNotifications,
    markTaskComplete,
    markNotificationRead,
  }
})
