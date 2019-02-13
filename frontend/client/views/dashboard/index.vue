<template>
  <div class="dashboard">
    <div class="tabs is-boxed">
      <ul>
        <li @click="changeTabs('trafficData')" :class="{'is-active': tabInfo.trafficData}"><a>Dashboard</a></li>
        <li @click="changeTabs('constructionData')" :class="{'is-active': tabInfo.constructionData}" ><a>시공관리</a></li>
      </ul>
    </div>
    <div class="construction-info-view" v-if="tabInfo.constructionData">
      <div class="datepicker-view">
        <datepicker v-model="constructionDate" class="datepicker" :config="{dateFormat:'Y-m'}"/>
        <button class="search-btn button" @click="getConstructionDashboardData">조회</button>
      </div>
      <div class="tile is-ancestor">
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">진행중인 공사 목록</p>
            <div class="construction-info">
              <p>총 공사 건수: {{constructionData.length}} 건</p>
            </div>
            <div class="construction-info">
              <p>총 매출: {{addCommas(constructionSales)}} 만원</p>
            </div>
            <div class="construction-wrapper is-flex">
              <div class="construction-item" v-for="construction in constructionData">
                  <h3 class="subtitle">{{construction.pc_name}} {{construction.pc_nickname?'('+construction.pc_nickname+')':''}}</h3>
                  <div class="percentage-wrapper">
                    <span class="">진행율</span>
                    <div class="doughnut">
                      <div class="progress-container is-flex">
                        <progress :value="construction.completedPercentage" max="100" class="progress"></progress>
                      </div>
                    </div>
                  </div>
                <div class="checklist" v-if="Object.keys(construction.checkList).length > 0">
                  <table class="table is-striped">
                    <thead>
                    <tr>
                      <th>공사</th>
                      <th>자재</th>
                      <th>인력</th>
                      <th>메모</th>
                    </tr>
                    </thead>
                    <tbody v-for="(checkListByDate, index) in construction.checkList">
                    <tr class="date-header">
                      <th colspan="4">{{index}}</th>
                    </tr>
                    <tr>
                    <tr v-for="checkListItem in checkListByDate">
                      <td>
                        <span>{{checkListItem.ct_name}}</span>
                      </td>
                      <td>
                        <input type="checkbox" class="checkbox" v-model="checkListItem.cl_resource" @change="updateCheckListStatus(construction.pc_pk, checkListItem)" />
                      </td>
                      <td>
                        <input type="checkbox" class="checkbox" v-model="checkListItem.cl_constructor" @change="updateCheckListStatus(construction.pc_pk, checkListItem)" />
                      </td>
                      <td>
                        <span >{{checkListItem.cl_memo}}</span>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <div class="none-checklist-data" v-else>
                  <span>시공 현황이 없습니다.</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div class="traffic-data-view" v-if="tabInfo.trafficData">
      <div class="datepicker-view">
        <datepicker v-model="dateRange.startDate" class="datepicker" :config="{dateFormat:'Y-m-d'}"/>
        ~
        <datepicker v-model="dateRange.endDate" class="datepicker" :config="{dateFormat:'Y-m-d'}"/>
        <button class="search-btn button" @click="queryReports">조회</button>
      </div>
      <div class="tile is-ancestor">
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">일별 사용자</p>
            <analytics-users-chart :chart-data="lineData" :options="{maintainAspectRatio: false}"></analytics-users-chart>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">이탈율</p>
            <analytics-users-chart :chart-data="bounceRateData" :options="{maintainAspectRatio: false}"></analytics-users-chart>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
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
  </div>
</template>

<script>
  import AnalyticsUsersChart from './AnalyticsUsersChart'
  import _ from 'underscore'
  import moment from 'moment'
  import datepicker from 'vue-bulma-datepicker'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import mixin from '../../services/mixin'

  const NotificationComponent = Vue.extend(Notification)

  const openNotification = (propsData = {
    title: '',
    message: '',
    type: '',
    direction: '',
    duration: 4500,
    container: '.notifications'
  }) => {
    return new NotificationComponent({
      el: document.createElement('div'),
      propsData
    })
  }

  export default {
    components: {
      AnalyticsUsersChart,
      datepicker
    },
    mixins: [mixin],
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
        constructionDate: '',
        lineData: null,
        bounceRateData: null,
        avgSessionDurationData: null,
        channelUserList: [],
        completedCountData: null,
        tabInfo: {
          constructionData: true,
          trafficData: false
        },
        constructionData: [],
        constructionSales: 0
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
          const VIEW_ID = '136738850'
          const GoogleAuth = window.gapi.auth2.getAuthInstance()
          const isSigned = GoogleAuth.isSignedIn.get()
          if (!isSigned) {
            GoogleAuth.isSignedIn.listen((updateSigned) => {
              if (updateSigned) {
                this.queryReports()
              }
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
          const formattedJson = JSON.parse(JSON.stringify(response.result, null, 2))
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
          this.getCompletedCountData()
        })
        .catch(e => {
          console.error(e)
        })
      },
      changeTabs (tabId) {
        for (let i in this.tabInfo) {
          this.tabInfo[i] = false
        }
        this.tabInfo[tabId] = true

        switch (tabId) {
          case 'constructionData':
            this.getConstructionDashboardData()
            break
          default:
            break
        }
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
      },
      getConstructionDashboardData () {
        this.$http.get(`/api/dashboard/construction?date=${this.constructionDate}`)
          .then((response) => {
            this.constructionData = response.data.data
            for (let i = 0; i < this.constructionData.length; i++) {
              this.constructionData[i].checkList = _.groupBy(this.constructionData[i].checkList, 'cl_date')
            }

            return this.$http.get(`/api/dashboard/construction/budget?date=${this.constructionDate}`)
          })
          .then((response) => {
            this.constructionSales = response.data.data.sales
          })
          .catch((e) => {
            console.error(e)
          })
      },
      updateCheckListStatus (id, item) {
        item.cl_date = moment(item.cl_date, 'YYYY-MM-DD').format('X')
        this.$http.put(`/api/contract/${id}/checklist/${item.cl_pk}`, item)
          .then((response) => {
            if (response.data.code !== 200) {
              openNotification({
                message: '시공일정 수정 중 이상이 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '시공일정이 정상적으로 수정되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.getConstructionDashboardData()
          })
      }
    },
    mounted () {
      this.dateRange.startDate = moment().add(-1, 'week').format('YYYY-MM-DD')
      this.dateRange.endDate = moment().add(-1, 'days').format('YYYY-MM-DD')

      this.constructionDate = moment().format('YYYY-MM-DD')
      setTimeout(() => {
        this.getConstructionDashboardData()
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

  .traffic-data-view {
    .tile {
      &.is-child {
        width: 25vw;
      }
    }
  }

  .construction-info-view {
    .construction-wrapper {
      overflow-x: auto;
      flex-wrap: nowrap;

      .construction-item {
        flex: 0 0 25rem;
        border: 1px solid #dbdbdb;
        padding: 0.5rem;
        margin: 0.5rem;
      }
    }
  }

  .none-checklist-data {
    width: 100%;
    min-height: 15rem;
    text-align: center;
    /* line-height: 1.1; */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // mobile
  @media screen and (max-width: 999px) {
    .traffic-data-view {
      .tile {
        &.is-child {
          width: auto;
        }
      }
    }
  }
</style>
