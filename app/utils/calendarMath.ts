// 自作カレンダー用の日付演算。タイムゾーンの揺れを避けるため UTC で計算し、
// 日付は 'YYYY-MM-DD' 文字列で扱う（イベントの date 形式と一致）。

export type CalendarType = 'month' | 'week' | 'day'

const pad = (n: number) => String(n).padStart(2, '0')

export function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y || 2000, (m || 1) - 1, d || 1))
}

export function addDays(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n))
}

export function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))
}

export interface CalendarDay {
  date: string // YYYY-MM-DD
  day: number // 1-31
  inMonth: boolean // 表示中の月に属するか
  weekday: number // 0=Sun..6=Sat
}

/** 月表示用の 6 週 × 7 日グリッド（日曜始まり）。 */
export function monthGrid(focus: Date): CalendarDay[] {
  const year = focus.getUTCFullYear()
  const month = focus.getUTCMonth()
  const first = new Date(Date.UTC(year, month, 1))
  const start = addDays(first, -first.getUTCDay()) // 直前の日曜
  const days: CalendarDay[] = []
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i)
    days.push({
      date: ymd(d),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month,
      weekday: d.getUTCDay(),
    })
  }
  return days
}

/** 週表示用の 7 日（日曜始まり）。 */
export function weekDays(focus: Date): CalendarDay[] {
  const start = addDays(focus, -focus.getUTCDay())
  const days: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i)
    days.push({
      date: ymd(d),
      day: d.getUTCDate(),
      inMonth: true,
      weekday: d.getUTCDay(),
    })
  }
  return days
}

/** focus を type 単位で前後に移動した新しい focus を返す。 */
export function shiftFocus(focus: Date, type: CalendarType, dir: 1 | -1): Date {
  if (type === 'month') return addMonths(focus, dir)
  if (type === 'week') return addDays(focus, dir * 7)
  return addDays(focus, dir)
}

export const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土']
export const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
