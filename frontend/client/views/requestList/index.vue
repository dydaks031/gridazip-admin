<template>
  <div>
    <div class="search box">
      <div class="block">
        <div class="is-clearfix">
          <div class="is-pulled-left is-horizontal searchbox">
            <div class="control is-inline-block">
              <label class="label">담당자</label>
              <input class="input" type="text" placeholder="검색 내용 입력" v-model="searchData.rq_manager">
            </div>
            <div class="control is-inline-block">
              <label class="label">진행상태</label>
              <div class="select">
                <select v-model="searchData.rq_process_status">
                  <option value="" selected="selected">선택</option>
                  <option v-for="status in requestStatusConfig.statusList" :value="status.label">{{status.label}}</option>
                </select>
              </div>
            </div>
            <div class="control is-inline-block">
              <label class="label">신청일자</label>
              <p class="control">
                <datepicker v-model="searchData.rq_start_dt" :ref="'start_datepicker'"/>
                ~
                <datepicker v-model="searchData.rq_end_dt" :ref="'end_datepicker'"/>
                <button class="button" @click="resetDate">초기화</button>
              </p>
            </div>
          </div>
          <div class="is-pulled-right search-btn">
            <a class="button is-info" @click="loadQueryData">검색</a>
          </div>
        </div>
      </div>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h4 class="title">상담신청내역</h4>
          <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister">등록</a>
          <table class="table">
            <colgroup>
              <col width="10%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
              <col width="10%" />
              <col width="10%" />
              <col width="10%" />
            </colgroup>
            <thead>
            <tr>
              <th>현장구분</th>
              <th>이름</th>
              <th>별칭</th>
              <th>전화번호</th>
              <th>담당자</th>
              <th>진행상태</th>
              <th>실패사유</th>
              <!--<th>방문상담여부</th>-->
              <th>신청일자</th>
              <th>삭제</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in data" v-on:click="moveToPage(item)" :class="getStatusType(item)">
              <td>{{item.rq_site_type}}</td>
              <td>{{item.rq_name}}</td>
              <td>{{item.rq_nickname}}</td>
              <td>{{item.rq_phone}}</td>
              <td>{{item.rq_manager}}</td>
              <td>{{item.rq_process_status}}</td>
              <td>{{item.rq_fail_reason}}</td>
              <!--<td>-->
                <!--<input type="radio" :name="'rq_is_valuable_' + item.rq_pk" value="1" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'rq_is_valuable')"/><label >X</label>-->
                <!--<input type="radio" :name="'rq_is_valuable_' + item.rq_pk" value="3" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'rq_is_valuable')"/><label >&#9651;</label>-->
                <!--<input type="radio" :name="'rq_is_valuable_' + item.rq_pk" value="2" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'rq_is_valuable')"/><label >O</label>-->
              <!--</td>-->
              <!--<td>-->
                <!--<input type="radio" :name="'rq_is_contracted_' + item.rq_pk" value="1" v-model="item.rq_is_contracted" v-on:click.stop="doThis" v-on:change="updateRowContracted(item, 'rq_is_contracted')"/><label >X</label>-->
                <!--<input type="radio" :name="'rq_is_contracted_' + item.rq_pk" value="2" v-model="item.rq_is_contracted" v-on:click.stop="doThis" v-on:change="updateRowContracted(item, 'rq_is_contracted')"/><label >O</label>-->
              <!--</td>-->
              <td>{{getComputedDate(item.rq_reg_dt)}}</td>
              <td>
                <button class="button" v-on:click.stop="deleteRow(item)">삭제</button>
              </td>
            </tr>
            </tbody>
          </table>
        </article>
      </div>
    </div>
    <div>
      <pagination-vue :options="page" :page-click="moveToPagination" />
    </div>
  </div>
</template>

