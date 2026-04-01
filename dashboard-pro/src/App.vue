<template>
  <div class="min-h-screen bg-healthcare-bg dark:bg-healthcare-bg-dark">
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        
        <main class="flex-1 overflow-y-auto scrollbar-thin p-6">
          <router-view />
        </main>
      </div>
    </div>
    
    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/layout/Sidebar.vue'
import TopBar from './components/layout/TopBar.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
themeStore.initTheme()
</script>
