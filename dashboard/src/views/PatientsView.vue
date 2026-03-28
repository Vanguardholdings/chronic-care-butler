<template>
  <div class="patients">
    <h1>患者管理</h1>
    <el-table :data="patients" style="width: 100%">
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="phone" label="电话" width="150" />
      <el-table-column prop="conditions" label="诊断">
        <template #default="scope">
          <el-tag v-for="cond in scope.row.conditions" :key="cond" size="small" style="margin-right: 5px">
            {{ cond }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '活跃' : '暂停' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const patients = ref([
  { name: '张大爷', phone: '138****1234', conditions: ['高血压', '糖尿病'], status: 'active' },
  { name: '李阿姨', phone: '139****5678', conditions: ['高血压'], status: 'active' },
])

onMounted(async () => {
  // TODO: Fetch patients from API
})
</script>

<style scoped>
.patients {
  padding: 20px;
}
</style>
