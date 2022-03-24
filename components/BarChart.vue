<!-- Template Tag can not be merged... -->

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
// import Chart from 'chart.js'
import VueChart from 'vue-chartjs'
// 棒グラフの場合は、Barを使う
// eslint-disable-next-line
const Bar = VueChart.Bar

@Component
// mixinsもBarに変更
export default class ChartLine extends mixins(Bar) {
  @Prop({ default: [] }) labels!: any[]

  @Prop({ default: [] }) datasets!: any[]

  @Prop({ default: 0 }) max!: number

  @Watch('datasets', { deep: true })
  watchTmp() {
    this.main()
  }

  @Watch('max', { deep: true })
  watchThres() {
    this.main()
  }

  mounted() {
    this.main()
  }

  main() {
    const labels: string[] = this.labels
    const datasets: number[] = this.datasets

    const chartData: any = {
      labels,
      datasets,
    }

    const ticks: any = {
      beginAtZero: true,
      stepSize: 1,
    }

    const max = this.max
    if (max > 0) {
      ticks.max = max
    }

    const chartOption: any = {
      // アスペクト比を固定しないように変更
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks,
          },
        ],
      },
    }

    this.renderChart(chartData, chartOption)
  }
}
</script>
