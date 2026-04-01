<!-- src/components/modules/PatientOverview.vue -->
<template>
  <GlassCard :hoverable="false" aria-label="Patient Overview">
    <div class="module-header">
      <div class="module-header__left">
        <h2 class="module-header__title">Patient Overview</h2>
        <span class="module-header__badge">{{ patients.length }} active</span>
      </div>
      <v-btn variant="text" size="small" color="primary" rounded="lg">
        View All
        <v-icon end size="16">mdi-arrow-right</v-icon>
      </v-btn>
    </div>

    <StateLoading v-if="loading" :lines="5" />
    <StateError v-else-if="error" :message="error" @retry="$emit('retry')" />
    <StateEmpty
      v-else-if="patients.length === 0"
      title="No patients found"
      description="Add your first patient to get started with chronic care management."
      action-label="Add Patient"
      action-icon="mdi-account-plus"
      @action="$emit('addPatient')"
    />

    <div v-else class="patient-list">
      <div
        v-for="(patient, i) in patients"
        :key="patient.id"
        class="patient-row animate-in"
        :class="`animate-in-delay-${i + 1}`"
        tabindex="0"
        role="button"
        :aria-label="`View ${patient.name}'s details`"
      >
        <div class="patient-row__avatar" :class="`patient-row__avatar--${patient.riskLevel}`">
          {{ patient.avatar }}
        </div>

        <div class="patient-row__info">
          <div class="patient-row__name">{{ patient.name }}</div>
          <div class="patient-row__condition">{{ patient.condition }}</div>
        </div>

        <div class="patient-row__vitals">
          <div class="patient-row__vital">
            <v-icon size="14" color="#64748b">mdi-heart-pulse</v-icon>
            <span>{{ patient.vitals.heartRate }} bpm</span>
          </div>
          <div class="patient-row__vital">
            <v-icon size="14" color="#64748b">mdi-water-percent</v-icon>
            <span>{{ patient.vitals.oxygenSat }}%</span>
          </div>
        </div>

        <div class="patient-row__risk">
          <span
            class="risk-badge"
            :class="`risk-badge--${patient.riskLevel}`"
          >
            {{ patient.riskLevel }}
          </span>
        </div>

        <v-icon size="18" color="#94a3b8" class="patient-row__arrow">
          mdi-chevron-right
        </v-icon>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '@/components/shared/GlassCard.vue'
import StateLoading from '@/components/shared/StateLoading.vue'
import StateError from '@/components/shared/StateError.vue'
import StateEmpty from '@/components/shared/StateEmpty.vue'
import type { Patient } from '@/composables/useDashboardData'

defineProps<{
  patients: Patient[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  retry: []
  addPatient: []
}>()
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
    color: $color-primary;
    background: rgba(37, 99, 235, 0.08);
    padding: 2px 8px;
    border-radius: $radius-full;
  }
}

.patient-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.patient-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: rgba(37, 99, 235, 0.04);
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: -2px;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    color: white;

    &--low { background: linear-gradient(135deg, #10b981, #34d399); }
    &--medium { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    &--high { background: linear-gradient(135deg, #ef4444, #f87171); }
    &--critical { background: linear-gradient(135deg, #dc2626, #ef4444); box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: $color-text-primary;
    line-height: 1.3;
  }

  &__condition {
    font-size: 12px;
    color: $color-text-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__vitals {
    display: flex;
    gap: 12px;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__vital {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $color-text-secondary;
  }

  &__risk {
    flex-shrink: 0;
  }

  &__arrow {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity $transition-fast;
  }

  &:hover &__arrow {
    opacity: 1;
  }
}

.risk-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: $radius-full;
  text-transform: capitalize;

  &--low { color: $color-success; background: rgba(16, 185, 129, 0.1); }
  &--medium { color: $color-warning; background: rgba(245, 158, 11, 0.1); }
  &--high { color: $color-danger; background: rgba(239, 68, 68, 0.1); }
  &--critical {
    color: white;
    background: $color-danger;
    animation: pulse-gentle 2s infinite;
  }
}
</style>