<script>
  import Pagenation from '../../services/pagination'
  import Filter from '../../services/filter'
  import router from '../../router'
  import moment from 'moment'
  import PaginationVue from '../components/pagination'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import mixin from '../../services/mixin'
  import PrivateWrapper from '../components/PrivateWrapper'
  import requestStatusConfig from '../../config/request-status-config'
  import Datepicker from 'vue-bulma-datepicker'
  import Utils from '../../services/utils'

  const NotificationComponent = Vue.extend(Notification)

  const queryApi = '/api/request'

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
    name: 'requestList',
    components: {
      PrivateWrapper,
      PaginationVue,
      Notification,
      Datepicker
    },
    mixins: [mixin],
    data () {
      return {
        page: new Pagenation(),
        filter: new Filter(),
        data: [],
        isLoading: false,
        searchData: {
          rq_manager: '',
          rq_start_dt: '',
          rq_end_dt: '',
          rq_process_status: ''
        },
        requestStatusConfig,
        moment
      }
    },
    methods: {
      loadData () {
        this.isLoading = true
        this.data.length = 0
        const queryString = Utils.getQueryString(this.searchData)
        this.$http.get(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}&${queryString}`, {
          page: this.page.get(),
          filter: this.filter.get()
        }).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data
          this.data = dataList.data
          this.page.set(dataList.page)
        }).catch((error) => {
          console.log(error)
        })
      },
      moveToPage (curItem) {
        console.log(curItem)
        router.push({
          path: `/private/request-list/${curItem.rq_pk}`,
          params: curItem
        })
      },
      updateRowState: function (sendData = {}, key) {
        console.log(`${queryApi}/${key}`)
        this.$http.put(`${queryApi}/${key}`, sendData)
          .then((data) => {
            if (data.data.code !== 200) {
              openNotification({
                message: '수정에 실패하였습니다.',
                type: 'danger',
                duration: 1500
              })
            }

            this.$forceUpdate()
          })
          .catch((error) => {
            console.log(error)
          })
      },
      updateRowValuable (curItem, key) {
        const sendData = {}
        sendData[key] = curItem[key]
        this.updateRowState(sendData, curItem.rq_pk)
      },
      updateRowContracted (curItem, key) {
        const sendData = {}
        sendData[key] = curItem[key]
        this.updateRowState(sendData, curItem.rq_pk)
      },
      deleteRow (curItem) {
        this.$http.delete(`${queryApi}/${curItem.rq_pk}`, {})
          .then((data) => {
            openNotification({
              message: '삭제되었습니다.',
              type: 'success',
              duration: 1500
            })
            if (this.page.getPage() > this.page.getLimit()) {
              this.page.setPage(this.page.getPage() - this.page.getLimit())
            } else {
              this.page.setPage(0)
              this.page.setPoint(null)
            }
            this.page.setLimit(20)
            this.loadData()
          })
          .catch((error) => {
            console.log(error)
          })
      },
      doThis () {

      },
      moveToPagination (index) {
        this.page.setIndex(index)
        this.loadData()
      },
      moveToRegister () {
        router.push({
          path: '/private/request-list/register'
        })
      },
      loadQueryData () {
        this.page.setPoint(0)
        this.page.setPage(0)
        this.loadData()
      },
      getStatusType (item) {
        const isGreenStatus = [
          '신규신청',
          '상담예약완료',
          '1차제안서완료',
          '1차제안서수정',
          '1차통화부재중',
          '2차통화부재중',
          '1차제안부재중',
          '2차제안부재중'
        ]
        const parentStatus = ['상담실패', '계약실패']
        const isRedStatus = [
          '3차제안부재중',
          '3차통화부재중',
          '거리문제',
          '실수',
          '부분인테리어',
          '견적초과',
          '고객변심',
          '잘못된번호'
        ]
        const isBlueStatus = [
          '계약완료'
        ]
        if (isGreenStatus.indexOf(item.rq_process_status) > -1) {
          return 'is-green'
        } else if (isRedStatus.indexOf(item.rq_process_status) > -1 || (parentStatus.indexOf(item.rq_process_status) > -1 && isRedStatus.indexOf(item.rq_fail_reason) > -1)) {
          return 'is-red'
        } else if (isBlueStatus.indexOf(item.rq_process_status) > -1) {
          return 'is-blue'
        }
        return ''
      },
      resetDate () {
        this.searchData.rq_start_dt = ''
        this.searchData.rq_end_dt = ''
        this.$refs.end_datepicker.selectedDates = null
        this.$refs.start_datepicker.selectedDates = null
      }
    },
    beforeRouteUpdate (to, from, next) {
      this.loadData()
      next()
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style scoped lang="scss">
  article {
    overflow: auto;
  }
  #addBtn {
    margin: 1rem 0;
  }
  .search {
    input {
      width: auto;
    }

    select {
      width: auto;
    }
  }
  .search-btn {
    line-height: 60px;
    a {
      vertical-align: bottom;
    }
  }
  .searchbox {
    div.control {
      margin-right: 3rem;
    }
  }
  /*.is-green {*/
    /*color:rgba(52, 168, 83, 1.00)*/
  /*}*/
  /*.is-red {*/
    /*color:rgba(234, 67, 53, 1.00)*/
  /*}*/
  /*.is-blue {*/
    /*color:rgba(66, 133, 244, 1.00)*/
  /*}*/
</style>
