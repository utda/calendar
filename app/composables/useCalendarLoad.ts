// 3 ページ共通のデータ読込。route の u / param を解釈し、
// インデックスを構築して結果メタを共有 state に格納する。
import { getCalendarIndex, type CalendarData } from '~/composables/useCalendar'

export function useCalendarLoad() {
  const route = useRoute()
  const meta = useState<any>('calendarMeta', () => ({}))

  const data = ref<Partial<CalendarData>>({})
  const q = ref<string>('')
  const collections = ref<string[]>([])
  const pending = ref(true)
  const error = ref<unknown>(null)

  function parseParam() {
    const p = route.query.param
    if (typeof p === 'string' && p) {
      try {
        const parsed = JSON.parse(p)
        q.value = parsed.q ?? ''
        collections.value = parsed.collections ?? []
      } catch {
        /* ignore malformed param */
      }
    }
  }

  async function load() {
    pending.value = true
    error.value = null
    parseParam()
    try {
      const d = await getCalendarIndex(route.query as Record<string, any>, route.hash)
      if (d.redirect && d.u) {
        const { public: pub } = useRuntimeConfig()
        window.location.href = `${pub.hostname}/?u=${d.u}`
        return
      }
      data.value = d
      meta.value = d
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  return { route, meta, data, q, collections, pending, error, load }
}
