<template>
  <el-menu
    :default-active="$route.path"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <div class="logo">慢病管家</div>

    <el-menu-item index="/dashboard">
      <el-icon><HomeFilled /></el-icon>
      <span>首页概览</span>
    </el-menu-item>

    <el-menu-item index="/patients">
      <el-icon><UserFilled /></el-icon>
      <span>患者管理</span>
    </el-menu-item>

    <el-menu-item index="/adherence">
      <el-icon><CircleCheckFilled /></el-icon>
      <span>用药依从性</span>
    </el-menu-item>

    <el-menu-item index="/queue">
      <el-icon><BellFilled /></el-icon>
      <span>待办队列</span>
      <el-badge v-if="queueCount > 0" :value="queueCount" class="badge" />
    </el-menu-item>

    <el-menu-item index="/reports">
      <el-icon><Document /></el-icon>
      <span>统计报告</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useQueueStore } from '../store/queue'
import { HomeFilled, UserFilled, CircleCheckFilled, BellFilled, Document } from '@element-plus/icons-vue'

const queueStore = useQueueStore()
const queueCount = computed(() => queueStore.pendingCount)
</script>

<style scoped>
.logo {
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #1f2d3d;
  margin-bottom: 10px;
}

.badge {
  margin-left: 10px;
}
</style>
