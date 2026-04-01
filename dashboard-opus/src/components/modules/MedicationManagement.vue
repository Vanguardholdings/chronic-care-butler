<!-- src/components/modules/MedicationManagement.vue -->
<template>
  <GlassCard :hoverable="false" aria-label="Medication Management">
    <div class="module-header">
      <div class="module-header__left">
        <h2 class="module-header__title">Medications</h2>
        <span class="module-header__badge">{{ medications.length }} active</span>
      </div>
      <v-btn variant="text" size="small" color="primary" rounded="lg">
        Manage
        <v-icon end size="16">mdi-arrow-right</v-icon>
      </v-btn>
    </div>

    <StateLoading v-if="loading" :lines="4" />
    <StateError v-else-if="error" :message="error" @retry="$emit('retry')" />
    <StateEmpty
      v-else-if="medications.length === 0"
      title="No medications tracked"
      description="Start tracking medications to monitor adherence."
      action-label="Add Medication"
      action-icon="mdi-pill"
      @action="$emit('addMed')"
    />

    <div v-else class="med-list">
      <div
        v-for="(med, i) in medications"
        :key="med.id"
        class="med-card animate-in"
        :class="[
          `animate-in-delay-${i + 1}`,
          { 'med-card--paused': med.status === 'paused' }
        ]"
      >
        <div class="med-card__top">
          <div class="med-card__icon-wrap">
            <v-icon size="18" :color="med.status === 'paused' ? '#94a3b8' : '#6366f1'">
              mdi-pill
            </v-icon>
          </div>
          <div class="med-card__info">
            <div class="med-card__name">{{ med.name }}</div>
            <div class="med-card__dosage">{{ med.dosage }} · {{ med.frequency }}</div>
          </div>
          <span
            class="med-card__status"
            :class="`med-card__status--${med.status}`"
          >
            {{ med.status }}
          </span>
        </div>

        <div class="med-card__adherence">
          <div class="med-card__adherence-header">
            <span class="med-card__adherence-label">Adherence</span>
            <span
              class="med-card__adherence-value"
              :class="{ 'text-warning': med.adherence < 80, 'text-success': med.adherence >= 90 }"
            >
              {{ med.adherence }}%
            </span>
          </div>
          <div class="med-card__progress-track">
            <div
              class="med-card__progress-fill"
              :style="{
                width: `${med.adherence}%`,
                background: med.adherence >= 90
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : med.adherence >= 80
                    ? 'linear-gradient(90deg, #2563eb, #60a5fa)'
                    : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              }"
            />
          </div>
        </div>

        <div class="med-card__footer">
          <div class="med-card__time">
            <v-icon size="13" color="#94a3b8">mdi-clock-outline</v-icon>
            {{ med.time }}
          </div>
          <div v-if="med.refillDate !== '—'" class="med-card__refill">
            Refill: {{ med.refillDate }}
          </div>
        </div>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '@/components/shared/GlassCard.vue'
import StateLoading from '@/components/shared/StateLoading.vue'
import StateError from '@/components/shared/StateError.vue'
import StateEmpty from '@/components/shared/StateEmpty.vue'
import type { Medication } from '@/composables/useDashboardData'

defineProps<{
  medications: Medication[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  retry: []
  addMed: []
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
    color: $color-info;
    background: rgba(99, 102, 241, 0.08);
    padding: 2px 8px;
    border-radius: $radius-full;
  }
}

.med-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.med-card {
  padding: 14px 16px;
  border-radius: $radius-md;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(255, 255, 255, 0.5);
  transition: all $transition-fast;

  &:hover {
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: $shadow-sm;
  }

  &--paused {
    opacity: 0.6;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: $radius-sm;
    background: rgba(99, 102, 241, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__dosage {
    font-size: 12px;
    color: $color-text-muted;
  }

  &__status {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: $radius-full;
    text-transform: capitalize;

    &--active { color: $color-success; background: rgba(16, 185, 129, 0.1); }
    &--paused { color: $color-text-muted; background: rgba(148, 163, 184, 0.1); }
    &--completed { color: $color-primary; background: rgba(37, 99, 235, 0.1); }
  }

  &__adherence {
    margin-bottom: 10px;
  }

  &__adherence-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  &__adherence-label {
    font-size: 11px;
    color: $color-text-muted;
  }

  &__adherence-value {
    font-size: 12px;
    font-weight: 700;
    color: $color-text-primary;
  }

  &__progress-track {
    height: 4px;
    border-radius: 2px;
    background: rgba(148, 163, 184, 0.1);
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__time,
  &__refill {
    font-size: 11px;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.text-warning { color: $color-warning !important; }
.text-success { color: $color-success !important; }
</style>