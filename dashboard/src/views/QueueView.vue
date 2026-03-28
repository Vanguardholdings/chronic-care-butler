<template>
  <div class="queue">
    <h1>待办队列</h1>
    <queue-list />
  </div>
</template>

<script setup>
import QueueList from '../components/QueueList.vue'
</script>

<style scoped>
.queue {
  padding: 20px;
}
</style>
