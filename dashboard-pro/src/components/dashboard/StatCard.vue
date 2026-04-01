<template>
  <div class="healthcare-card p-6">
    <div class="flex items-start justify-between">
      <div>
        <p class="stat-label">{{ title }}</p>
        <p class="stat-value mt-1">{{ value }}</p>
        <div class="flex items-center mt-2">
          <span
            :class="{
              'text-success-600 dark:text-success-400': change > 0,
              'text-danger-600 dark:text-danger-400': change < 0,
              'text-healthcare-muted': change === 0
            }"
            class="text-sm font-medium flex items-center"
          >
            <svg v-if="change > 0" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <svg v-else-if="change < 0" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {{ change > 0 ? '+' : '' }}{{ change }}%
          </span>
          <span class="text-healthcare-muted text-sm ml-2">{{ changeText }}</span>
        </div>
      </div>
      <div
        :class="{
          'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400': color === 'blue',
          'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400': color === 'green',
          'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400': color === 'yellow',
          'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400': color === 'red'
        }"
        class="w-12 h-12 rounded-xl flex items-center justify-center"
      >
        <svg v-if="icon === 'users'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else-if="icon === 'check'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="icon === 'clock'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="icon === 'alert'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  change: number
  changeText: string
  icon: 'users' | 'check' | 'clock' | 'alert'
  color: 'blue' | 'green' | 'yellow' | 'red'
}>()
</script>
