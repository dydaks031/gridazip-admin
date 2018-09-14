<template>
  <div>
    <div class="datepicker-view">
      <datepicker v-model="dateRange.startDate" class="datepicker"/>
      ~
      <datepicker v-model="dateRange.endDate" class="datepicker"/>
      <button class="search-btn button" @click="queryReports">조회</button>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" style="width:25vw;">
          <p class="title">일별 사용자</p>
          <analytics-users-chart :chart-data="lineData" :options="{maintainAspectRatio: false}"></analytics-users-chart>
        </article>
      </div>
      <div class="tile is-parent">
        <article class="tile is-child box" style="width:25vw;">
          <p class="title">이탈율</p>
          <analytics-users-chart :chart-data="bounceRateData" :options="{maintainAspectRatio: false}"></analytics-users-chart>
        </article>
      </div>
      <div class="tile is-parent">
        <article class="tile is-child box" style="width:25vw;">
          <p class="title">세션 시간</p>
          <analytics-users-chart :chart-data="avgSessionDurationData" :options="{maintainAspectRatio: false}"></analytics-users-chart>
        </article>
      </div>
    </div>

    <div class="tile is-ancestor">
      <div class="tile is-parent is-12">
        <article class="tile is-child box">
          <h4 class="title">일별 문의 건수</h4>
          <div class="content">
            <analytics-users-chart :chart-data="completedCountData" :options="{maintainAspectRatio: false}"></analytics-users-chart>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import AnalyticsUsersChart from './AnalyticsUsersChart'
  import _ from 'underscore'
  import moment from 'moment'
  import datepicker from 'vue-bulma-datepicker'

  export default {
    components: {
      AnalyticsUsersChart,
      datepicker
    },
    data () {
      return {
        rowDataList: {},
        labelList: [],
        backgroundColor_3: [
          'rgba(31, 200, 219, 1)',
          'rgba(151, 205, 118, 1)'
        ],
        options_3: {
          tooltips: {
            mode: 'label'
          }
        },
        dateRange: {},
        lineData: null,
        bounceRateData: null,
        avgSessionDurationData: null,
        channelUserList: [],
        completedCountData: null
      }
    },

    computed: {
    },
    methods: {
      queryReports () {
      // console.log(window.gapi.auth.signIn())
      // Replace with your view ID.

        window.gapi.client.init({
          'clientId': '149704865346-ohiqqr8atn0fb4q1rttkelp693b20ea3.apps.googleusercontent.com',
          'scope': 'https://www.googleapis.com/auth/analytics.readonly'
        }).then(() => {
          // Executes an API request, and returns a Promise.
          // The method name `language.translations.list` comes from the API discovery.
          var VIEW_ID = '136738850'
          const GoogleAuth = window.gapi.auth2.getAuthInstance()
          const isSigned = GoogleAuth.isSignedIn.get()

          if (!isSigned) {
            GoogleAuth.isSignedIn.listener((data) => {
              console.log(data)
            })
            GoogleAuth.signIn()
            throw new Error('Not Signed')
          } else {
            return window.gapi.client.request({
              path: '/v4/reports:batchGet',
              root: 'https://analyticsreporting.googleapis.com/',
              method: 'POST',
              body: {
                reportRequests: [
                  {
                    viewId: VIEW_ID,
                    dateRanges: [
                      {
                        startDate: this.dateRange.startDate,
                        endDate: this.dateRange.endDate
                      }
                    ],
                    metrics: [
                      {
                        expression: 'ga:users'
                      },
                      {
                        expression: 'ga:bounceRate'
                      },
                      {
                        expression: 'ga:avgSessionDuration',
                        formattingType: 'TIME'
                      },
                      {
                        expression: 'ga:goal1Completions'
                      }
                    ],
                    dimensions: [{
                      name: 'ga:date'
                    }]
                  }
                ]
              }
            })
          }
        })
        .then((response) => {
          var formattedJson = JSON.parse(JSON.stringify(response.result, null, 2))
          const metricsList = ['ga:users', 'ga:bounceRate', 'ga:avgSessionDuration', 'ga:goal1Completions']
          const dataList = formattedJson.reports[0].data.rows

          for (let i = 0; i < metricsList.length; i++) {
            const metrics = metricsList[i]
            this.rowDataList[metrics] = _.map(dataList, (row) => {
              return row.metrics[0].values[i]
            })
            this.labelList = _.map(dataList, (row) => {
              return moment(row.dimensions[0], 'YYYYMMDD').format('YYYY-MM-DD')
            })
          }

          this.getSeriesData('lineData', 'ga:users')
          this.getSeriesData('bounceRateData', 'ga:bounceRate')
          this.getSeriesData('avgSessionDurationData', 'ga:avgSessionDuration')

          return this.$http.get(`/api/webhook/channel/completed-list?start_date=${this.dateRange.startDate}&end_date=${this.dateRange.endDate}`)
        })
        .then((response) => {
          const dateDiff = moment(this.dateRange.endDate, 'YYYY-MM-DD').diff(moment(this.dateRange.startDate, 'YYYY-MM-Dd'), 'days')
          const channelUserList = response.data.data.channel_list

          for (let i = 0; i <= dateDiff; i++) {
            const targetDate = moment(this.dateRange.startDate, 'YYYY-MM-DD').add(i, 'day').format('YYYY-MM-DD')
            const hasTargetDate = _.find(channelUserList, (item) => {
              return item.date === targetDate
            })
            if (!hasTargetDate) {
              channelUserList.push({
                date: targetDate,
                count: 0
              })
            }
          }

          this.channelUserList = _.sortBy(channelUserList, (item) => {
            return moment(item.date, 'YYYY-MM-DD').format('X')
          })
          console.log(this.channelUserList)
          this.getCompletedCountData()
        })
        .catch(e => {
          console.error(e)
        })
      },
      getSeriesData (basket, key) {
        let data = {
          labels: this.labelList
        }
        const dataSet = this.rowDataList[key]
        if (!dataSet) {
          return {
            labels: this.labelList,
            datasets: []
          }
        }
        data.datasets = [{
          data: _.map(this.rowDataList[key], (item) => {
            return parseInt(item, 10)
          }),
          label: key,
          borderColor: this.backgroundColor_3[0].replace(/1\)$/, '.5)'),
          pointBackgroundColor: this.backgroundColor_3[0],
          backgroundColor: this.backgroundColor_3[0].replace(/1\)$/, '.5)')
        }]
        this[basket] = data
        this.$forceUpdate()
      },
      getCompletedCountData () {
        const analyticsData = this.rowDataList['ga:goal1Completions']

        const data = {
          labels: this.labelList
        }

        data.datasets = []

        data.datasets.push({
          data: _.map(analyticsData, (item) => {
            return parseInt(item, 10)
          }),
          label: 'Google Analytics Completed User',
          borderColor: this.backgroundColor_3[0].replace(/1\)$/, '.5)'),
          pointBackgroundColor: this.backgroundColor_3[0],
          backgroundColor: this.backgroundColor_3[0].replace(/1\)$/, '.5)')
        })
        data.datasets.push({
          data: _.map(this.channelUserList, (item) => {
            return parseInt(item.count, 10)
          }),
          label: 'Channel Completed User',
          borderColor: this.backgroundColor_3[1].replace(/1\)$/, '.5)'),
          pointBackgroundColor: this.backgroundColor_3[1],
          backgroundColor: this.backgroundColor_3[1].replace(/1\)$/, '.5)')
        })

        this.completedCountData = data
        this.$forceUpdate()
        console.log(data)
      }
    },
    mounted () {
      this.dateRange.startDate = moment().add(-1, 'week').format('YYYY-MM-DD')
      this.dateRange.endDate = moment().add(-1, 'days').format('YYYY-MM-DD')
      setTimeout(() => {
        this.queryReports()
      }, 10)
    }
  }
</script>

<style lang="scss" scoped>
  .datepicker-view {
    margin-bottom: 1rem;
    .datepicker {
      width: auto;
      display: inline-block;
    }
  }
</style>
