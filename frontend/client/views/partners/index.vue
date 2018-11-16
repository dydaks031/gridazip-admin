<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h4 class="title">상담신청내역</h4>
          <table class="table">
            <colgroup>
              <col width="10%" />
              <col width="10%" />
              <col width="auto" />
              <col width="auto" />
              <col width="auto" />
            </colgroup>
            <thead>
            <tr>
              <th>업체명</th>
              <th>연락처</th>
              <th>포트폴리오</th>
              <th>신청일자</th>
              <th>삭제</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in data" v-on:click="moveToPage(item)">
              <td>{{item.pn_name}}</td>
              <td>{{item.pn_tel_no}}</td>
              <td><a :href="item.pn_price_list" v-on:click.stop="doThis" v-if="item.pn_price_list">링크</a></td>
              <td>{{(item.pn_reg_dt === '0000-00-00' || !item.pn_reg_dt) ? '' : moment(item.pn_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')}}</td>
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

  const queryApi = '/api/partner'

  export default {
    name: 'partnerList',
    components: {
      PaginationVue
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
        console.log(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}`)
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
          path: `/private/partner-list/${curItem.pn_pk}`,
          params: curItem
        })
      },
      doThis () {

      },
      deleteRow (curItem) {
        this.$http.delete(`${queryApi}/${curItem.pn_pk}`, {})
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
      moveToPagination (index) {
        console.log('curIndex' + index)
        this.page.setIndex(index)
        this.loadData()
      }
    },
    beforeRouteUpdate (to, from, next) {
      // just use `this`
      console.log(`to: ${to}`)
      console.log(`from: ${from}`)
      this.loadData()
      next()
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style scoped>

</style>
