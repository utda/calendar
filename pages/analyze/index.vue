<template>
  <div>
    <Header
      :header="result.header"
      :links="result.links"
      :u="result.u"
      :description="result.description"
      :top="false"
      :lang-label="result.lang_label"
      :link-label="result.link_label"
    />
    <v-container class="mt-5">
      <div v-if="item">
        <h3>{{ $t('itemsByYear') }}</h3>
        <BarChart :labels="item.labels" :datasets="item.datasets"></BarChart>
      </div>

      <div v-if="item4day" class="mt-10">
        <h3>{{ $t('itemsByDay') }}</h3>
        <BarChart
          :labels="item4day.labels"
          :datasets="item4day.datasets"
        ></BarChart>
      </div>
    </v-container>

    <Footer :footer="result.footer" />
  </div>
</template>

<script>
import Header from '~/components/Header'
import Footer from '~/components/Footer'
import BarChart from '~/components/BarChart'

export default {
  components: {
    Header,
    Footer,
    BarChart,
  },
  data() {
    return {
      isFacetOpen: false,
      items: [],
      q: null,
      u: null,
      search_place_holder: '',
      index: {},
      collections: [],

      result: {},

      item: null,
      item4day: null,
    }
  },
  computed: {
    title() {
      return ''
    },
  },
  mounted() {},
  async created() {
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

    this.u = data.u
    this.index = data.index
    this.data_all = data.items

    this.result = data

    this.analyze()
    this.analyze2()
  },
  methods: {
    analyze() {
      const freq = {}
      for (const item of this.data_all) {
        const year = Number(item.date.split('-')[0])
        if (!freq[year]) {
          freq[year] = 0
        }
        freq[year] += 1
      }

      const years = Object.keys(freq)
      const minYear = Math.min(...years)
      const maxYear = Math.max(...years)

      const labels = []
      const data = []
      for (let i = Number(minYear); i < Number(maxYear + 1); i++) {
        labels.push(i)
        data.push(freq[i] || 0)
      }

      this.item = {
        labels,
        datasets: [
          {
            label: this.$t('item'),
            data,
          },
        ],
      }
    },
    analyze2() {
      const freq = {}
      const dayOfWeekStrJP = ['日', '月', '火', '水', '木', '金', '土']
      const dayOfWeekStrEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      for (const item of this.data_all) {
        const date = item.date.split('-')
        const date2 = new Date(
          Number(date[0]),
          Number(date[1]) - 1,
          Number(date[2])
        )
        const index = date2.getDay()
        // console.log(date2, )
        if (!freq[index]) {
          freq[index] = 0
        }

        freq[index] += 1
      }

      const labels = []
      const data = []
      for (let i = 0; i < dayOfWeekStrJP.length; i++) {
        labels.push(
          this.$i18n.locale === 'ja' ? dayOfWeekStrJP[i] : dayOfWeekStrEN[i]
        )
        data.push(freq[i] || 0)
      }

      this.item4day = {
        labels,
        datasets: [
          {
            label: this.$t('item'),
            data,
          },
        ],
      }
    },
  },
}
</script>
