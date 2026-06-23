<template>
  <section class="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-8">
    <BarChartCard
      v-if="byYear"
      :header="$t('itemsByYear')"
      :labels="byYear.labels"
      :datasets="byYear.datasets"
    />

    <BarChartCard
      v-if="byWeekday"
      :header="$t('itemsByDay')"
      :labels="byWeekday.labels"
      :datasets="byWeekday.datasets"
    />

    <BarChartCard
      v-for="(freq, key) in metadataFreqs"
      :key="key"
      :header="key"
      :labels="freq.labels"
      :datasets="[{ label: $t('item'), data: freq.data }]"
    />
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const { data, load } = useCalendarLoad()

interface Series {
  labels: (string | number)[]
  datasets: { label: string; data: number[] }[]
}

const byYear = ref<Series | null>(null)
const byWeekday = ref<Series | null>(null)
const metadataFreqs = ref<Record<string, { labels: string[]; data: number[] }>>({})

// 年ごとのアイテム数（旧 analyze）
function analyzeYear() {
  const items = data.value.items ?? []
  const freq: Record<number, number> = {}
  for (const item of items) {
    const year = Number(item.date.split('-')[0])
    freq[year] = (freq[year] ?? 0) + 1
  }
  const years = Object.keys(freq).map(Number)
  if (!years.length) return
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)
  const labels: number[] = []
  const series: number[] = []
  for (let y = minYear; y <= maxYear; y++) {
    labels.push(y)
    series.push(freq[y] || 0)
  }
  byYear.value = { labels, datasets: [{ label: t('item'), data: series }] }
}

// 曜日ごとのアイテム数（旧 analyze2）
function analyzeWeekday() {
  const items = data.value.items ?? []
  const ja = ['日', '月', '火', '水', '木', '金', '土']
  const en = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const freq: Record<number, number> = {}
  for (const item of items) {
    const [y, m, d] = item.date.split('-').map(Number)
    const idx = new Date(y ?? 2000, (m || 1) - 1, d || 1).getDay()
    freq[idx] = (freq[idx] ?? 0) + 1
  }
  const labels: string[] = []
  const series: number[] = []
  for (let i = 0; i < 7; i++) {
    labels.push((locale.value === 'ja' ? ja[i] : en[i]) ?? '')
    series.push(freq[i] || 0)
  }
  byWeekday.value = { labels, datasets: [{ label: t('item'), data: series }] }
}

// メタデータ別の頻度（旧 analyzeMetadata）
function analyzeMetadata() {
  const items = data.value.items ?? []
  const stats = data.value.stats
  const freqs: Record<string, Record<string, number>> = {}

  for (const item of items) {
    for (const m of item.metadata ?? []) {
      const label = m.label
      if (stats && !stats.includes(label)) continue
      if (!freqs[label]) freqs[label] = {}
      const values = Array.isArray(m.value) ? m.value : [m.value]
      for (const value of values) {
        freqs[label][value] = (freqs[label][value] ?? 0) + 1
      }
    }
  }

  const out: Record<string, { labels: string[]; data: number[] }> = {}
  for (const key in freqs) {
    const entries = Object.entries(freqs[key] ?? {}).sort((a, b) => b[1] - a[1])
    out[key] = {
      labels: entries.map((e) => e[0]),
      data: entries.map((e) => e[1]),
    }
  }
  metadataFreqs.value = out
}

function analyzeAll() {
  analyzeYear()
  analyzeWeekday()
  analyzeMetadata()
}

onMounted(async () => {
  await load()
  analyzeAll()
})

// 言語切替で曜日ラベルを再生成
watch(locale, () => analyzeWeekday())
</script>
