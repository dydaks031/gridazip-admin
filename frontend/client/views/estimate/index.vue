<template>
  <div>
    <div class="search box">
      <div class="block">
        <div class="is-clearfix">
          <div class="is-pulled-left is-horizontal searchbox">
            <div class="control is-inline-block">
              <label class="label">1차 필터링</label>
              <div class="select">
                <select v-model="searchData.contractSelectedStatus" @change="changeProcessStatus">
                  <option value="" selected="selected">전체</option>
                  <option v-for="selectedStatus in requestStatusConfig.splitedContractStatusList" :value="selectedStatus.value">{{selectedStatus.label}}</option>
                </select>
              </div>
              <label class="label">2차 필터링</label>
              <div class="select">
                <select v-model="searchData.contractStatus" @change="clickSearchButton(true)">
                  <option value="" selected="selected">전체</option>
                  <option v-for="status in contractStatusList" :value="status.value">{{status.label}}</option>
                </select>
              </div>
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
          <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister">등록</a>
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
            </colgroup>
            <thead>
            <tr>
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
            <tr v-for="contract in contractList" @click="moveToPage(contract)">
              <td>{{contract.pc_name}}</td>
              <td>{{contract.pc_nickname}}</td>
              <td>{{contract.pc_phone}}</td>
              <td>{{contract.pc_supervisor_name}}</td>
              <td>{{contract.pc_address_brief + contract.pc_address_detail}}</td>
              <td>{{getComputedDate(contract.pc_construction_start_date)}}</td>
              <td>{{getComputedDate(contract.pc_move_date)}}</td>
              <td>{{requestStatusConfig.contractStatusList[contract.pc_status]}}</td>
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
  import _ from 'underscore'

  const NotificationComponent = Vue.extend(Notification)

  const queryApi = '/api/contract'

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
      Notification
    },
    mixins: [mixin],
    data () {
      return {
        searchData: {
          contractSelectedStatus: '',
          contractStatus: '',
          searchWord: ''
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
        }
        console.log(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}&selected=${this.searchData.contractSelectedStatus}&status=${this.searchData.contractStatus}&search=${this.searchData.searchWord}`)
        this.$http.get(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}&selected=${this.searchData.contractSelectedStatus}&status=${this.searchData.contractStatus}&search=${this.searchData.searchWord}`)
          .then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data
          this.page.set(dataList.page)
          this.contractList = dataList.contractList
        })
          .then(() => {
          window.scrollTo(0,0)
        })
          .catch(error => {
          console.error(error)
        })
          .finally(() => {
            this.isLoading = false
            this.isSearch = false
        })
      },
      changeProcessStatus () {
        const selectedData = _.find(this.requestStatusConfig.splitedContractStatusList, (item) => {
          return item.value === this.searchData.contractSelectedStatus
        })
        this.searchData.contractStatus = ''
        if (selectedData.hasOwnProperty('children')) {
          this.contractStatusList = selectedData.children
          this.hasStatusChildren = true
        } else {
          this.contractStatusList = []
          this.hasStatusChildren = false
        }
        this.$forceUpdate()
        this.clickSearchButton(true)
      },
      clickSearchButton(filterSearch) {
        this.isSearch = true
        if (!filterSearch) {
          this.searchData.contractSelectedStatus = ''
          this.searchData.contractStatus = ''
        }
        this.loadData()
      },
      moveToPage (curItem) {
        router.push({
          path: `/private/estimate/${curItem.pc_pk}`,
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
        this.updateRowState(sendData, curItem.pc_pk)
      },
      updateRowContracted (curItem, key) {
        const sendData = {}
        sendData[key] = curItem[key]
        this.updateRowState(sendData, curItem.pc_pk)
      },
      deleteRow (curItem) {
        this.$http.delete(`${queryApi}/${curItem.pc_pk}`, {})
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
