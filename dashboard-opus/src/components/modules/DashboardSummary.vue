<!-- src/components/modules/DashboardSummary.vue -->
<template>
  <div class="dashboard-summary">
    <div
      v-for="(card, i) in summaryCards"
      :key="card.label"
      class="dashboard-summary__card animate-in"
      :class="`animate-in-delay-${i + 1}`"
    >
      <GlassCard :elevation="'md'" :hoverable="true">
        <div class="summary-stat">
          <div class="summary-stat__header">
            <div
              class="summary-stat__icon"
              :style="{ background: card.bgColor }"
            >
              <v-icon :size="20" :color="card.iconColor">{{ card.icon }}</v-icon>
            </div>
            <div
              v-if="card.trend"
              class="summary-stat__trend"
              :class="`summary-stat__trend--${card.trendDir}`"
            >
              <v-icon size="14">
                {{ card.trendDir === 'up' ? 'mdi-trending-up' : 'mdi-trending-down' }}
              </v-icon>
              {{ card.trend }}
            </div>
          </div>

          <div class="summary-stat__value">
            <StateLoading v-if="loading" :lines="1" />
            <template v-else>
              <span class="summary-stat__number">{{ card.value }}</span>
              <span v-if="card.suffix" class="summary-stat__suffix">{{ card.suffix }}</span>
            </template>
          </div>

          <p class="summary-stat__label">{{ card.label }}</p>

          <!-- Mini sparkline -->
          <div v-if="card.sparkline" class="summary-stat__sparkline">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none">
              <polyline
                :points="sparklinePoints(card.sparkline)"
                fill="none"
                :stroke="card.iconColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import GlassCard from '@/components/shared/GlassCard.vue'
import StateLoading from '@/components/shared/StateLoading.vue'

defineProps<{
  loading: boolean
  stats: {
    totalPatients: number
    activeAlerts: number
    appointmentsToday: number
    medicationAdherence: number
    riskPatients: number
    completedVisits: number
  }
}>()

const summaryCards = [
  {
    icon: 'mdi-account-group-outline',
    label: 'Total Patients',
    value: '1,247',
    suffix: '',
    trend: '+12%',
    trendDir: 'up',
    iconColor: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    sparkline: [20, 25, 22, 30, 28, 35, 42]
  },
  {
    icon: 'mdi-bell-alert-outline',
    label: 'Active Alerts',
    value: '8',
    suffix: '',
    trend: '-3',
    trendDir: 'down',
    iconColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    sparkline: [15, 12, 18, 11, 14, 10, 8]
  },
  {
    icon: 'mdi-calendar-check-outline',
    label: 'Today\'s Appointments',
    value: '23',
    suffix: '',
    trend: '+5',
    trendDir: 'up',
    iconColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    sparkline: [18, 22, 19, 25, 20, 23, 23]
  },
  {
    icon: 'mdi-pill',
    label: 'Med Adherence',
    value: '87',
    suffix: '%',
    trend: '+2.4%',
    trendDir: 'up',
    iconColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    sparkline: [80, 82, 83, 85, 84, 86, 87]
  },
  {
    icon: 'mdi-shield-alert-outline',
    label: 'At-Risk Patients',
    value: '14',
    suffix: '',
    trend: '-2',
    trendDir: 'down',
    iconColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    sparkline: [20, 18, 19, 17, 16, 15, 14]
  },
  {
    icon: 'mdi-check-circle-outline',
    label: 'Completed Visits',
    value: '156',
    suffix: '',
    trend: '+18',
    trendDir: 'up',
    iconColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    sparkline: [120, 128, 135, 140, 145, 150, 156]
  }
]

function sparklinePoints(data: number[]): string {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 28 - ((v - min) / range) * 24
    return `${x},${y}`
  }).join(' ')
}
</script>

<style scoped lang="scss">
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-stat {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: $radius-full;

    &--up {
      color: $color-success;
      background: rgba(16, 185, 129, 0.08);
    }

    &--down {
      color: $color-danger;
      background: rgba(239, 68, 68, 0.08);
    }
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 2px;
    margin-bottom: 4px;
  }

  &__number {
    font-size: 28px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.5px;
    line-height: 1;
  }

  &__suffix {
    font-size: 16px;
    font-weight: 600;
    color: $color-text-secondary;
  }

  &__label {
    font-size: 13px;
    color: $color-text-muted;
    margin-bottom: 12px;
  }

  &__sparkline {
    height: 30px;
    opacity: 0.6;

    svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>