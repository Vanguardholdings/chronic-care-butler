<!-- src/components/layout/SideNav.vue -->
<template>
  <nav
    class="side-nav"
    :class="{ 'side-nav--collapsed': collapsed }"
    role="navigation"
    aria-label="Main navigation"
  >
    <!-- Logo -->
    <div class="side-nav__logo">
      <div class="side-nav__logo-icon">
        <v-icon size="24" color="white">mdi-heart-pulse</v-icon>
      </div>
      <transition name="fade-text">
        <span v-if="!collapsed" class="side-nav__logo-text">
          ChronicCare
        </span>
      </transition>
    </div>

    <!-- Navigation Items -->
    <div class="side-nav__items">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="side-nav__item"
        :class="{ 'side-nav__item--active': activeItem === item.id }"
        @click="activeItem = item.id; $emit('navigate', item.id)"
        :title="item.label"
        :aria-label="item.label"
        :aria-current="activeItem === item.id ? 'page' : undefined"
      >
        <div class="side-nav__item-icon">
          <v-icon :size="20">{{ item.icon }}</v-icon>
          <span
            v-if="item.badge && !collapsed"
            class="side-nav__badge"
            :class="`side-nav__badge--${item.badgeType}`"
          >
            {{ item.badge }}
          </span>
        </div>
        <transition name="fade-text">
          <span v-if="!collapsed" class="side-nav__item-label">
            {{ item.label }}
          </span>
        </transition>
      </button>
    </div>

    <!-- Collapse Toggle -->
    <button
      class="side-nav__toggle"
      @click="$emit('toggle')"
      :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
    >
      <v-icon size="18">
        {{ collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
      </v-icon>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
  navigate: [id: string]
}>()

const activeItem = ref('dashboard')

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline', badge: null, badgeType: '' },
  { id: 'patients', label: 'Patients', icon: 'mdi-account-group-outline', badge: null, badgeType: '' },
  { id: 'medications', label: 'Medications', icon: 'mdi-pill', badge: '3', badgeType: 'info' },
  { id: 'appointments', label: 'Appointments', icon: 'mdi-calendar-outline', badge: null, badgeType: '' },
  { id: 'alerts', label: 'Alerts', icon: 'mdi-bell-outline', badge: '8', badgeType: 'danger' },
  { id: 'activity', label: 'Activity Log', icon: 'mdi-history', badge: null, badgeType: '' },
  { id: 'analytics', label: 'Analytics', icon: 'mdi-chart-line', badge: null, badgeType: '' },
  { id: 'settings', label: 'Settings', icon: 'mdi-cog-outline', badge: null, badgeType: '' },
]
</script>

<style scoped lang="scss">
.side-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: $glass-bg;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-right: $glass-border;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  z-index: 100;
  transition: width $transition-base;
  overflow: hidden;

  &--collapsed {
    width: 72px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 8px 20px;
    border-bottom: 1px solid $color-border;
    margin-bottom: 16px;
  }

  &__logo-icon {
    width: 36px;
    height: 36px;
    border-radius: $radius-md;
    background: linear-gradient(135deg, $color-primary, $color-info);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &__logo-text {
    font-size: 17px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }

  &__items {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: $radius-md;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all $transition-fast;
    color: $color-text-secondary;
    width: 100%;
    text-align: left;
    position: relative;

    &:hover {
      background: rgba(37, 99, 235, 0.06);
      color: $color-text-primary;
    }

    &--active {
      background: rgba(37, 99, 235, 0.1);
      color: $color-primary;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: $color-primary;
        border-radius: 0 3px 3px 0;
      }
    }
  }

  &__item-icon {
    position: relative;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__item-label {
    font-size: 14px;
    white-space: nowrap;
    line-height: 1;
  }

  &__badge {
    position: absolute;
    top: -6px;
    right: -8px;
    font-size: 10px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    &--info {
      background: $color-info;
    }

    &--danger {
      background: $color-danger;
      animation: pulse-gentle 2s infinite;
    }
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    border: 1px solid $color-border;
    background: $color-surface;
    cursor: pointer;
    color: $color-text-secondary;
    transition: all $transition-fast;
    align-self: center;
    margin-top: 8px;

    &:hover {
      background: $color-bg-secondary;
      color: $color-text-primary;
    }
  }
}

.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 1024px) {
  .side-nav {
    transform: translateX(-100%);

    &--visible {
      transform: translateX(0);
    }
  }
}
</style>