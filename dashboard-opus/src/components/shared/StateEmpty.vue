<!-- src/components/shared/StateEmpty.vue -->
<template>
  <div class="state-empty" role="status">
    <!-- Isometric Illustration -->
    <div class="state-empty__illustration">
      <div class="state-empty__cube-scene">
        <div class="state-empty__cube">
          <div class="state-empty__face state-empty__face--front" />
          <div class="state-empty__face state-empty__face--back" />
          <div class="state-empty__face state-empty__face--right" />
          <div class="state-empty__face state-empty__face--left" />
          <div class="state-empty__face state-empty__face--top" />
          <div class="state-empty__face state-empty__face--bottom" />
        </div>
      </div>
      <div class="state-empty__ring" />
      <div class="state-empty__dot state-empty__dot--1" />
      <div class="state-empty__dot state-empty__dot--2" />
      <div class="state-empty__dot state-empty__dot--3" />
    </div>

    <h3 class="state-empty__title">{{ title }}</h3>
    <p class="state-empty__description">{{ description }}</p>

    <v-btn
      v-if="actionLabel"
      variant="flat"
      color="primary"
      rounded="lg"
      size="default"
      class="state-empty__action"
      @click="$emit('action')"
    >
      <v-icon start size="18">{{ actionIcon }}</v-icon>
      {{ actionLabel }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  actionLabel?: string
  actionIcon?: string
}>(), {
  title: 'No data yet',
  description: 'Information will appear here once available.',
  actionLabel: '',
  actionIcon: 'mdi-plus'
})

defineEmits<{
  action: []
}>()
</script>

<style scoped lang="scss">
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;

  &__illustration {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 24px;
  }

  &__cube-scene {
    width: 60px;
    height: 60px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    perspective: 400px;
  }

  &__cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transform: rotateX(-20deg) rotateY(30deg);
    animation: float 4s ease-in-out infinite;
  }

  &__face {
    position: absolute;
    width: 60px;
    height: 60px;
    border: 2px solid rgba(37, 99, 235, 0.2);
    border-radius: 8px;

    &--front  { transform: rotateY(0deg) translateZ(30px); background: rgba(37, 99, 235, 0.06); }
    &--back   { transform: rotateY(180deg) translateZ(30px); background: rgba(37, 99, 235, 0.04); }
    &--right  { transform: rotateY(90deg) translateZ(30px); background: rgba(99, 102, 241, 0.06); }
    &--left   { transform: rotateY(-90deg) translateZ(30px); background: rgba(99, 102, 241, 0.04); }
    &--top    { transform: rotateX(90deg) translateZ(30px); background: rgba(37, 99, 235, 0.08); }
    &--bottom { transform: rotateX(-90deg) translateZ(30px); background: rgba(37, 99, 235, 0.03); }
  }

  &__ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90px;
    height: 90px;
    transform: translate(-50%, -50%);
    border: 2px dashed rgba(148, 163, 184, 0.2);
    border-radius: 50%;
    animation: rotate3d 20s linear infinite;
  }

  &__dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: float 3s ease-in-out infinite;

    &--1 { top: 10px; left: 20px; background: rgba(37, 99, 235, 0.3); animation-delay: 0s; }
    &--2 { top: 80px; right: 15px; background: rgba(16, 185, 129, 0.3); animation-delay: 1s; }
    &--3 { bottom: 5px; left: 40px; background: rgba(99, 102, 241, 0.3); animation-delay: 2s; }
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: 6px;
  }

  &__description {
    font-size: 13px;
    color: $color-text-muted;
    max-width: 280px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
}
</style>