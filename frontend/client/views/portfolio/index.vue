<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h4 class="title">포트폴리오</h4>
          <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister">등록</a>
          <table class="table">
            <colgroup>
              <col />
              <col width="150px;"/>
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
            <tr>
              <th colspan="2">번호</th>
              <th>주소</th>
              <th>평수</th>
              <th>금액</th>
              <th>등록일</th>
              <th>설정</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in data" v-on:click="moveToPage(item)">
              <td>{{item.pf_pk}}</td>
              <td>
                <a :href="item.pi_after">
                  <img :src="item.pi_after" />
                </a>
              </td>
              <td>{{item.pf_address}}</td>
              <td>{{item.pf_size}} 평</td>
              <td>{{item.pf_price}} 만원</td>
              <td>{{getComputedDate(item.pf_reg_dt)}}</td>
              <td><button class="button" v-on:click.stop="deleteRow(item)">삭제</button></td>
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

  const queryApi = '/api/portfolio'

  export default {
    name: 'requestList',
    components: {
      PaginationVue
    },
    mixins: [mixin],
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
          path: `/portfolio/${curItem.pf_pk}`,
          params: curItem
        })
      },
      moveToPagination (index) {
        console.log('curIndex' + index)
        this.page.setIndex(index)
        this.loadData()
      },
      moveToRegister () {
        router.push({
          path: `/portfolio/register`
        })
      },
      deleteRow (curItem) {
        this.$http.delete(`${queryApi}/${curItem.pf_pk}`, {})
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
