<!-- src/views/DashboardView.vue -->
<template>
  <AppShell>
    <!-- Summary Stats Row -->
    <DashboardSummary
      :loading="data.loading.value"
      :stats="data.stats"
    />

    <!-- Charts Row -->
    <div class="charts-row">
      <GlassCard
        class="charts-row__main animate-in-delay-3"
        :hoverable="true"
        aria-label="Weekly patient visits"
      >
        <div class="chart-header">
          <h2 class="chart-header__title">Patient Visits</h2>
          <div class="chart-header__tabs">
            <button
              v-for="tab in ['Week', 'Month', 'Year']"
              :key="tab"
              class="chart-tab"
              :class="{ 'chart-tab--active': activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>
        </div>
        <div class="chart-container" v-if="!data.loading.value">
          <Chart3D
            type="line"
            :data="data.weeklyData.value"
            :labels="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
            color="#2563eb"
          />
        </div>
        <StateLoading v-else :lines="6" />
      </GlassCard>

      <GlassCard
        class="charts-row__side animate-in-delay-4"
        :hoverable="true"
        aria-label="Adherence trend"
      >
        <div class="chart-header">
          <h2 class="chart-header__title">Adherence Trend</h2>
        </div>
        <div class="chart-container" v-if="!data.loading.value">
          <Chart3D
            type="bar"
            :data="data.monthlyTrend.value"
            :labels="['J','F','M','A','M','J','J','A','S','O','N','D']"
            color="#10b981"
          />
        </div>
        <StateLoading v-else :lines="6" />
      </GlassCard>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <div class="content-grid__left">
        <div class="animate-in-delay-5">
          <PatientOverview
            :patients="data.patients.value"
            :loading="data.loading.value"
            :error="data.error.value"
            @retry="data.loadData"
          />
        </div>

        <div class="animate-in-delay-7">
          <AppointmentTracking
            :appointments="data.appointments.value"
            :loading="data.loading.value"
            :error="data.error.value"
            @retry="data.loadData"
          />
        </div>
      </div>

      <div class="content-grid__right">
        <div class="animate-in-delay-6">
          <RiskAlertSystem
            :alerts="data.alerts.value"
            :loading="data.loading.value"
            :error="data.error.value"
            @retry="data.loadData"
            @acknowledge="data.acknowledgeAlert"
          />
        </div>

        <div class="animate-in-delay-8">
          <MedicationManagement
            :medications="data.medications.value"
            :loading="data.loading.value"
            :error="data.error.value"
            @retry="data.loadData"
          />
        </div>

        <div class="animate-in-delay-9">
          <ActivityLog
            :activities="data.activities.value"
            :loading="data.loading.value"
            :error="data.error.value"
            @retry="data.loadData"
          />
        </div>
      </div>
    </div>

    <!-- Debug Controls (dev only) -->
    <div class="debug-bar" v-if="showDebug">
      <v-btn size="x-small" variant="outlined" @click="data.loadData()">Reload</v-btn>
      <v-btn size="x-small" variant="outlined" @click="data.simulateEmpty()">Empty</v-btn>
      <v-btn size="x-small" variant="outlined" @click="data.simulateError()">Error</v-btn>
    </div>

    <!-- FAB -->
    <FloatingActionButton
      icon="mdi-plus"
      label="New Patient"
    />
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import GlassCard from '@/components/shared/GlassCard.vue'
import Chart3D from '@/components/shared/Chart3D.vue'
import FloatingActionButton from '@/components/shared/FloatingActionButton.vue'
import StateLoading from '@/components/shared/StateLoading.vue'
import DashboardSummary from '@/components/modules/DashboardSummary.vue'
import PatientOverview from '@/components/modules/PatientOverview.vue'
import MedicationManagement from '@/components/modules/MedicationManagement.vue'
import AppointmentTracking from '@/components/modules/AppointmentTracking.vue'
import RiskAlertSystem from '@/components/modules/RiskAlertSystem.vue'
import ActivityLog from '@/components/modules/ActivityLog.vue'
import { useDashboardData } from '@/composables/useDashboardData'

const data = useDashboardData()
const activeTab = ref('Week')
const showDebug = ref(true)
</script>

<style scoped lang="scss">
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  &__main,
  &__side {
    min-height: 0;
  }
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.2px;
  }

  &__tabs {
    display: flex;
    gap: 2px;
    background: rgba(148, 163, 184, 0.08);
    border-radius: $radius-sm;
    padding: 2px;
  }
}

.chart-tab {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: $color-text-muted;
  cursor: pointer;
  transition: all $transition-fast;

  &--active {
    background: white;
    color: $color-text-primary;
    font-weight: 600;
    box-shadow: $shadow-sm;
  }

  &:hover:not(&--active) {
    color: $color-text-secondary;
  }
}

.chart-container {
  height: 220px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  &__left,
  &__right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.debug-bar {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 8px 16px;
  border-radius: $radius-full;
  border: $glass-border;
  box-shadow: $shadow-lg;
  z-index: 150;
}
</style>