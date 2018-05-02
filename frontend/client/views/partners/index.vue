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
              <col width="10%" />
              <col width="15%" />
              <col width="15%" />
              <col width="15%" />
              <col width="auto" />
              <col width="auto" />
            </colgroup>
            <thead>
            <tr>
              <th>업체명</th>
              <th>연락처</th>
              <th>포트폴리오</th>
              <th>신청일자</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in data" v-on:click="moveToPage(item)">
              <td>{{item.pn_name}}</td>
              <td>{{item.pn_tel_no}}</td>
              <td><a :href="item.pn_price_list" v-on:click.stop="doThis">링크</a></td>
              <td>{{(item.pn_reg_dt === '0000-00-00' || !item.pn_reg_dt) ? '' : moment(item.pn_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')}}</td>
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
  import AppLink from '../components/app-link'

  const queryApi = '/api/partner/list'
  const rowStatusUpdateApi = '/api/request/save'

  export default {
    name: 'partnerList',
    components: {
      PaginationVue,
      AppLink
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
          path: `/partner-list/${curItem.pn_pk}`,
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
        const sendData = {}
        sendData[key] = curItem[key]
        this.updateRowState(sendData, curItem.pn_pk)
      },
      updateRowContracted (curItem, key) {
        const sendData = {}
        sendData[key] = curItem[key]
        this.updateRowState(sendData, curItem.pn_pk)
      },
      doThis () {

      },
      moveToPagination (index) {
        console.log('curIndex' + index)
        this.page.setIndex(index)
        this.loadData()
      }
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style scoped>

</style>
