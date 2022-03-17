<template>
  <v-card flat outlined>
    <v-card-text>
      <v-form ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="q_"
              rounded
              filled
              :label="$t('date') || search_place_holder"
              name="q"
              hide-details
              dense
              :placeholder="`YYYY ${$t('or')} YYYY-MM`"
              @keyup.enter="search"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="collections_"
              dense
              hide-details
              rounded
              filled
              :items="collections_query"
              :label="$t('collection')"
              multiple
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-btn rounded depressed color="primary" @click="search">
              {{ $t('search') }}</v-btn
            >
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ['collections_query', 'q', 'u', 'collections', 'search_place_holder'],
  data() {
    return {
      collections_: this.collections,
      q_: this.q,
    }
  },

  methods: {
    search() {
      this.$parent.collections = this.collections_
      this.$parent.q = this.q_

      const param = {
        collections: this.collections_,
      }

      if (this.q_) {
        param.q = this.q_
      }

      this.$router.push(
        this.localePath({
          name: 'index',
          query: {
            param: JSON.stringify(param),
            u: this.u,
          },
        })
      )
    },
  },
}
</script>
