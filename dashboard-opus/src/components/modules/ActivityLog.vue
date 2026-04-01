<!-- src/components/modules/ActivityLog.vue -->
<template>
  <GlassCard :hoverable="false" aria-label="Activity Log">
    <div class="module-header">
      <h2 class="module-header__title">Recent Activity</h2>
      <v-btn variant="text" size="small" color="primary" rounded="lg">
        View All
        <v-icon end size="16">mdi-arrow-right</v-icon>
      </v-btn>
    </div>

    <StateLoading v-if="loading" :lines="6" />
    <StateError v-else-if="error" :message="error" @retry="$emit('retry')" />
    <StateEmpty
      v-else-if="activities.length === 0"
      title="No recent activity"
      description="Activity will be logged as care actions are performed."
    />

    <div v-else class="activity-timeline">
      <div
        v-for="(item, i) in activities"
        :key="item.id"
        class="activity-item animate-in"
        :class="`animate-in-delay-${i + 1}`"
      >
        <div class="activity-item__connector">
          <div
            class="activity-item__dot"
            :style="{ background: item.color }"
          />
          <div
            v-if="i < activities.length - 1"
            class="activity-item__line"
          />
        </div>

        <div class="activity-item__content">
          <div class="activity-item__header">
            <v-icon :size="15" :color="item.color">{{ item.icon }}</v-icon>
            <span class="activity-item__action">{{ item.action }}</span>
            <span class="activity-item__time">{{ item.timestamp }}</span>
          </div>
          <p class="activity-item__details">{{ item.details }}</p>
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
import type { ActivityItem } from '@/composables/useDashboardData'

defineProps<{
  activities: ActivityItem[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped lang="scss">
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.2px;
  }
}

.activity-timeline {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  gap: 14px;
  padding-bottom: 4px;

  &__connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 12px;
    flex-shrink: 0;
    padding-top: 4px;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
  }

  &__line {
    width: 2px;
    flex: 1;
    background: rgba(148, 163, 184, 0.15);
    margin-top: 4px;
    min-height: 20px;
  }

  &__content {
    flex: 1;
    padding-bottom: 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 3px;
  }

  &__action {
    font-size: 13px;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__time {
    font-size: 11px;
    color: $color-text-muted;
    margin-left: auto;
  }

  &__details {
    font-size: 12px;
    color: $color-text-secondary;
    line-height: 1.5;
    padding-left: 21px;
  }
}
</style>