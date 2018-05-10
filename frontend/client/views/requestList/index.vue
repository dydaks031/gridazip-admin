<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h4 class="title">상담신청내역</h4>
          <div class="buttons has-addons is-right">
            <a class="button is-primary">등록</a>
          </div>
          <table class="table">
            <colgroup>
              <col width="10%" />
              <col width="10%" />
              <col width="10%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
            </colgroup>
            <thead>
            <tr>
              <th>이름</th>
              <th>평수</th>
              <th>예산</th>
              <th>전화번호</th>
              <th>방문상담일</th>
              <th>신청일자</th>
              <th>유효여부</th>
              <th>방문상담여부</th>
              <th>삭제</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in data" v-on:click="moveToPage(item)">
              <td>{{item.rq_name}}</td>
              <td>{{item.rq_size_str}}</td>
              <td>{{item.rq_budget_str}}</td>
              <td>{{item.rq_phone}}</td>
              <td>{{(item.rq_date === '0000-00-00' || !item.rq_date) ? '' : moment(item.rq_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')}}</td>
              <td>{{(item.rq_reg_dt === '0000-00-00' || !item.rq_reg_dt) ? '' : moment(item.rq_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')}}</td>
              <td>
                <input type="radio" :name="'rq_is_valuable_' + item.rq_pk" value="1" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'rq_is_valuable')"/><label >X</label>
                <input type="radio" :name="'rq_is_valuable_' + item.rq_pk" value="2" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'rq_is_valuable')"/><label >&#9651;</label>
                <input type="radio" :name="'rq_is_valuable_' + item.rq_pk" value="3" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'rq_is_valuable')"/><label >O</label>
              </td>
              <td>
                <input type="radio" :name="'rq_is_contracted_' + item.rq_pk" value="1" v-model="item.rq_is_contracted" v-on:click.stop="doThis" v-on:change="updateRowContracted(item, 'rq_is_contracted')"/><label >X</label>
                <input type="radio" :name="'rq_is_contracted_' + item.rq_pk" value="2" v-model="item.rq_is_contracted" v-on:click.stop="doThis" v-on:change="updateRowContracted(item, 'rq_is_contracted')"/><label >O</label>
              </td>
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
      PaginationVue,
      Notification
    },
    data () {
      return {
        page: new Pagenation(),
        filter: new Filter(),
        data: [],
        isLoading: false,
        moment
      }
    },
    methods: {
      loadData () {
        this.isLoading = true
        this.data.length = 0
        this.$http.get(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}`, {
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
          path: `/request-list/${curItem.rq_pk}`,
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
            this.page.setPage(this.page.getPage() - this.page.getLimit())
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
        console.log('curIndex' + index)
        this.page.setIndex(index)
        console.log(this.page)
        console.log(this.filter)
        this.loadData()
      }
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
</style>
