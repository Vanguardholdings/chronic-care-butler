<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-healthcare-text dark:text-healthcare-text-dark">Dashboard</h1>
        <p class="text-healthcare-muted dark:text-healthcare-muted-dark">Welcome back, here's what's happening today.</p>
      </div>
      <button class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Patient
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Patients"
        :value="dashboardStore.stats.totalPatients"
        :change="+5"
        changeText="from yesterday"
        icon="users"
        color="blue"
      />
      <StatCard
        title="Today's Adherence"
        :value="`${dashboardStore.stats.todayRate}%`"
        :change="+2.3"
        changeText="from yesterday"
        icon="check"
        color="green"
      />
      <StatCard
        title="Pending Tasks"
        :value="dashboardStore.pendingTasks.length"
        :change="0"
        changeText="requires attention"
        icon="clock"
        color="yellow"
      />
      <StatCard
        title="Critical Alerts"
        :value="dashboardStore.urgentTasks.length"
        :change="0"
        changeText="action needed"
        icon="alert"
        color="red"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Patient Table -->
      <div class="lg:col-span-2 healthcare-card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-healthcare-text dark:text-healthcare-text-dark">Recent Patients</h2>
          <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">View All</button>
        </div>
        <div class="overflow-x-auto">
          <table class="healthcare-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Room/Bed</th>
                <th>Conditions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in dashboardStore.patients" :key="patient.id">
                <td>
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                      <span class="text-sm font-bold text-primary-700 dark:text-primary-300">{{ patient.name[0] }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-healthcare-text dark:text-healthcare-text-dark">{{ patient.name }}</p>
                      <p class="text-xs text-healthcare-muted">{{ patient.age }} years • {{ patient.gender === 'male' ? 'Male' : 'Female' }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-sm">Room {{ patient.room }} • Bed {{ patient.bed }}</span>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="condition in patient.conditions"
                      :key="condition"
                      class="badge-info"
                    >
                      {{ condition }}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    :class="{
                      'badge-success': patient.status === 'active',
                      'badge-danger': patient.status === 'critical',
                      'badge-warning': patient.status === 'inactive'
                    }"
                  >
                    {{ patient.status === 'active' ? 'Active' : patient.status === 'critical' ? 'Critical' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Task Queue -->
      <div class="healthcare-card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-healthcare-text dark:text-healthcare-text-dark">Task Queue</h2>
          <span class="badge-danger">{{ dashboardStore.urgentTasks.length }} Urgent</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="task in dashboardStore.tasks.slice(0, 5)"
            :key="task.id"
            class="p-4 rounded-lg border border-healthcare-border dark:border-healthcare-border-dark hover:bg-healthcare-bg dark:hover:bg-slate-700/50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-healthcare-text dark:text-healthcare-text-dark">{{ task.title }}</p>
                <p class="text-sm text-healthcare-muted dark:text-healthcare-muted-dark mt-1">{{ task.patientName }}</p>
              </div>
              <span
                :class="{
                  'badge-danger': task.priority === 'urgent',
                  'badge-warning': task.priority === 'high',
                  'badge-info': task.priority === 'medium'
                }"
              >
                {{ task.priority }}
              </span>
            </div>
            <div class="mt-3 flex items-center gap-2">
              <button
                @click="dashboardStore.markTaskComplete(task.id)"
                class="text-xs bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300 px-3 py-1 rounded-full hover:bg-success-200 transition-colors"
              >
                Complete
              </button>
              <button class="text-xs text-healthcare-muted hover:text-healthcare-text transition-colors">
                Snooze
              </button>
            </div>
          </div>
        </div>
        <button class="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium border border-dashed border-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          View All Tasks
        </button>
      </div>
    </div>

    <!-- Adherence Chart Section -->
    <div class="healthcare-card">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-healthcare-text dark:text-healthcare-text-dark">Adherence Trends</h2>
          <p class="text-sm text-healthcare-muted dark:text-healthcare-muted-dark">Patient medication adherence over the last 7 days</p>
        </div>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 text-sm rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium">7 Days</button>
          <button class="px-3 py-1.5 text-sm rounded-lg text-healthcare-muted hover:bg-healthcare-bg dark:hover:bg-slate-700 transition-colors">30 Days</button>
          <button class="px-3 py-1.5 text-sm rounded-lg text-healthcare-muted hover:bg-healthcare-bg dark:hover:bg-slate-700 transition-colors">90 Days</button>
        </div>
      </div>
      <div class="h-80 bg-healthcare-bg dark:bg-slate-700/30 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-healthcare-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p class="text-healthcare-muted dark:text-healthcare-muted-dark">Adherence Chart Visualization</p>
          <p class="text-sm text-healthcare-muted/70 mt-1">ECharts integration ready</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import StatCard from '@/components/dashboard/StatCard.vue'

const dashboardStore = useDashboardStore()
</script>
