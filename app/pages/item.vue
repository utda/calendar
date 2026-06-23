<template>
  <section class="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <SearchForm
      class="mb-6"
      :q="q"
      :collections="collections"
      :collections-query="collectionKeys"
      :u="data.u"
    />

    <CalendarView
      :events="events"
      :type="type"
      :focus="focus"
      @prev="move(-1)"
      @next="move(1)"
      @update:type="onType"
      @select-event="selected = $event"
      @select-date="onSelectDate"
    />

    <EventPopover :event="selected" @close="selected = null" />
  </section>
</template>

<script setup lang="ts">
import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { filterItems } from '~/composables/useCalendar'
import type { CalendarEvent } from '~/components/CalendarView.vue'
import { parseYMD, ymd, shiftFocus, type CalendarType } from '~/utils/calendarMath'

const localePath = useLocalePath()
const router = useRouter()
const { route, data, q, collections, load } = useCalendarLoad()

const type = ref<CalendarType>('month')
const focus = ref<Date>(parseYMD('2020-01-01'))
const events = ref<CalendarEvent[]>([])
const selected = ref<CalendarEvent | null>(null)

const collectionKeys = computed(() =>
  data.value.index?.collections ? Object.keys(data.value.index.collections) : []
)

function setFocusFromQuery() {
  const date = route.query.date
  focus.value =
    typeof date === 'string' && date
      ? parseYMD(date + '-01')
      : parseYMD('2020-01-01')
}

// 漢数字を含むラベルを数値化して昇順ソート（旧 item ページのロジック）
function kanjiSort(a: CalendarEvent, b: CalendarEvent) {
  let labelA = String(a.name)
  let labelB = String(b.name)
  for (const n of findKanjiNumbers(labelA)) labelA = labelA.replace(n, String(kanji2number(n)))
  for (const n of findKanjiNumbers(labelB)) labelB = labelB.replace(n, String(kanji2number(n)))
  return labelA.localeCompare(labelB, 'ja')
}

function buildEvents() {
  if (!data.value.index) {
    events.value = []
    return
  }
  const filtered = filterItems(
    data.value.index,
    collections.value,
    q.value,
    data.value.items ?? []
  )
  const mapped: CalendarEvent[] = filtered.map((obj) => ({
    name: obj.label ?? '',
    start: obj.date,
    end: obj.date,
    url: obj.url,
    metadata: obj.metadata,
    thumbnail: obj.thumbnail,
    description: obj.description,
  }))
  mapped.sort(kanjiSort)
  events.value = mapped
}

function updatePath() {
  const ym = ymd(focus.value).split('-').slice(0, 2).join('-')
  router.push(
    localePath({
      path: '/item',
      query: {
        param: JSON.stringify({ q: q.value, collections: collections.value }),
        date: ym,
        u: data.value.u,
      },
    })
  )
}

function move(dir: 1 | -1) {
  focus.value = shiftFocus(focus.value, type.value, dir)
  updatePath()
}

function onType(t: CalendarType) {
  type.value = t
}

function onSelectDate(date: string) {
  focus.value = parseYMD(date)
  type.value = 'day'
}

onMounted(async () => {
  await load()
  setFocusFromQuery()
  buildEvents()
})

watch(
  () => route.query,
  async (cur, prev) => {
    if (cur.u !== prev?.u) {
      await load()
    } else {
      const p = cur.param
      if (typeof p === 'string' && p) {
        try {
          const parsed = JSON.parse(p)
          q.value = parsed.q ?? ''
          collections.value = parsed.collections ?? []
        } catch {
          /* ignore */
        }
      }
    }
    setFocusFromQuery()
    buildEvents()
  }
)
</script>
