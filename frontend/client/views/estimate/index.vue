<template>
  <div>
    <div class="search box">
      <div class="block">
        <div class="is-clearfix">
          <div class="is-pulled-left is-horizontal searchbox">
            <div class="control is-inline-block">
              <label class="label">계약연월</label>
              <div class="select">
                <select v-model="searchData.constructionYear" @change="changeProcessStatus">
                  <option value="" selected="selected">년</option>
                  <option value="2019">2019</option>
                  <option value="2018">2018</option>
                </select>
              </div>
              <div class="select">
                <select v-model="searchData.constructionMonth" @change="changeProcessStatus">
                  <option value="" selected="selected">월</option>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
                  <option value="04">04</option>
                  <option value="05">05</option>
                  <option value="06">06</option>
                  <option value="07">07</option>
                  <option value="08">08</option>
                  <option value="09">09</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>
              <!--<div class="select">-->
                <!--<datepicker v-model="searchData.constructionDate" class="datepicker" :config="{dateFormat:'Y-m'}"/>-->
              <!--</div>-->
              <label class="label">계약상태</label>
              <div class="select">
                <select v-model="searchData.contractSelectedStatus" @change="changeProcessStatus">
                  <option value="" selected="selected">전체</option>
                  <option v-for="selectedStatus in requestStatusConfig.contractStatusList" :value="selectedStatus.value">{{selectedStatus.text}}</option>
                </select>
              </div>
              <!--<label class="label">2차 필터링</label>-->
              <!--<div class="select">-->
                <!--<select v-model="searchData.contractStatus" @change="clickSearchButton(true)">-->
                  <!--<option value="" selected="selected">전체</option>-->
                  <!--<option v-for="status in contractStatusList" :value="status.value">{{status.label}}</option>-->
                <!--</select>-->
              <!--</div>-->
            </div>
            <div class="is-pulled-right search-btn">
              <div class="is-pulled-right">
                <input class="input" type="text" v-model="searchData.searchWord" @keyup.enter="clickSearchButton(true)"/>
                <a class="button default" @click="clickSearchButton(true)">필터검색</a>
                <a class="button is-info" @click="clickSearchButton(false)">전체검색</a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <!--<a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister">등록</a>-->
          <!--<a class="button is-primary is-pulled-right is-medium" id="testBtn" @click="queryReports">테스트</a>-->
          <!-- The Sign-in button. This will run `queryReports()` on success. -->
          <!--<p class="g-signin2" data-onsuccess="queryReports"></p>-->
          <!--<div class="g-signin2" data-onsuccess="onSignIn"></div>-->
          <table class="table">
            <colgroup>
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
            </colgroup>
            <thead>
            <tr>
              <th>대시보드</th>
              <th>고객명</th>
              <th>별칭</th>
              <th>전화번호</th>
              <th>현장감독</th>
              <th>주소</th>
              <th>공사시작일자</th>
              <th>이사일자</th>
              <th>계약상태</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="contract in contractList" @click.stop.prevent="moveToPage(contract, $event)">
              <td><input type="checkbox" class="checkbox" v-model="contract.interested" @click.stop="updateDashboard(contract)" /></td>
              <td>{{contract.customer_name}}</td>
              <td>{{contract.customer_nickname}}</td>
              <td>{{contract.customer_phone_no}}</td>
              <td>{{contract.supervisor_name}}</td>
              <td>{{contract.address + contract.address_detail}}</td>
              <td>{{getComputedDate(contract.construction_start_date)}}</td>
              <td>{{getComputedDate(contract.moving_date)}}</td>
              <td>{{contract.status_name}}</td>
            </tr>
            <tr v-if="contractList.length === 0">
              <td class="has-text-centered" colspan=8>조회된 건이 없습니다.</td>
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
  import Pagination from '../../services/pagination'
  import Filter from '../../services/filter'
  import router from '../../router'
  import moment from 'moment'
  import PaginationVue from '../components/pagination'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import mixin from '../../services/mixin'
  import requestStatusConfig from '../../config/request-status-config'
  import datepicker from 'vue-bulma-datepicker'
  import _ from 'underscore'

  const NotificationComponent = Vue.extend(Notification)

  const queryApi = '/api/estimate'

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
    name: 'estimateList',
    components: {
      PaginationVue,
      Notification,
      datepicker
    },
    mixins: [mixin],
    data () {
      return {
        searchData: {
          contractSelectedStatus: '',
          contractStatus: '',
          searchWord: '',
          constructionYear: '',
          constructionMonth: ''
        },
        isSearch: false,
        contractStatusList: [],
        hasStatusChildren: false,
        requestStatusConfig,
        page: new Pagination(),
        filter: new Filter(),
        data: {},
        contractList: [],
        type: 'resource',
        type_2: 'construction',
        isLoading: false,
        moment
      }
    },
    methods: {
      loadData () {
        this.isLoading = true
        this.data.length = 0
        if (this.isSearch) {
          this.page.setPoint(null)
          this.page.setPoint(0)
          this.page.setPage(0)
        }
        console.log(`${queryApi}?menu=contract&isPage=true&page=${this.page.getPage()}&status=${this.searchData.contractSelectedStatus}&search=${this.searchData.searchWord}&year=${this.searchData.constructionYear}&month=${this.searchData.constructionMonth}`)
        this.$http.get(`${queryApi}?menu=contract&isPage=true&page=${this.page.getPage()}&status=${this.searchData.contractSelectedStatus}&search=${this.searchData.searchWord}&year=${this.searchData.constructionYear}&month=${this.searchData.constructionMonth}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            const dataList = response.data.data
            this.page.set(dataList.page)
            this.contractList = dataList.estimateList.map(estimate => {
              estimate.status_name = _.find(this.requestStatusConfig.contractStatusList, status => {
                return status.value === estimate.status
              }).text
              return estimate
            })
          })
          .then(() => {
            window.scrollTo(0, 0)
          })
          .catch(error => {
            console.error(error)
          })
          .finally(() => {
            this.isLoading = false
            this.isSearch = false
          })
      },
      updateDashboard (contract) {
        this.$nextTick(() => {
          this.$http.put(`${queryApi}/${contract.estimate_no}`, contract)
            .then(response => {
              if (response.data.code === 200) {
                openNotification({
                  message: '관심공사에 추가되었습니다.',
                  type: 'success',
                  duration: 1500
                })
              } else {
                openNotification({
                  message: '관심공사에 추가하는 중 오류가 발생했습니다.',
                  type: 'danger',
                  duration: 1500
                })
                this.loadData()
              }
            })
        })
      },
      changeProcessStatus () {
        this.page.setPoint(0)
        this.page.setPage(0)
        this.loadData()
      },
      clickSearchButton (filterSearch) {
        this.isSearch = true
        if (!filterSearch) {
          this.searchData.contractSelectedStatus = ''
          this.searchData.contractStatus = ''
          this.searchData.constructionYear = ''
          this.searchData.constructionMonth = ''
        }
        this.loadData()
      },
      moveToPage (curItem, event) {
        console.log(curItem)
        console.log(event)
        router.push({
          path: `/private/estimate/${curItem.estimate_no}`,
          params: curItem
        })
      },
      updateRowState: function (sendData = {}, key) {
        this.$http.put(`${queryApi}/${key}`, sendData)
          .then((data) => {

          })
          .catch((error) => {
            console.error(error)
          })
      },
      updateRowValuable (curItem, key) {
        const sendData = {}
        sendData[key] = curItem[key]
        this.updateRowState(sendData, curItem.estimate_no)
      },
      updateRowContracted (curItem, key) {
        const sendData = {}
        sendData[key] = curItem[key]
        this.updateRowState(sendData, curItem.estimate_no)
      },
      deleteRow (curItem) {
        this.$http.delete(`${queryApi}/${curItem.estimate_no}`, {})
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
          })
          .catch((error) => {
            console.error(error)
          })
      },
      moveToPagination (index) {
        this.page.setIndex(index)
        this.loadData()
      },
      moveToRegister () {
        router.push({
          path: '/private/estimate/register'
        })
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

<style lang="scss" scoped>
  article {
    overflow: auto;
  }
  #addBtn {
    margin: 1rem 0;
  }

  .searchbox {
    width: 100%;

    .label {
      display: inline-block;
      line-height: 2rem;
    }

    select {
      min-width:150px;
    }

    .search-btn {
      display: inline-block;

      .input {
        width: 40%;
      }

      .button {
        display: inline-block;
      }
    }

  }
</style>
