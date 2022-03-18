<template>
  <div>
    <Header
      :header="header"
      :links="links"
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
        <div>
          使用方法については、以下のページをご確認ください。 / Please refer to
          the following page for usage instructions.
        </div>
        <div class="mt-5">
          <a :href="github">{{ github }}</a>
        </div>
        <div class="mt-10">
          JSONファイルのURLを入力してください。 / Enter the URL of the JSON
          file.
        </div>
        <div class="mt-5">
          <v-text-field
            v-model="json_url"
            rounded
            filled
            hide-details
            dense
            :placeholder="`http...`"
            @keyup.enter="add"
          ></v-text-field>
          <div class="mt-5">
            <v-btn class="ma-1" rounded depressed color="primary" @click="add">
              {{ $t('add') }}</v-btn
            >
            <v-btn
              class="ma-1"
              rounded
              depressed
              color="success"
              @click="json_url = sample_url"
            >
              {{ $t('example') }}</v-btn
            >
          </div>
        </div>
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
  if (y > 2018) {
    s = '令和' + (y - 2018)
  } else if (y > 1988) {
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
      json_url: '',
      sample_url: 'https://nakamura196.github.io/json/calendar.json',
      github: 'https://github.com/ldasjp8/calendar',
      links: [],
      header: null,
      footer: null,
      items: [],
      data_all: [],
      q: '',
      u: null,
      description: '',
      index: {},
      collections: [],
      total: 0,
    }
  },
  watch: {
    $route() {
      if (this.u !== this.$route.query.u) {
        this.init()
      } else {
        this.search()
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      const param = Object.assign({}, this.$route.query)

      if (param.param) {
        const query = JSON.parse(param.param)

        this.q = query.q ? query.q : this.q
        this.collections = query.collections
          ? query.collections
          : this.collections
      }

      //
      const data = await this.$utils.getIndex(this.$route)

      if (data.redirect) {
        this.$router.push(
          this.localePath({
            name: 'index',
            query: {
              u: data.u,
            },
          })
        )
      }

      this.u = data.u
      this.header = data.header
      this.footer = data.footer
      this.links = data.links
      this.index = data.index
      this.data_all = data.items
      this.description = data.description

      this.search()
    },
    search() {
      const data = this.$utils.filter(
        this.index,
        this.collections,
        this.q,
        this.data_all
      )

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
    add() {
      this.$router.push(
        this.localePath({
          name: 'index',
          query: { u: this.json_url },
        })
      )
    },
  },
}
</script>
