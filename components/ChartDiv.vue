<template>
  <div>
    <v-card flat outlined class="pa-4">
      <h3>{{ header }}</h3>

      <BarChart :labels="labels" :datasets="datasets" :max="thres"></BarChart>

      <div class="mt-10">
        <v-slider
          v-model="thres"
          :label="$t('yAxesMax')"
          :max="Math.max(...datasets[0].data)"
          :min="2"
          thumb-label="always"
        ></v-slider>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  props: ['labels', 'datasets', 'header'],
  data() {
    return {
      thres: 0,
    }
  },

  mounted() {
    this.thres = Math.max(...this.datasets[0].data)
  },

  methods: {},
}
</script>
