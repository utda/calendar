<template>
  <div class="rounded-ds border border-border bg-bg p-4">
    <h3 class="mb-3 font-semibold">{{ header }}</h3>

    <div class="h-72">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-6 flex items-center gap-3">
      <label class="whitespace-nowrap text-sm text-fg-muted">{{ $t('yAxesMax') }}</label>
      <input
        v-model.number="thres"
        type="range"
        :min="2"
        :max="dataMax"
        class="flex-1 accent-[var(--ds-primary)]"
      />
      <span class="w-10 text-right text-sm tabular-nums">{{ thres }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  header: string
  labels: (string | number)[]
  datasets: { label: string; data: number[] }[]
}>()

const PALETTE = 'rgba(11, 139, 238, 0.7)' // UTokyo Blue
const dataMax = computed(() => Math.max(2, ...props.datasets[0]?.data ?? [2]))
const thres = ref(dataMax.value)

watch(dataMax, (v) => (thres.value = v))

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    ...ds,
    backgroundColor: PALETTE,
    borderColor: PALETTE,
    borderWidth: 1,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: thres.value > 0 ? thres.value : undefined,
      ticks: { stepSize: 1 },
    },
  },
}))
</script>
