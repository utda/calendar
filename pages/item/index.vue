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
      <v-tooltip v-if="false" bottom>
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

                  <div v-if="selectedEvent.description" class="my-2">
                    {{
                      truncate($utils.toString(selectedEvent.description), 100)
                    }}
                  </div>

                  <div v-if="selectedEvent.metadata" class="mt-5">
                    <v-simple-table dense>
                      <template #default>
                        <tbody>
                          <template v-for="item in selectedEvent.metadata">
                            <tr
                              v-if="item.label !== 'description'"
                              :key="item.name"
                            >
                              <th>{{ item.label }}</th>
                              <td>{{ $utils.toString(item.value) }}</td>
                            </tr>
                          </template>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <Footer :footer="result.footer" />
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
      items: [],
      q: null,
      u: null,
      search_place_holder: '',
      index: {},
      collections: [],

      result: {},

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

    this.focus = param.date ? param.date + '-01' : '2020-01-01'
    const focusArr = this.focus.split('-')
    this.yearAndMonth = focusArr[0] + '-' + focusArr[1]

    this.search()
  },
  methods: {
    search() {
      const data = this.$utils.filter(
        this.index,
        this.collections,
        this.q,
        this.data_all
      )

      const events = []

      for (let i = 0; i < data.length; i++) {
        const obj = data[i]
        events.push({
          name: obj.label,
          start: obj.date,
          end: obj.date,
          url: obj.url,
          metadata: obj.metadata,
          thumbnail: obj.thumbnail,
          description: obj.description,
        })
      }

      this.events = events
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
    truncate(str, len) {
      return str.length <= len ? str : str.substr(0, len) + '...'
    },
  },
}
</script>
<style>
/* stylelint-disable */
.v-calendar-daily_head-day {
  overflow-y: auto;
  max-height: 600px;
}
</style>
