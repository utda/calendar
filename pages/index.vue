<template>
  <div>
    <Header
      :header="header"
      :url="return_url"
      :label="return_label"
      :u="u"
      :description="description"
      :top="true"
    />

    <template v-if="u">
      <v-container>
        <SearchForm
          :q="q"
          :collections="collections"
          :collections_query="
            index.collections ? Object.keys(index.collections) : []
          "
          :u="u"
          :search_place_holder="search_place_holder"
        />
      </v-container>

      <v-container fluid>
        <v-card class="mt-5" flat>
          <v-card-text>
            <p>{{ $t('search_result') }}: {{ total.toLocaleString() }}</p>
            <v-simple-table>
              <template #default>
                <tbody>
                  <tr v-for="(item, index2) in items" :key="index2">
                    <th>
                      {{ item.year
                      }}<template v-if="$i18n.locale == 'ja'">
                        ({{ item.wareki }}) 年</template
                      >
                    </th>
                    <td
                      v-for="index3 in 12"
                      :key="index3"
                      class="text-xs-right"
                    >
                      <!-- <a :href="'list?q='+q+'&date=' + props.item.year + '-' + index + '&type=' + type" v-if="props.item.month[index-1] > 0">{{index}}月 ({{ props.item.month[index-1] }})</a> -->
                      <router-link
                        v-if="item.month[index3 - 1] > 0"
                        :to="{
                          path: 'item',
                          query: {
                            param: JSON.stringify({
                              q: q,
                              collections: collections,
                            }),
                            u: u,
                            date: item.year + '-' + index3,
                          },
                        }"
                        >{{ getMonthName(index3) }} ({{
                          item.month[index3 - 1]
                        }})</router-link
                      >
                      <span v-else>{{ getMonthName(index3) }}</span>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-container>

      <Footer :footer="footer" />
    </template>
    <template v-else>
      <v-container>
        <p>使用方法については、以下のページをご確認ください。</p>
        <p>Please refer to the following page for usage instructions.</p>
        <a :href="github">{{ github }}</a>
      </v-container>
    </template>
  </div>
</template>

<script>
import Header from '~/components/Header'
import Footer from '~/components/Footer'
import SearchForm from '~/components/SearchForm'

function toWareki(y) {
  let s = ''
  if (y > 1988) {
    s = '平成' + (y - 1988)
  } else if (y > 1925) {
    s = '昭和' + (y - 1925)
  } else if (y > 1911) {
    s = '大正' + (y - 1911)
  } else if (y > 1867) {
    s = '明治' + (y - 1867)
  }
  return s
}

export default {
  name: 'IndexPage',
  components: {
    SearchForm,
    Header,
    Footer,
  },
  data() {
    return {
      github: 'https://github.com/ldasjp8/calendar',
      return_url: null,
      return_label: null,
      header: null,
      footer: null,
      items: [],
      data_all: [],
      q: '',
      u: null,
      description: '',
      search_place_holder: '',
      index: {},
      collections: [],
      total: 0,
    }
  },
  watch: {
    $route() {
      this.search()
    },
  },
  created() {
    const param = Object.assign({}, this.$route.query)

    if (!param.u) {
      // vueからnuxtへの移行
      const hash = this.$route.hash
      if (hash) {
        const u = hash.split('?u=')[1].replace(':/', '://')
        location.href = this.localePath({
          name: 'index',
          query: {
            u,
          },
        })
      }
      return
    }
    this.u = param.u

    if (param.param) {
      const query = JSON.parse(param.param)

      this.q = query.q ? query.q : this.q
      this.collections = query.collections
        ? query.collections
        : this.collections
    }

    this.$axios.$get(this.u).then((response) => {
      const result = response

      this.header = result.header
      this.footer = result.footer
      this.return_url = result.return_url
      this.return_label = result.return_label

      this.description = result.description
      this.search_place_holder = result.search_place_holder

      const data = result.data
      this.data_all = data

      const index = {
        fulltext: {},
      }

      for (let i = 0; i < data.length; i++) {
        const obj = data[i]
        let fulltext = ''

        for (const key in obj) {
          if (!index[key]) {
            index[key] = {}
          }
          let values = obj[key]
          if (!(values instanceof Array)) {
            values = [values]
          }
          for (let j = 0; j < values.length; j++) {
            const value = values[j]

            // URIの場合は無視
            if (value.startsWith('http')) {
              continue
            }

            fulltext += value + ' '
            if (!index[key][value]) {
              index[key][value] = []
            }
            index[key][value].push(i)
          }
        }
        index.fulltext[fulltext] = [i]
      }

      this.index = index

      this.search()
    })
  },
  methods: {
    search() {
      const data = this.filter()

      this.total = data.length

      const items = []
      this.items = items

      let minYear = 3000
      let maxYear = 0
      const map = {}

      for (let i = 0; i < data.length; i++) {
        const obj = data[i]

        const date = obj.date
        const c = 1

        const tmp = date.split('-')
        const year = Number(tmp[0])

        if (year < minYear) {
          minYear = year
        }

        if (year > maxYear) {
          maxYear = year
        }

        const month = Number(tmp[1])

        if (!map[year]) {
          map[year] = {}
        }

        const tmp2 = map[year]

        if (!tmp2[month]) {
          tmp2[month] = 0
        }

        tmp2[month] += c
      }

      for (let year = minYear; year <= maxYear; year++) {
        const obj = {
          year,
          wareki: toWareki(year),
          month: [],
        }

        const tmp = map[year]

        for (let month = 1; month <= 12; month++) {
          const value = tmp != null && tmp[month] ? tmp[month] : 0
          obj.month.push(value)
        }

        items.push(obj)
      }
    },
    filter() {
      const index = this.index

      let collectionIndex = []
      let fulltextIndex = []

      const collections = this.collections

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

      const q = this.q
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
        data.push(this.data_all[value])
      }

      return data
    },
    getMonthName(index) {
      if (this.$i18n.locale === 'ja') {
        return index + '月'
      } else {
        const monthEnglishList = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        return monthEnglishList[index - 1]
      }
    },
  },
}
</script>
