import axios from 'axios'
export class Utils {
  async getIndex(route: any): Promise<any> {
    const param = Object.assign({}, route.query)

    let u = ''

    if (!param.u) {
      // vueからnuxtへの移行
      const hash = route.hash
      if (hash) {
        u = hash.split('?u=')[1].replace(':/', '://')

        return { u, redirect: true }
      }
      return {}
    }

    u = param.u

    const { data } = await axios.get(u)

    const result = data

    const header = result.header
    const footer = result.footer
    const links = result.links
    const stats = result.stats

    const description = result.description

    const items = result.items || result.data

    const index: any = {
      fulltext: {},
    }

    for (let i = 0; i < items.length; i++) {
      const obj = items[i]
      let fulltext = ''

      // メタデータ以外
      for (const key in obj) {
        if (key !== 'metadata') {
          const label = key
          let values = obj[key]

          if (!index[label]) {
            index[label] = {}
          }

          if (!(values instanceof Array)) {
            values = [values]
          }
          for (let j = 0; j < values.length; j++) {
            const value = values[j]

            // URIの場合は無視
            if (String(value).startsWith('http')) {
              continue
            }

            fulltext += value + ' '
            if (!index[label][value]) {
              index[label][value] = []
            }
            index[label][value].push(i)
          }
        }
      }

      // メタデータ

      const metadata = obj.metadata

      for (const m of metadata) {
        const label = m.label
        let values = m.value

        if (!index[label]) {
          index[label] = {}
        }

        if (!(values instanceof Array)) {
          values = [values]
        }
        for (let j = 0; j < values.length; j++) {
          const value = values[j]

          // URIの場合は無視
          if (String(value).startsWith('http')) {
            continue
          }

          fulltext += value + ' '
          if (!index[label][value]) {
            index[label][value] = []
          }
          index[label][value].push(i)
        }
      }

      index.fulltext[fulltext] = [i]
    }

    return {
      index,
      items,
      header,
      footer,
      links,
      description,
      u,
      link_label: result.link_label,
      lang_label: result.lang_label,
      stats,
    }
  }

  filter(index: any, collections: any[], q: any, items: any[]) {
    let collectionIndex: any[] = []
    let fulltextIndex: any[] = []

    if (collections.length === 0) {
      for (const key in index.collections) {
        collectionIndex = collectionIndex.concat(index.collections[key])
      }
    } else {
      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i]
        const indexArr = index.collections[collection]
        collectionIndex = collectionIndex.concat(indexArr)
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

    const x = new Set(collectionIndex)
    const y = new Set(fulltextIndex)
    const intersection = new Set([...x].filter((e) => y.has(e))) // 2, 3

    const data = []
    for (const value of intersection) {
      data.push(items[value])
    }

    return data
  }

  toString(arr: string[], delimiter: string = ', '): any {
    if (typeof arr !== 'object') {
      arr = [arr]
    }
    if (arr == null) {
      return ''
    }
    if (arr.length === 1) {
      return arr[0]
    } else {
      const value: string = arr.join(delimiter)
      return value
    }
  }
}

export default (_: any, inject: any) => {
  inject('utils', new Utils())
}
