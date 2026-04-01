<!-- src/components/shared/StateError.vue -->
<template>
  <div class="state-error" role="alert">
    <div class="state-error__icon-wrap">
      <v-icon size="32" color="#ef4444">mdi-alert-circle-outline</v-icon>
    </div>
    <h3 class="state-error__title">{{ title }}</h3>
    <p class="state-error__message">{{ message }}</p>
    <v-btn
      variant="outlined"
      color="error"
      rounded="lg"
      size="small"
      @click="$emit('retry')"
    >
      <v-icon start size="16">mdi-refresh</v-icon>
      Try Again
    </v-btn>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string
}>(), {
  title: 'Something went wrong',
  message: 'Unable to load data. Please check your connection.'
})

defineEmits<{
  retry: []
}>()
</script>

<style scoped lang="scss">
.state-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;

  &__icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: 6px;
  }

  &__message {
    font-size: 13px;
    color: $color-text-muted;
    max-width: 300px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
}
</style>