<template>
  <div>
    <div class="search box">
      <div class="block">
        <div class="is-clearfix">
          <div class="is-pulled-left is-horizontal searchbox">
            <div class="control is-inline-block">
              <label class="label">실패 내역 표시</label>
              <input type="checkbox" class="checkbox" v-model="isShowAllRow"/>
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
            </colgroup>
            <thead>
            <tr>
              <th>고객명</th>
              <th>별칭</th>
              <th>전화번호</th>
              <th>주소</th>
              <th>공사시작일자</th>
              <th>이사일자</th>
              <th>계약상태</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="contract in contractList" @click="moveToPage(contract)" v-show="contract.pc_status !== -1 || isShowAllRow">
              <td>{{contract.pc_name}}</td>
              <td>{{contract.pc_nickname}}</td>
              <td>{{contract.pc_phone}}</td>
              <td>{{contract.pc_address_brief + contract.pc_address_detail}}</td>
              <td>{{getComputedDate(contract.pc_construction_start_date)}}</td>
              <td>{{getComputedDate(contract.pc_move_date)}}</td>
              <td>{{requestStatusConfig.contractStatusList[contract.pc_status]}}</td>
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
  import requestStatusConfig from '../../config/request-status-config'

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
        requestStatusConfig,
        page: new Pagenation(),
        filter: new Filter(),
        data: {},
        contractList: [],
        type: 'resource',
        type_2: 'construction',
        isLoading: false,
        moment,
        isShowAllRow: false
      }
    },
    methods: {
      loadData () {
        this.isLoading = true
        this.data.length = 0
        console.log(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}`)
        this.$http.get(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}`, {
          page: this.page.get(),
          filter: this.filter.get()
        }).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data
          this.page.set(dataList.page)
          this.contractList = dataList.contractList
        }).catch((error) => {
          console.log(error)
        })
      },
      moveToPage (curItem) {
        console.log(curItem)
        router.push({
          path: `/private/estimate/${curItem.pc_pk}`,
          params: curItem
        })
      },
      updateRowState: function (sendData = {}, key) {
        console.log(`${queryApi}/${key}`)
        this.$http.put(`${queryApi}/${key}`, sendData)
          .then((data) => {

          })
          .catch((error) => {
            console.log(error)
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
            console.log(error)
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

<style scoped>
  article {
    overflow: auto;
  }
  #addBtn {
    margin: 1rem 0;
  }
</style>
