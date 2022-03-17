<template>
  <div>
    <Header
      :header="header"
      :url="return_url"
      :label="return_label"
      :u="u"
      :description="description"
      :top="false"
    />

    <v-container class="mt-5">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            fab
            depressed
            :color="isFacetOpen ? 'primary' : 'grey lighten-2'"
            x-small
            class="mr-2"
            @click="isFacetOpen = !isFacetOpen"
            v-on="on"
            ><v-icon>mdi-magnify</v-icon></v-btn
          >
        </template>
        <span>{{ isFacetOpen ? $t('close_facets') : $t('open_facets') }}</span>
      </v-tooltip>

      <SearchForm
        v-if="isFacetOpen"
        class="my-5"
        :q="q"
        :collections="collections"
        :collections_query="
          index.collections ? Object.keys(index.collections) : []
        "
        :u="u"
        :search_place_holder="search_place_holder"
      />

      <v-row class="fill-height">
        <v-col>
          <v-sheet height="64">
            <v-toolbar flat color="white">
              <v-btn fab text small @click="prev">
                <v-icon small>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn fab text small @click="next">
                <v-icon small>mdi-chevron-right</v-icon>
              </v-btn>
              <v-toolbar-title class="ml-5">{{ title }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-menu bottom right>
                <template #activator="{ on }">
                  <v-btn outlined v-on="on">
                    <span>{{ $t(typeToLabel[type]) }}</span>
                    <v-icon right>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="type = 'day'">
                    <v-list-item-title>{{ $t('day') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'week'">
                    <v-list-item-title>{{ $t('week') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'month'">
                    <v-list-item-title>{{ $t('month') }}</v-list-item-title>
                  </v-list-item>
                  <!-- 
                  <v-list-item @click="type = '4day'">
                    <v-list-item-title>4 days</v-list-item-title>
                  </v-list-item>
                  -->
                </v-list>
              </v-menu>
            </v-toolbar>
          </v-sheet>
          <v-sheet height="600">
            <v-calendar
              ref="calendar"
              v-model="focus"
              color="primary"
              :events="events"
              :event-margin-bottom="3"
              :type="type"
              :locale="$i18n.locale"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
              @change="updateRange"
            ></v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
              max-width="300px"
            >
              <v-card>
                <v-card-text>
                  <div v-if="selectedEvent.thumbnail" class="mb-5">
                    <a target="_blank" :href="selectedEvent.url">
                      <v-img
                        class="grey lighten-2"
                        max-height="200px"
                        contain
                        :src="selectedEvent.thumbnail"
                        :lazy-src="selectedEvent.thumbnail"
                      ></v-img>
                    </a>
                  </div>

                  <a target="_blank" :href="selectedEvent.url">
                    {{ selectedEvent.name }}
                    <v-icon color="primary">mdi-exit-to-app</v-icon>
                  </a>

                  <div v-if="selectedEvent.description" class="mt-5">
                    {{ selectedEvent.description }}
                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <Footer :footer="footer" />
  </div>
</template>

<script>
import Header from '~/components/Header'
import Footer from '~/components/Footer'
import SearchForm from '~/components/SearchForm'

export default {
  components: {
    Header,
    Footer,
    SearchForm,
  },
  data() {
    return {
      isFacetOpen: false,
      return_url: null,
      return_label: null,
      header: null,
      footer: null,
      items: [],
      q: null,
      u: null,
      description: '',
      search_place_holder: '',
      index: {},
      collections: [],

      type: 'month',
      events: [],
      typeToLabel: {
        month: 'month',
        week: 'week',
        day: 'day',
        // "4day": "4 Days"
      },
      focus: '2000-01-01',
      start: null,
      end: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      yearAndMonth: '',
    }
  },
  computed: {
    title() {
      const { start, end } = this
      if (!start || !end) {
        return ''
      }

      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth

      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear

      const startDay = start.day + this.nth(start.day)
      const endDay = end.day + this.nth(end.day)

      switch (this.type) {
        case 'month':
          if (this.$i18n.locale === 'en') {
            return `${startMonth} ${startYear}`
          } else {
            return `${startYear}年 ${startMonth}`
          }
        case 'week':
        case '4day':
          if (this.$i18n.locale === 'en') {
            return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
          } else {
            return `${startYear}年 ${startMonth} ${startDay} - ${suffixMonth} ${endDay} ${suffixYear}`
          }

        case 'day':
          if (this.$i18n.locale === 'en') {
            return `${startMonth} ${startDay} ${startYear}`
          } else {
            return `${startYear}年 ${startMonth} ${startDay}`
          }
      }
      return ''
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: 'UTC',
        month: 'long',
      })
    },
  },
  mounted() {
    this.$refs.calendar.checkChange()
  },
  created() {
    const param = Object.assign({}, this.$route.query)

    this.u = param.u ? param.u : this.u

    this.focus = param.date ? param.date + '-01' : '2020-01-01'
    const focusArr = this.focus.split('-')
    this.yearAndMonth = focusArr[0] + '-' + focusArr[1]

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

      const events = []

      for (let i = 0; i < data.length; i++) {
        const obj = data[i]
        events.push({
          name: obj.label,
          start: obj.date,
          end: obj.date,
          url: obj.url,
          description: obj.description,
          thumbnail: obj.thumbnail,
        })
      }

      this.events = events
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
    viewDay({ date }) {
      this.focus = date
      this.type = 'day'
    },
    prev() {
      this.$refs.calendar.prev()
      this.updatePath()
    },
    next() {
      this.$refs.calendar.next()
      this.updatePath()
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        setTimeout(() => (this.selectedOpen = true), 10)
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)
      } else {
        open()
      }

      nativeEvent.stopPropagation()
    },
    updateRange({ start, end }) {
      // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
      this.start = start
      this.end = end
    },
    nth(d) {
      if (this.$i18n.locale === 'en') {
        return d > 3 && d < 21
          ? 'th'
          : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
      } else {
        return '日'
      }
    },
    handleDateClick(arg) {
      window.open(arg.event.id, '_blank')
    },
    updatePath() {
      const focusArr = this.focus.split('-')
      const yearAndMonth = focusArr[0] + '-' + focusArr[1]
      this.$router.push(
        this.localePath({
          name: 'item',
          query: {
            param: JSON.stringify({
              q: this.q,
              collections: this.collections,
            }),
            date: yearAndMonth,
            u: this.u,
          },
        })
      )
    },
  },
}
</script>
