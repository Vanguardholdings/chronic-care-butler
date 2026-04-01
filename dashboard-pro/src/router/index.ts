import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: DashboardView,
    },
    {
      path: '/patients',
      name: 'Patients',
      component: () => import('@/views/PatientsView.vue'),
    },
    {
      path: '/adherence',
      name: 'Adherence',
      component: () => import('@/views/AdherenceView.vue'),
    },
    {
      path: '/queue',
      name: 'Queue',
      component: () => import('@/views/QueueView.vue'),
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('@/views/ReportsView.vue'),
    },
  ],
})

export default router
