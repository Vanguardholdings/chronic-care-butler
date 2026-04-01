<!-- src/components/modules/RiskAlertSystem.vue -->
<template>
  <GlassCard :hoverable="false" aria-label="Risk & Alert System">
    <div class="module-header">
      <div class="module-header__left">
        <h2 class="module-header__title">Alerts</h2>
        <span class="module-header__badge module-header__badge--danger">
          {{ unacknowledgedCount }} new
        </span>
      </div>
      <v-btn
        variant="text"
        size="small"
        color="primary"
        rounded="lg"
        @click="$emit('acknowledgeAll')"
      >
        Mark All Read
      </v-btn>
    </div>

    <StateLoading v-if="loading" :lines="4" />
    <StateError v-else-if="error" :message="error" @retry="$emit('retry')" />
    <StateEmpty
      v-else-if="alerts.length === 0"
      title="All clear"
      description="No active alerts. All patients are within normal parameters."
    />

    <div v-else class="alert-list">
      <transition-group name="alert-anim">
        <div
          v-for="(alert, i) in alerts"
          :key="alert.id"
          class="alert-item animate-in"
          :class="[
            `alert-item--${alert.type}`,
            `animate-in-delay-${i + 1}`,
            { 'alert-item--acknowledged': alert.acknowledged }
          ]"
          role="alert"
        >
          <div class="alert-item__icon-col">
            <div class="alert-item__icon" :class="`alert-item__icon--${alert.type}`">
              <v-icon size="18" color="white">
                {{
                  alert.type === 'critical' ? 'mdi-alert-octagon' :
                  alert.type === 'warning' ? 'mdi-alert' : 'mdi-information'
                }}
              </v-icon>
            </div>
          </div>

          <div class="alert-item__body">
            <div class="alert-item__header">
              <span class="alert-item__title">{{ alert.title }}</span>
              <span class="alert-item__time">{{ alert.timestamp }}</span>
            </div>
            <p class="alert-item__message">{{ alert.message }}</p>
          </div>

          <button
            v-if="!alert.acknowledged"
            class="alert-item__ack-btn"
            @click="$emit('acknowledge', alert.id)"
            aria-label="Acknowledge alert"
          >
            <v-icon size="16">mdi-check</v-icon>
          </button>
          <v-icon v-else size="16" color="#10b981">mdi-check-circle</v-icon>
        </div>
      </transition-group>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GlassCard from '@/components/shared/GlassCard.vue'
import StateLoading from '@/components/shared/StateLoading.vue'
import StateError from '@/components/shared/StateError.vue'
import StateEmpty from '@/components/shared/StateEmpty.vue'
import type { Alert } from '@/composables/useDashboardData'

const props = defineProps<{
  alerts: Alert[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  retry: []
  acknowledge: [id: string]
  acknowledgeAll: []
}>()

const unacknowledgedCount = computed(() =>
  props.alerts.filter(a => !a.acknowledged).length
)
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
    padding: 2px 8px;
    border-radius: $radius-full;

    &--danger {
      color: white;
      background: $color-danger;
      animation: pulse-gentle 2s infinite;
    }
  }
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: $radius-md;
  border-left: 3px solid transparent;
  transition: all $transition-fast;

  &--critical {
    border-left-color: $color-danger;
    background: rgba(239, 68, 68, 0.03);
  }

  &--warning {
    border-left-color: $color-warning;
    background: rgba(245, 158, 11, 0.03);
  }

  &--info {
    border-left-color: $color-info;
    background: rgba(99, 102, 241, 0.03);
  }

  &--acknowledged {
    opacity: 0.5;
  }

  &__icon-col {
    flex-shrink: 0;
    padding-top: 2px;
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;

    &--critical { background: $color-danger; }
    &--warning { background: $color-warning; }
    &--info { background: $color-info; }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__time {
    font-size: 11px;
    color: $color-text-muted;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__message {
    font-size: 12px;
    color: $color-text-secondary;
    line-height: 1.5;
  }

  &__ack-btn {
    width: 30px;
    height: 30px;
    border-radius: $radius-full;
    border: 1px solid $color-border;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-muted;
    flex-shrink: 0;
    transition: all $transition-fast;

    &:hover {
      background: rgba(16, 185, 129, 0.1);
      border-color: $color-success;
      color: $color-success;
    }
  }
}

.alert-anim-enter-active,
.alert-anim-leave-active {
  transition: all 0.3s ease;
}

.alert-anim-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.alert-anim-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>