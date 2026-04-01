<!-- src/components/layout/AppShell.vue -->
<template>
  <div class="app-shell">
    <SideNav
      :collapsed="navCollapsed"
      @toggle="navCollapsed = !navCollapsed"
    />
    <div
      class="app-shell__main"
      :class="{ 'app-shell__main--expanded': navCollapsed }"
    >
      <TopBar @toggle-nav="navCollapsed = !navCollapsed" />
      <main class="app-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SideNav from './SideNav.vue'
import TopBar from './TopBar.vue'

const navCollapsed = ref(false)
</script>

<style scoped lang="scss">
.app-shell {
  display: flex;
  min-height: 100vh;

  &__main {
    flex: 1;
    margin-left: 260px;
    transition: margin-left $transition-base;
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    &--expanded {
      margin-left: 72px;
    }
  }

  &__content {
    flex: 1;
    padding: 24px 32px 40px;
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 1024px) {
  .app-shell__main {
    margin-left: 0 !important;
  }
}
</style>