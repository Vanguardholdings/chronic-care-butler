<template>
  <aside class="w-64 bg-white dark:bg-slate-800 border-r border-healthcare-border dark:border-healthcare-border-dark flex flex-col">
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-healthcare-border dark:border-healthcare-border-dark">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-healthcare-text dark:text-healthcare-text-dark">慢病管家</h1>
          <p class="text-xs text-healthcare-muted dark:text-healthcare-muted-dark">Chronic Care</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
          $route.path === item.path
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
            : 'text-healthcare-text dark:text-healthcare-text-dark hover:bg-healthcare-bg dark:hover:bg-slate-700'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
        <span
          v-if="item.badge"
          class="ml-auto bg-danger-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
        >
          {{ item.badge }}
        </span>
      </router-link>
    </nav>

    <!-- Bottom Section -->
    <div class="p-4 border-t border-healthcare-border dark:border-healthcare-border-dark">
      <button
        @click="themeStore.toggleTheme"
        class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-healthcare-text dark:text-healthcare-text-dark hover:bg-healthcare-bg dark:hover:bg-slate-700 transition-colors"
      >
        <svg v-if="themeStore.isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        {{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useDashboardStore } from '@/stores/dashboard'

const themeStore = useThemeStore()
const dashboardStore = useDashboardStore()

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'HomeIcon' },
  { name: 'Patients', path: '/patients', icon: 'UsersIcon' },
  { name: 'Adherence', path: '/adherence', icon: 'ChartIcon' },
  { name: 'Queue', path: '/queue', icon: 'QueueIcon', badge: dashboardStore.urgentTasks.length },
  { name: 'Reports', path: '/reports', icon: 'ReportIcon' },
]
</script>
