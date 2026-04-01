<!-- src/components/layout/TopBar.vue -->
<template>
  <header class="top-bar" role="banner">
    <div class="top-bar__left">
      <button class="top-bar__menu-btn" @click="$emit('toggleNav')" aria-label="Toggle navigation">
        <v-icon size="22">mdi-menu</v-icon>
      </button>
      <div class="top-bar__greeting">
        <h1 class="top-bar__title">Good morning, Dr. Kim</h1>
        <p class="top-bar__subtitle">{{ formattedDate }} · {{ patientCount }} active patients</p>
      </div>
    </div>

    <div class="top-bar__right">
      <div class="top-bar__search">
        <v-icon size="18" class="top-bar__search-icon">mdi-magnify</v-icon>
        <input
          type="text"
          placeholder="Search patients, records..."
          class="top-bar__search-input"
          aria-label="Search"
        />
        <kbd class="top-bar__search-kbd">⌘K</kbd>
      </div>

      <button class="top-bar__icon-btn" aria-label="Notifications">
        <v-icon size="20">mdi-bell-outline</v-icon>
        <span class="top-bar__notification-dot" />
      </button>

      <div class="top-bar__avatar" role="img" aria-label="Dr. Sarah Kim">
        SK
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  toggleNav: []
}>()

const patientCount = 1247

const formattedDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
})
</script>

<style scoped lang="scss">
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  &__left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__menu-btn {
    display: none;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: $radius-md;
    cursor: pointer;
    color: $color-text-secondary;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    @media (max-width: 1024px) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__greeting {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.4px;
    line-height: 1.2;
  }

  &__subtitle {
    font-size: 13px;
    color: $color-text-muted;
    margin-top: 2px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__search {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__search-icon {
    position: absolute;
    left: 12px;
    color: $color-text-muted;
    pointer-events: none;
  }

  &__search-input {
    width: 260px;
    height: 40px;
    padding: 0 40px 0 38px;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: $glass-bg;
    backdrop-filter: blur(8px);
    font-size: 13px;
    color: $color-text-primary;
    outline: none;
    transition: all $transition-fast;

    &::placeholder {
      color: $color-text-muted;
    }

    &:focus {
      border-color: $color-border-focus;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      width: 320px;
    }
  }

  &__search-kbd {
    position: absolute;
    right: 10px;
    font-size: 11px;
    font-family: $font-sans;
    color: $color-text-muted;
    background: rgba(148, 163, 184, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(148, 163, 184, 0.15);
    pointer-events: none;
  }

  &__icon-btn {
    position: relative;
    width: 40px;
    height: 40px;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: $glass-bg;
    backdrop-filter: blur(8px);
    cursor: pointer;
    color: $color-text-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;

    &:hover {
      border-color: $color-border-focus;
      color: $color-primary;
    }
  }

  &__notification-dot {
    position: absolute;
    top: 8px;
    right: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $color-danger;
    border: 2px solid white;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $color-primary, $color-info);
    color: white;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform $transition-fast;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>