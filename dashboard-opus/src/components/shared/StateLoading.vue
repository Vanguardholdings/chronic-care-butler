<!-- src/components/shared/StateLoading.vue -->
<template>
  <div class="state-loading" role="status" aria-label="Loading content">
    <div class="state-loading__skeleton" v-for="n in lines" :key="n">
      <div
        class="state-loading__bar"
        :style="{
          width: n === 1 ? '60%' : n === lines ? '40%' : '80%',
          animationDelay: `${n * 0.1}s`
        }"
      />
    </div>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  lines?: number
}>(), {
  lines: 4
})
</script>

<style scoped lang="scss">
.state-loading {
  padding: 8px 0;

  &__skeleton {
    padding: 6px 0;
  }

  &__bar {
    height: 14px;
    border-radius: 7px;
    background: linear-gradient(
      90deg,
      rgba(148, 163, 184, 0.08) 25%,
      rgba(148, 163, 184, 0.16) 50%,
      rgba(148, 163, 184, 0.08) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>