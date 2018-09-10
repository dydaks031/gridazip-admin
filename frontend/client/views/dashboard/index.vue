<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <p class="title">One</p>
          <analytics-users-chart :chart-data="lineData"></analytics-users-chart>
        </article>
      </div>
      <div class="tile is-parent">
        <article class="tile is-child box">
          <p class="title">Four</p>
          <p class="subtitle">Subtitle</p>
        </article>
      </div>
    </div>

    <div class="tile is-ancestor">
      <div class="tile is-parent is-6">
        <article class="tile is-child box">
          <h4 class="title">Five</h4>
          <div class="content">
            <!--<chart :type="'doughnut'" :data="chartData"></chart>-->
          </div>
        </article>
      </div>
      <div class="tile is-parent is-6">
        <article class="tile is-child box">
          <h4 class="title">Six</h4>
          <div class="content">
            <!--<chart :type="'pie'" :data="chartData"></chart>-->
          </div>
        </article>
      </div>
    </div>

    <div class="tile is-ancestor">
      <div class="tile is-vertical is-9">
        <div class="tile">
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title">Seven</p>
              <p class="subtitle">Subtitle</p>
              <div class="content">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.</p>
              </div>
            </article>
          </div>
          <div class="tile is-8 is-parent">
            <article class="tile is-child box">
              <p class="title">Eight</p>
              <p class="subtitle">Subtitle</p>
              <div class="content">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.</p>
              </div>
            </article>
          </div>
        </div>
        <div class="tile">
          <div class="tile is-8 is-parent">
            <article class="tile is-child box">
              <p class="title">Nine</p>
              <p class="subtitle">Subtitle</p>
              <div class="content">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.</p>
              </div>
            </article>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title">Ten</p>
              <p class="subtitle">Subtitle</p>
              <div class="content">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.</p>
              </div>
            </article>
          </div>
        </div>
      </div>
      <div class="tile is-parent">
        <article class="tile is-child box">
          <div class="content">
            <p class="title">Eleven</p>
            <p class="subtitle">Subtitle</p>
            <div class="content">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper diam at erat pulvinar, at pulvinar felis blandit. Vestibulum volutpat tellus diam, consequat gravida libero rhoncus ut. Morbi maximus, leo sit amet vehicula eleifend, nunc dui porta orci, quis semper odio felis ut quam.</p>
              <p>Integer sollicitudin, tortor a mattis commodo, velit urna rhoncus erat, vitae congue lectus dolor consequat libero. Donec leo ligula, maximus et pellentesque sed, gravida a metus. Cras ullamcorper a nunc ac porta. Aliquam ut aliquet lacus, quis faucibus libero. Quisque non semper leo.</p>
            </div>
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

  export default {
    components: {
      AnalyticsUsersChart
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
        lineData: null
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
                        startDate: '2018-08-31',
                        endDate: '2018-09-06'
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
          console.log(formattedJson)
          const metricsList = ['ga:users', 'ga:bounceRate', 'ga:avgSessionDuration']
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

          this.getSeriesData('ga:users')
        })
        .catch(e => {
          console.error(e)
        })
      },
      getSeriesData (key) {
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
        this.lineData = data
        this.$forceUpdate()
      }
    },
    mounted () {
      setTimeout(() => {
        this.queryReports()
      }, 10)
    }
  }
</script>

<style lang="scss" scoped>
</style>
