// 旧 plugins/utils.ts の Utils クラスを純関数として移植。
// インデックス構築（index.collections / index.fulltext）と積集合フィルタの
// アルゴリズムは旧実装と同一。データ取得のみ axios → $fetch に変更。

export interface MetadataField {
  label: string
  value: string[] | string
}

export interface CalendarItem {
  date: string
  label?: string
  url?: string
  thumbnail?: string
  description?: string | string[]
  collections?: string[]
  metadata: MetadataField[]
  [key: string]: unknown
}

export interface CalendarLink {
  label: string
  value: string
}

export interface CalendarData {
  index: any
  items: CalendarItem[]
  header?: string
  footer?: string
  links?: CalendarLink[]
  description?: string
  u: string
  link_label?: Record<string, string>
  lang_label?: Record<string, string>
  stats?: string[]
  redirect?: boolean
}

/** データ URL を読み込み、検索用インデックスを構築して返す。 */
export async function getCalendarIndex(
  query: Record<string, any>,
  hash = ''
): Promise<Partial<CalendarData>> {
  let u = ''

  if (!query.u) {
    // 旧 vue 版（#/?u=...）からの移行リダイレクト
    if (hash) {
      u = hash.split('?u=')[1]?.replace(':/', '://') ?? ''
      return { u, redirect: true }
    }
    return {}
  }

  u = query.u

  const result: any = await $fetch(u)

  const items: CalendarItem[] = result.items || result.data || []

  const index: any = { fulltext: {} }

  for (let i = 0; i < items.length; i++) {
    const obj: any = items[i]
    let fulltext = ''

    // メタデータ以外のフィールド
    for (const key in obj) {
      if (key === 'metadata') continue
      const label = key
      let values = obj[key]

      if (!index[label]) index[label] = {}
      if (!(values instanceof Array)) values = [values]

      for (const value of values) {
        if (String(value).startsWith('http')) continue // URI は無視
        fulltext += value + ' '
        if (!index[label][value]) index[label][value] = []
        index[label][value].push(i)
      }
    }

    // メタデータ
    const metadata = obj.metadata || []
    for (const m of metadata) {
      const label = m.label
      let values = m.value
      if (!index[label]) index[label] = {}
      if (!(values instanceof Array)) values = [values]

      for (const value of values) {
        if (String(value).startsWith('http')) continue
        fulltext += value + ' '
        if (!index[label][value]) index[label][value] = []
        index[label][value].push(i)
      }
    }

    const tmp = index.fulltext
    if (!tmp[fulltext]) tmp[fulltext] = []
    tmp[fulltext].push(i)
  }

  return {
    index,
    items,
    header: result.header,
    footer: result.footer,
    links: result.links,
    description: result.description,
    u,
    link_label: result.link_label,
    lang_label: result.lang_label,
    stats: result.stats,
  }
}

/** コレクション + 全文クエリの積集合で items を絞り込む。 */
export function filterItems(
  index: any,
  collections: string[],
  q: string | null,
  items: CalendarItem[]
): CalendarItem[] {
  let collectionIndex: number[] = []
  let fulltextIndex: number[] = []

  if (!collections || collections.length === 0) {
    for (const key in index.collections) {
      collectionIndex = collectionIndex.concat(index.collections[key])
    }
  } else {
    for (const collection of collections) {
      const indexArr = index.collections?.[collection]
      if (indexArr) collectionIndex = collectionIndex.concat(indexArr)
    }
  }

  if (!q) {
    for (const key in index.fulltext) {
      fulltextIndex = fulltextIndex.concat(index.fulltext[key])
    }
  } else {
    for (const key in index.fulltext) {
      if (key.includes(q)) {
        fulltextIndex = fulltextIndex.concat(index.fulltext[key])
      }
    }
  }

  const y = new Set(fulltextIndex)
  const intersection = new Set([...new Set(collectionIndex)].filter((e) => y.has(e)))

  const data: CalendarItem[] = []
  for (const value of intersection) {
    const item = items[value]
    if (item) data.push(item)
  }
  return data
}

/** 配列/文字列を表示用文字列へ。 */
export function toDisplayString(arr: unknown, delimiter = ', '): string {
  if (arr == null) return ''
  if (typeof arr !== 'object') return String(arr)
  const a = arr as unknown[]
  if (a.length === 1) return String(a[0])
  return a.join(delimiter)
}
