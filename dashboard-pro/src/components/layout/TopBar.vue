<template>
  <header class="h-16 bg-white dark:bg-slate-800 border-b border-healthcare-border dark:border-healthcare-border-dark flex items-center justify-between px-6">
    <!-- Search -->
    <div class="flex-1 max-w-xl">
      <div class="relative">
        <input
          type="text"
          placeholder="Search patients, medications..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-healthcare-border dark:border-healthcare-border-dark bg-healthcare-bg dark:bg-slate-700 text-healthcare-text dark:text-healthcare-text-dark focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <svg class="absolute left-3 top-2.5 w-5 h-5 text-healthcare-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-4">
      <!-- Notifications -->
      <button class="relative p-2 rounded-lg hover:bg-healthcare-bg dark:hover:bg-slate-700 transition-colors">
        <svg class="w-6 h-6 text-healthcare-muted dark:text-healthcare-muted-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span
          v-if="dashboardStore.unreadNotifications.length > 0"
          class="absolute top-1 right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {{ dashboardStore.unreadNotifications.length }}
        </span>
      </button>

      <!-- User Menu -->
      <div class="flex items-center gap-3 pl-4 border-l border-healthcare-border dark:border-healthcare-border-dark">
        <div class="text-right">
          <p class="text-sm font-medium text-healthcare-text dark:text-healthcare-text-dark">Vanguard Holdings</p>
          <p class="text-xs text-healthcare-muted dark:text-healthcare-muted-dark">Chief Executive Officer</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <span class="text-lg font-bold text-primary-700 dark:text-primary-300">V</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()
</script>
