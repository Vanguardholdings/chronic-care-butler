<template>
  <div class="queue-list">
    <el-table :data="queueItems" style="width: 100%">
      <el-table-column prop="patient_name" label="患者" width="120" />
      <el-table-column prop="issue" label="问题" />
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="scope">
          <el-tag :type="priorityType(scope.row.priority)">
            {{ scope.row.priority }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="handleComplete(scope.row)">完成</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQueueStore } from '../store/queue'

defineProps({
  limit: {
    type: Number,
    default: null
  }
})

const queueStore = useQueueStore()

const queueItems = computed(() => {
  const items = queueStore.items
  return props.limit ? items.slice(0, props.limit) : items
})

const priorityType = (priority) => {
  const map = {
    'urgent': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': ''
  }
  return map[priority] || ''
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const handleComplete = async (item) => {
  await queueStore.completeItem(item._id)
}
</script>
