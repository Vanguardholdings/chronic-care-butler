<!-- src/components/shared/GlassCard.vue -->
<template>
  <div
    ref="cardRef"
    class="glass-card"
    :class="[
      `glass-card--${elevation}`,
      {
        'glass-card--hoverable': hoverable,
        'glass-card--no-padding': noPadding,
      }
    ]"
    :style="hoverable ? tiltStyle : undefined"
    role="region"
    :aria-label="ariaLabel"
  >
    <!-- Glare overlay -->
    <div
      v-if="hoverable && isHovering"
      class="glass-card__glare"
      :style="{
        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15), transparent 60%)`
      }"
    />

    <div class="glass-card__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use3DCard } from '@/composables/use3DCard'

const props = withDefaults(defineProps<{
  elevation?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  noPadding?: boolean
  ariaLabel?: string
}>(), {
  elevation: 'md',
  hoverable: true,
  noPadding: false,
  ariaLabel: undefined
})

const cardRef = ref<HTMLElement | null>(null)

const { tiltX, tiltY, isHovering, glarePosition } = use3DCard(cardRef, {
  maxTilt: props.hoverable ? 4 : 0,
  scale: 1.01,
  perspective: 1200
})

const tiltStyle = computed(() => ({
  transform: `perspective(1200px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) scale3d(${isHovering.value ? 1.01 : 1}, ${isHovering.value ? 1.01 : 1}, 1)`,
  transition: 'transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)',
  transformStyle: 'preserve-3d' as const
}))
</script>

<style scoped lang="scss">
.glass-card {
  position: relative;
  background: $glass-bg;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border: $glass-border;
  border-radius: $radius-lg;
  overflow: hidden;
  will-change: transform;

  &__glare {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    border-radius: inherit;
  }

  &__content {
    position: relative;
    z-index: 2;
    padding: 24px;
  }

  &--no-padding .glass-card__content {
    padding: 0;
  }

  &--sm {
    box-shadow: $shadow-sm;
  }

  &--md {
    box-shadow: $shadow-md;
  }

  &--lg {
    box-shadow: $shadow-lg;
  }

  &--hoverable {
    cursor: default;

    &:hover {
      box-shadow: $shadow-xl;
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>