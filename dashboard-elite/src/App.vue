<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      class="healthcare-nav"
      color="surface"
    >
      <!-- Logo -->
      <div class="pa-4 d-flex align-center">
        <v-avatar color="primary" size="40" class="mr-3">
          <v-icon icon="mdi-heart-pulse" color="white" size="24"></v-icon>
        </v-avatar>
        <div v-if="!rail">
          <div class="text-h6 font-weight-bold">慢病管家</div>
          <div class="text-caption text-grey">Chronic Care</div>
        </div>
      </div>

      <v-divider class="mx-4"></v-divider>

      <!-- Navigation Items -->
      <v-list density="compact" nav class="mt-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="rail ? '' : item.title"
          :value="item.title"
          rounded="lg"
          class="mb-1"
        >
          <template v-slot:append v-if="item.badge">
            <v-badge :content="item.badge" color="error" size="small"></v-badge>
          </template>
        </v-list-item>
      </v-list>

      <v-spacer></v-spacer>

      <!-- Bottom Actions -->
      <v-list density="compact" nav class="mb-2">
        <v-list-item
          :prepend-icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          :title="rail ? '' : (theme.global.current.value.dark ? 'Light Mode' : 'Dark Mode')"
          @click="toggleTheme"
          rounded="lg"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar elevation="0" color="surface" class="healthcare-appbar">
      <v-app-bar-nav-icon @click="rail = !rail"></v-app-bar-nav-icon>
      
      <v-text-field
        prepend-inner-icon="mdi-magnify"
        placeholder="Search patients, medications..."
        variant="solo-filled"
        density="compact"
        hide-details
        class="ml-4 search-field"
        max-width="400"
        bg-color="rgba(255,255,255,0.05)"
      ></v-text-field>

      <v-spacer></v-spacer>

      <!-- Notifications -->
      <v-btn icon class="mr-2">
        <v-badge :content="3" color="error" size="small" dot>
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <!-- User Menu -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-white font-weight-bold">V</span>
            </v-avatar>
            <span v-if="!$vuetify.display.mobile">Vanguard Holdings</span>
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-account" title="Profile"></v-list-item>
          <v-list-item prepend-icon="mdi-cog" title="Settings"></v-list-item>
          <v-divider></v-divider>
          <v-list-item prepend-icon="mdi-logout" title="Logout"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-background">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const drawer = ref(true)
const rail = ref(false)

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'Patients', icon: 'mdi-account-group', to: '/patients' },
  { title: 'Adherence', icon: 'mdi-chart-line', to: '/adherence' },
  { title: 'Queue', icon: 'mdi-clipboard-list', to: '/queue', badge: 3 },
  { title: 'Reports', icon: 'mdi-file-chart', to: '/reports' },
]

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<style scoped>
.healthcare-nav {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.healthcare-appbar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-field :deep(.v-field__input) {
  color: white;
}

.search-field :deep(.v-field__prepend-inner) {
  color: rgba(255, 255, 255, 0.5);
}
</style>
