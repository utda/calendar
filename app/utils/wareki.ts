// 西暦 → 和暦（旧 pages/index.vue の toWareki を移植）
export function toWareki(y: number): string {
  if (y > 2018) return '令和' + (y - 2018)
  if (y > 1988) return '平成' + (y - 1988)
  if (y > 1925) return '昭和' + (y - 1925)
  if (y > 1911) return '大正' + (y - 1911)
  if (y > 1867) return '明治' + (y - 1867)
  return ''
}

export const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** 月名（1-12）。locale に応じて「N月」/「Mon」。 */
export function monthName(index: number, locale: string): string {
  return locale === 'ja' ? `${index}月` : (MONTHS_EN[index - 1] ?? '')
}
