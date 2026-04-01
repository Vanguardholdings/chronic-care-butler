<!-- src/components/shared/FloatingActionButton.vue -->
<template>
  <button
    class="fab"
    :class="{ 'fab--expanded': expanded }"
    @mouseenter="expanded = true"
    @mouseleave="expanded = false"
    @click="$emit('click')"
    :aria-label="label"
  >
    <div class="fab__shadow" />
    <div class="fab__body">
      <v-icon size="22" color="white">{{ icon }}</v-icon>
      <transition name="fab-text">
        <span v-if="expanded" class="fab__label">{{ label }}</span>
      </transition>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  icon?: string
  label?: string
}>(), {
  icon: 'mdi-plus',
  label: 'New Patient'
})

defineEmits<{
  click: []
}>()

const expanded = ref(false)
</script>

<style scoped lang="scss">
.fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 200;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;

  &__shadow {
    position: absolute;
    inset: 4px;
    border-radius: $radius-full;
    background: $color-primary;
    filter: blur(16px);
    opacity: 0.4;
    transition: opacity $transition-base;
  }

  &:hover &__shadow {
    opacity: 0.6;
  }

  &__body {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 56px;
    padding: 0 20px;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $color-primary, $color-info);
    color: white;
    box-shadow: $shadow-lg;
    transition: all $transition-base;
    transform: translateZ(0);
  }

  &:hover &__body {
    transform: translateY(-2px) scale(1.04);
    box-shadow: $shadow-xl;
  }

  &:active &__body {
    transform: translateY(0) scale(0.98);
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    color: white;
  }
}

.fab-text-enter-active,
.fab-text-leave-active {
  transition: opacity 0.2s, max-width 0.3s, padding 0.3s;
}

.fab-text-enter-from,
.fab-text-leave-to {
  opacity: 0;
  max-width: 0;
}
</style>