<template>
  <div class="dashboard">
    <h1>首页概览</h1>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <stat-card title="总患者数" :value="stats.totalPatients" icon="UserFilled" />
      </el-col>
      <el-col :span="6">
        <stat-card title="今日服药率" :value="`${stats.todayRate}%`" icon="CircleCheckFilled" />
      </el-col>
      <el-col :span="6">
        <stat-card title="待处理提醒" :value="stats.pendingQueue" icon="BellFilled" />
      </el-col>
      <el-col :span="6">
        <stat-card title="本周依从性" :value="`${stats.weeklyRate}%`" icon="TrendCharts" />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>本周服药依从性趋势</span>
          </template>
          <v-chart class="chart" :option="adherenceChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>待处理队列</span>
          </template>
          <queue-list :limit="5" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StatCard from '../components/StatCard.vue'
import QueueList from '../components/QueueList.vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const stats = ref({
  totalPatients: 156,
  todayRate: 87.5,
  pendingQueue: 12,
  weeklyRate: 82.3
})

const adherenceChartOption = ref({
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100
  },
  series: [{
    data: [85, 88, 82, 90, 87, 85, 87.5],
    type: 'line',
    smooth: true
  }]
})

onMounted(async () => {
  // TODO: Fetch real stats from API
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.chart-row {
  margin-top: 20px;
}

.chart {
  height: 300px;
}
</style>
