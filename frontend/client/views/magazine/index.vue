<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h4 class="title">매거진 목록</h4>
          <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister">등록</a>
          <table class="table">
            <colgroup>
              <col width="14%" />
              <col width="40%" />
              <col width="16%" />
              <col width="16%" />
              <col width="14%" />
            </colgroup>
            <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>등록일</th>
              <th>수정일</th>
              <th>설정</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in data" v-on:click="moveToPage(item)">
              <td>{{item.mg_pk}}</td>
              <td>{{item.mg_subject}}</td>
              <td>{{getComputedDate(item.mg_reg_dt)}}</td>
              <td>{{getComputedDate(item.mg_mod_dt)}}</td>
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

  const queryApi = '/api/magazine'

  export default {
    name: 'requestList',
    components: {
      PaginationVue
    },
    mixins: [mixin],
    data () {
      return {
        page: new Pagenation(),
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
          page: this.page.get()
        }).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data
          this.data = dataList.data
          this.page.set(dataList.page)
        }).catch((error) => {
          console.error(error)
        })
      },
      moveToPage (curItem) {
        router.push({
          path: `/private/magazine/${curItem.mg_pk}`
        })
      },
      moveToPagination (index) {
        console.log('curIndex' + index)
        this.page.setIndex(index)
        this.loadData()
      },
      moveToRegister () {
        router.push({
          path: `/private/magazine/register`
        })
      },
      deleteRow (curItem) {
        this.$http.delete(`${queryApi}/${curItem.mg_pk}`, {})
          .then(response => {
            console.log(response)
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
            console.error(error)
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
