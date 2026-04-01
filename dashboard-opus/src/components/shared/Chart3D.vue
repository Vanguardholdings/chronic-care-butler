<!-- src/components/shared/Chart3D.vue -->
<template>
  <div class="chart-3d">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
)

const props = defineProps<{
  type: 'line' | 'bar' | 'doughnut'
  data: number[]
  labels: string[]
  color?: string
  gradient?: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function createChart() {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const baseColor = props.color || '#2563eb'

  let gradient: CanvasGradient | undefined
  if (props.gradient !== false && props.type === 'line') {
    gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.value.height)
    gradient.addColorStop(0, baseColor + '30')
    gradient.addColorStop(1, baseColor + '00')
  }

  const config: ChartConfiguration = {
    type: props.type,
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        borderColor: props.type === 'doughnut' ? undefined : baseColor,
        backgroundColor: props.type === 'line'
          ? gradient
          : props.type === 'doughnut'
            ? ['#2563eb', '#6366f1', '#10b981', '#f59e0b', '#ef4444']
            : baseColor + '20',
        borderWidth: props.type === 'doughnut' ? 0 : 2,
        fill: props.type === 'line',
        tension: 0.4,
        pointRadius: props.type === 'line' ? 0 : undefined,
        pointHoverRadius: props.type === 'line' ? 6 : undefined,
        pointHoverBackgroundColor: baseColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        borderRadius: props.type === 'bar' ? 8 : undefined,
        cutout: props.type === 'doughnut' ? '75%' : undefined,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleFont: { size: 12, weight: '600' },
          bodyFont: { size: 11 },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
        }
      },
      scales: props.type === 'doughnut' ? {} : {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { size: 11 },
            color: '#94a3b8'
          }
        },
        y: {
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
          border: { display: false },
          ticks: {
            font: { size: 11 },
            color: '#94a3b8',
            padding: 8
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  }

  chartInstance = new Chart(ctx, config)
}

onMounted(createChart)
watch(() => props.data, createChart, { deep: true })
</script>

<style scoped lang="scss">
.chart-3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 180px;
  transform: perspective(800px) rotateX(2deg);
  transition: transform $transition-base;

  &:hover {
    transform: perspective(800px) rotateX(0deg);
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>