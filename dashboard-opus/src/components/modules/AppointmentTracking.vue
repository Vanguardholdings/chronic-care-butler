<!-- src/components/modules/AppointmentTracking.vue -->
<template>
  <GlassCard :hoverable="false" aria-label="Appointment Tracking">
    <div class="module-header">
      <div class="module-header__left">
        <h2 class="module-header__title">Appointments</h2>
        <span class="module-header__badge">{{ todayCount }} today</span>
      </div>
      <v-btn variant="text" size="small" color="primary" rounded="lg">
        Calendar
        <v-icon end size="16">mdi-calendar</v-icon>
      </v-btn>
    </div>

    <StateLoading v-if="loading" :lines="4" />
    <StateError v-else-if="error" :message="error" @retry="$emit('retry')" />
    <StateEmpty
      v-else-if="appointments.length === 0"
      title="No appointments"
      description="Schedule appointments to keep track of patient visits."
      action-label="Schedule"
      action-icon="mdi-calendar-plus"
      @action="$emit('schedule')"
    />

    <div v-else class="appt-list">
      <div
        v-for="(appt, i) in appointments"
        :key="appt.id"
        class="appt-item animate-in"
        :class="`animate-in-delay-${i + 1}`"
      >
        <div class="appt-item__time-col">
          <div class="appt-item__time">{{ appt.time }}</div>
          <div class="appt-item__date">{{ formatDate(appt.date) }}</div>
        </div>

        <div
          class="appt-item__line"
          :class="`appt-item__line--${appt.status}`"
        />

        <div class="appt-item__content">
          <div class="appt-item__top-row">
            <span class="appt-item__patient">{{ appt.patientName }}</span>
            <span v-if="appt.isVirtual" class="appt-item__virtual-badge">
              <v-icon size="12">mdi-video-outline</v-icon>
              Virtual
            </span>
          </div>
          <div class="appt-item__type">{{ appt.type }}</div>
          <div class="appt-item__doctor">
            <v-icon size="13" color="#94a3b8">mdi-stethoscope</v-icon>
            {{ appt.doctor }}
          </div>
        </div>

        <span
          class="appt-status"
          :class="`appt-status--${appt.status}`"
        >
          <span class="appt-status__dot" />
          {{ statusLabel(appt.status) }}
        </span>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GlassCard from '@/components/shared/GlassCard.vue'
import StateLoading from '@/components/shared/StateLoading.vue'
import StateError from '@/components/shared/StateError.vue'
import StateEmpty from '@/components/shared/StateEmpty.vue'
import type { Appointment } from '@/composables/useDashboardData'

const props = defineProps<{
  appointments: Appointment[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  retry: []
  schedule: []
}>()

const todayCount = computed(() =>
  props.appointments.filter(a => a.date === '2024-01-25').length
)

function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    'scheduled': 'Scheduled',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return map[status] || status
}
</script>

<style scoped lang="scss">
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.2px;
  }

  &__badge {
    font-size: 11px;
    font-weight: 600;
    color: $color-success;
    background: rgba(16, 185, 129, 0.08);
    padding: 2px 8px;
    border-radius: $radius-full;
  }
}

.appt-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.appt-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: $radius-md;
  transition: background $transition-fast;

  &:hover {
    background: rgba(37, 99, 235, 0.03);
  }

  &__time-col {
    width: 64px;
    flex-shrink: 0;
    text-align: center;
  }

  &__time {
    font-size: 13px;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__date {
    font-size: 11px;
    color: $color-text-muted;
  }

  &__line {
    width: 3px;
    height: 44px;
    border-radius: 2px;
    flex-shrink: 0;

    &--scheduled { background: $color-primary; }
    &--in-progress { background: $color-warning; }
    &--completed { background: $color-success; }
    &--cancelled { background: $color-text-muted; }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__top-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__patient {
    font-size: 14px;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__virtual-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: $color-info;
    background: rgba(99, 102, 241, 0.08);
    padding: 1px 6px;
    border-radius: $radius-full;
  }

  &__type {
    font-size: 12px;
    color: $color-text-secondary;
  }

  &__doctor {
    font-size: 11px;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }
}

.appt-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: $radius-full;
  flex-shrink: 0;
  white-space: nowrap;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &--scheduled {
    color: $color-primary;
    background: rgba(37, 99, 235, 0.08);
    .appt-status__dot { background: $color-primary; }
  }

  &--in-progress {
    color: $color-warning;
    background: rgba(245, 158, 11, 0.08);
    .appt-status__dot { background: $color-warning; animation: pulse-gentle 1.5s infinite; }
  }

  &--completed {
    color: $color-success;
    background: rgba(16, 185, 129, 0.08);
    .appt-status__dot { background: $color-success; }
  }

  &--cancelled {
    color: $color-text-muted;
    background: rgba(148, 163, 184, 0.08);
    .appt-status__dot { background: $color-text-muted; }
  }
}
</style>