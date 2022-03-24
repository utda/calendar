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
    <v-container class="my-5">
      <div v-if="item">
        <ChartDiv
          :header="$t('itemsByYear')"
          :labels="item.labels"
          :datasets="item.datasets"
        >
        </ChartDiv>
      </div>

      <div v-if="item4day" class="mt-10">
        <ChartDiv
          :header="$t('itemsByDay')"
          :labels="item4day.labels"
          :datasets="item4day.datasets"
        >
        </ChartDiv>
      </div>

      <div v-for="(freq, key) in freqs" :key="key" class="mt-10">
        <ChartDiv
          :header="key"
          :labels="freq.labels"
          :datasets="[{ label: $t('item'), data: freq.data }]"
        >
        </ChartDiv>
      </div>
    </v-container>

    <Footer :footer="result.footer" />
  </div>
</template>

<script>
import Header from '~/components/Header'
import Footer from '~/components/Footer'
// import BarChart from '~/components/BarChart'
import ChartDiv from '~/components/ChartDiv'

export default {
  components: {
    Header,
    Footer,
    // BarChart,
    ChartDiv,
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
      freqs: {},

      stats: [],
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

    this.stats = data.stats

    this.analyze()
    this.analyze2()
    this.analyzeMetadata()
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
    analyzeMetadata() {
      const freqs = {}
      const stats = this.stats
      for (const item of this.data_all) {
        const metadata = item.metadata
        for (const m of metadata) {
          const label = m.label

          if (stats && !stats.includes(label)) {
            continue
          }

          if (!freqs[label]) {
            freqs[label] = {}
          }
          const freq = freqs[label]
          const values = m.value
          for (const value of values) {
            if (!freq[value]) {
              freq[value] = 0
            }
            freq[value] += 1
          }
        }
      }

      const freqs_ = {}

      for (const key in freqs) {
        const freq = freqs[key]
        // Create items array
        const items = Object.keys(freq).map(function (key) {
          return [key, freq[key]]
        })

        // Sort the array based on the second element
        items.sort(function (first, second) {
          return second[1] - first[1]
        })

        const labels = []
        const data = []

        for (const e of items) {
          labels.push(e[0])
          data.push(e[1])
        }

        freqs_[key] = {
          labels,
          data,
        }
      }

      this.freqs = freqs_
    },
  },
}
</script>
