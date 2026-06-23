<template>
  <div>
    <!-- データ未指定: ランディング -->
    <section v-if="!data.u" class="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 class="font-serif text-2xl font-semibold text-primary sm:text-3xl">
        {{ $t('calendar_search') }}
      </h1>
      <p class="mt-4 text-fg-muted">{{ $t('usage_intro') }}</p>
      <a :href="github" class="mt-2 inline-block break-all text-primary hover:underline">{{ github }}</a>

      <div class="mt-10">
        <label class="mb-2 block font-medium">{{ $t('enter_url') }}</label>
        <input
          v-model="jsonUrl"
          type="text"
          placeholder="https://..."
          class="w-full rounded-full border border-border bg-surface px-5 py-3 text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          @keyup.enter="add"
        />
        <div class="mt-4 flex gap-3">
          <button
            class="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
            @click="add"
          >
            {{ $t('add') }}
          </button>
          <button
            class="rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
            @click="jsonUrl = sampleUrl"
          >
            {{ $t('example') }}
          </button>
        </div>
      </div>
    </section>

    <!-- データあり: 検索 + 年×12ヶ月グリッド -->
    <section v-else class="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <p v-if="description" class="mb-6 text-fg-muted">{{ description }}</p>

      <SearchForm
        :q="q"
        :collections="collections"
        :collections-query="collectionKeys"
        :u="data.u"
      />

      <div class="mt-8">
        <p class="mb-3 text-sm text-fg-muted">
          {{ $t('search_result') }}: {{ total.toLocaleString() }}
        </p>

        <div class="overflow-x-auto rounded-ds border border-border">
          <table class="w-full border-collapse text-sm">
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.year"
                class="border-b border-border last:border-0 odd:bg-surface/50"
              >
                <th class="whitespace-nowrap px-3 py-2 text-left font-semibold">
                  {{ row.year
                  }}<template v-if="locale === 'ja'"> ({{ row.wareki }}) 年</template>
                </th>
                <td
                  v-for="m in 12"
                  :key="m"
                  class="px-2 py-2 text-center"
                >
                  <NuxtLink
                    v-if="(row.month[m - 1] ?? 0) > 0"
                    :to="itemLink(row.year, m)"
                    class="text-primary hover:underline"
                  >
                    {{ monthName(m, locale) }} ({{ row.month[m - 1] ?? 0 }})
                  </NuxtLink>
                  <span v-else class="text-fg-muted/50">{{ monthName(m, locale) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { filterItems } from '~/composables/useCalendar'
import { toWareki, monthName } from '~/utils/wareki'

const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const { route, data, q, collections, load } = useCalendarLoad()

const jsonUrl = ref('')
const sampleUrl = 'https://nakamura196.github.io/json/calendar.json'
const github = 'https://github.com/utda/calendar'

const total = ref(0)
const rows = ref<{ year: number; wareki: string; month: number[] }[]>([])

const description = computed(() => data.value.description ?? '')
const collectionKeys = computed(() =>
  data.value.index?.collections ? Object.keys(data.value.index.collections) : []
)

function itemLink(year: number, month: number) {
  return localePath({
    path: '/item',
    query: {
      param: JSON.stringify({ q: q.value, collections: collections.value }),
      u: data.value.u,
      date: `${year}-${month}`,
    },
  })
}

function runSearch() {
  if (!data.value.index) {
    rows.value = []
    total.value = 0
    return
  }
  const items = filterItems(
    data.value.index,
    collections.value,
    q.value,
    data.value.items ?? []
  )
  total.value = items.length

  let minYear = 3000
  let maxYear = 0
  const map: Record<number, Record<number, number>> = {}

  for (const obj of items) {
    const [y, mo] = obj.date.split('-')
    const year = Number(y)
    const month = Number(mo)
    if (year < minYear) minYear = year
    if (year > maxYear) maxYear = year
    if (!map[year]) map[year] = {}
    map[year][month] = (map[year][month] ?? 0) + 1
  }

  const out: typeof rows.value = []
  for (let year = minYear; year <= maxYear; year++) {
    const month: number[] = []
    for (let m = 1; m <= 12; m++) month.push(map[year]?.[m] ?? 0)
    out.push({ year, wareki: toWareki(year), month })
  }
  rows.value = out
}

function add() {
  if (!jsonUrl.value) return
  router.push(localePath({ path: '/', query: { u: jsonUrl.value } }))
}

onMounted(async () => {
  await load()
  runSearch()
})

// クエリ変化に追従（u が変われば再読込、それ以外は再検索）
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
      } else {
        q.value = ''
        collections.value = []
      }
    }
    runSearch()
  }
)
</script>
