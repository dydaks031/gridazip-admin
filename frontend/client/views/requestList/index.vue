<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <h4 class="title">상담신청내역</h4>
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
              <input type="radio" :name="'request_is_valuable_' + item.rq_pk" value="1" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'request_is_valuable')"/><label >X</label>
              <input type="radio" :name="'request_is_valuable_' + item.rq_pk" value="2" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'request_is_valuable')"/><label >&#9651;</label>
              <input type="radio" :name="'request_is_valuable_' + item.rq_pk" value="3" v-model="item.rq_is_valuable" v-on:click.stop="doThis" v-on:change="updateRowValuable(item, 'request_is_valuable')"/><label >O</label>
            </td>
            <td>
              <input type="radio" :name="'request_is_contracted_' + item.rq_pk" value="1" v-model="item.rq_is_contracted" v-on:click.stop="doThis" v-on:change="updateRowContracted(item, 'request_is_contracted')"/><label >X</label>
              <input type="radio" :name="'request_is_contracted_' + item.rq_pk" value="2" v-model="item.rq_is_contracted" v-on:click.stop="doThis" v-on:change="updateRowContracted(item, 'request_is_contracted')"/><label >O</label>
            </td>
          </tr>
          </tbody>
        </table>
      </article>
    </div>
  </div>
</template>

<script>
  import Pagenation from '../../services/pagination'
  import Filter from '../../services/filter'
  import router from '../../router'
  import moment from 'moment'

  const queryApi = '/api/admin/request/list'
  const rowStatusUpdateApi = '/api/admin/request/save'

  export default {
    name: 'index.vue',
    data () {
      return {
        page: new Pagenation(),
        filter: new Filter(),
        data: [],
        isLoading: false,
        moment,
      }
    },
    methods: {
      loadData () {
        this.isLoading = true
        this.data.length = 0
        this.$http.post(queryApi, {
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
        console.log(`${rowStatusUpdateApi}/${key}`)
        this.$http.post(`${rowStatusUpdateApi}/${key}`, sendData)
          .then((data) => {

          })
          .catch((error) => {
            console.log(error)
          })
      },
      updateRowValuable (curItem, key) {
        this.updateRowState({
          'request_is_valuable': curItem.rq_is_valuable
        }, curItem.rq_pk)
      },
      updateRowContracted (curItem, key) {
        this.updateRowState({
          'request_is_contracted': curItem.rq_is_contracted
        }, curItem.rq_pk)
      },
      doThis () {

      }
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style scoped>

</style>
