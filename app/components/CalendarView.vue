<template>
  <div class="rounded-ds border border-border bg-bg">
    <!-- ツールバー -->
    <div class="flex items-center gap-2 border-b border-border px-3 py-2">
      <button class="nav-btn" :aria-label="$t('today')" @click="$emit('prev')">‹</button>
      <button class="nav-btn" @click="$emit('next')">›</button>
      <h2 class="ml-2 flex-1 truncate font-semibold">{{ title }}</h2>

      <div class="relative">
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-2"
          @click.stop="typeOpen = !typeOpen"
        >
          {{ $t(type) }} ▾
        </button>
        <div
          v-if="typeOpen"
          class="absolute right-0 z-30 mt-1 w-28 overflow-hidden rounded-md border border-border bg-bg shadow-lg"
        >
          <button
            v-for="t in (['month', 'week', 'day'] as const)"
            :key="t"
            class="block w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
            :class="t === type ? 'text-primary font-semibold' : ''"
            @click="selectType(t)"
          >
            {{ $t(t) }}
          </button>
        </div>
      </div>
    </div>

    <!-- 月ビュー -->
    <div v-if="type === 'month'" class="p-2">
      <div class="grid grid-cols-7 border-b border-border pb-1 text-center text-xs font-medium text-fg-muted">
        <div v-for="(w, i) in weekdayLabels" :key="i" :class="weekdayColor(i)">{{ w }}</div>
      </div>
      <div class="grid grid-cols-7 gap-px">
        <div
          v-for="cell in monthCells"
          :key="cell.date"
          class="min-h-24 cursor-pointer p-1 text-left transition-colors hover:bg-surface-2"
          :class="cell.inMonth ? '' : 'opacity-40'"
          @click="$emit('select-date', cell.date)"
        >
          <div class="text-right text-xs" :class="weekdayColor(cell.weekday)">{{ cell.day }}</div>
          <ul class="mt-0.5 space-y-0.5">
            <li
              v-for="(ev, i) in (eventsByDate[cell.date] || []).slice(0, 3)"
              :key="i"
              class="truncate rounded bg-primary/10 px-1 text-[11px] text-primary hover:bg-primary/20"
              @click.stop="$emit('select-event', ev)"
            >
              {{ ev.name }}
            </li>
          </ul>
          <div
            v-if="(eventsByDate[cell.date] || []).length > 3"
            class="px-1 text-[11px] text-fg-muted"
          >
            +{{ (eventsByDate[cell.date] || []).length - 3 }}
          </div>
        </div>
      </div>
    </div>

    <!-- 週ビュー -->
    <div v-else-if="type === 'week'" class="grid grid-cols-1 gap-2 p-3 sm:grid-cols-7">
      <div v-for="cell in weekCells" :key="cell.date" class="rounded-md border border-border p-2">
        <div class="mb-1 text-xs font-medium" :class="weekdayColor(cell.weekday)">
          {{ cell.day }} ({{ weekdayLabels[cell.weekday] }})
        </div>
        <ul class="space-y-1">
          <li
            v-for="(ev, i) in eventsByDate[cell.date] || []"
            :key="i"
            class="cursor-pointer truncate rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary hover:bg-primary/20"
            @click="$emit('select-event', ev)"
          >
            {{ ev.name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 日ビュー -->
    <div v-else class="p-4">
      <ul v-if="(eventsByDate[focusStr] || []).length" class="space-y-2">
        <li
          v-for="(ev, i) in eventsByDate[focusStr] || []"
          :key="i"
          class="cursor-pointer rounded-md border border-border p-3 transition-colors hover:bg-surface-2"
          @click="$emit('select-event', ev)"
        >
          {{ ev.name }}
        </li>
      </ul>
      <p v-else class="py-8 text-center text-fg-muted">{{ $t('no_events') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  monthGrid,
  weekDays,
  ymd,
  WEEKDAYS_JA,
  WEEKDAYS_EN,
  type CalendarType,
} from '~/utils/calendarMath'
import { MONTHS_EN } from '~/utils/wareki'

export interface CalendarEvent {
  name: string
  start: string
  end?: string
  url?: string
  metadata?: any[]
  thumbnail?: string
  description?: string | string[]
}

const props = defineProps<{
  events: CalendarEvent[]
  type: CalendarType
  focus: Date
}>()

const emit = defineEmits<{
  prev: []
  next: []
  'update:type': [t: CalendarType]
  'select-event': [ev: CalendarEvent]
  'select-date': [date: string]
}>()

const { locale } = useI18n()
const typeOpen = ref(false)

const weekdayLabels = computed(() =>
  locale.value === 'ja' ? WEEKDAYS_JA : WEEKDAYS_EN
)
function weekdayColor(i: number) {
  if (i === 0) return 'text-red-500'
  if (i === 6) return 'text-blue-500'
  return ''
}

const focusStr = computed(() => ymd(props.focus))
const monthCells = computed(() => monthGrid(props.focus))
const weekCells = computed(() => weekDays(props.focus))

const eventsByDate = computed<Record<string, CalendarEvent[]>>(() => {
  const map: Record<string, CalendarEvent[]> = {}
  for (const ev of props.events) {
    const d = ev.start
    if (!map[d]) map[d] = []
    map[d].push(ev)
  }
  return map
})

const title = computed(() => {
  const y = props.focus.getUTCFullYear()
  const m = props.focus.getUTCMonth() + 1
  const d = props.focus.getUTCDate()
  const monthLabel = locale.value === 'ja' ? `${m}月` : MONTHS_EN[m - 1]
  if (props.type === 'month') {
    return locale.value === 'ja' ? `${y}年 ${monthLabel}` : `${monthLabel} ${y}`
  }
  if (props.type === 'day') {
    return locale.value === 'ja'
      ? `${y}年 ${monthLabel} ${d}日`
      : `${monthLabel} ${d}, ${y}`
  }
  // week
  const week = weekDays(props.focus)
  const first = week[0]?.date ?? ''
  const last = week[6]?.date ?? ''
  return `${first} – ${last}`
})

function selectType(t: CalendarType) {
  typeOpen.value = false
  emit('update:type', t)
}

onMounted(() => {
  const close = () => (typeOpen.value = false)
  document.addEventListener('click', close)
  onUnmounted(() => document.removeEventListener('click', close))
})
</script>

<style scoped>
.nav-btn {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--ds-fg-muted);
}
.nav-btn:hover {
  background: var(--ds-surface-2);
  color: var(--ds-fg);
}
</style>
