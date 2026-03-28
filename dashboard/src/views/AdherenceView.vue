<template>
  <div class="adherence">
    <h1>用药依从性</h1>
    <el-card>
      <v-chart class="chart" :option="chartOption" autoresize />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const chartOption = ref({
  xAxis: { type: 'category', data: ['张大爷', '李阿姨', '王叔叔', '赵奶奶'] },
  yAxis: { type: 'value', max: 100 },
  series: [{ data: [95, 87, 92, 78], type: 'bar' }]
})
</script>

<style scoped>
.adherence {
  padding: 20px;
}

.chart {
  height: 400px;
}
</style>
