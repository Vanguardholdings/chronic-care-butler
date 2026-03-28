<template>
  <div id="app">
    <el-container v-if="isLoggedIn">
      <el-aside width="200px">
        <nav-menu />
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
    <login-view v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './store/auth'
import NavMenu from './components/NavMenu.vue'
import LoginView from './views/LoginView.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}
</style>
