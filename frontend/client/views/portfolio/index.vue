<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h4 class="title">포트폴리오</h4>
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
              <td>{{(item.pf_reg_dt === '0000-00-00' || !item.pf_reg_dt) ? '' : moment(item.pf_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')}}</td>
              <td><button class="button">삭제</button></td>
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

  const queryApi = '/api/admin/portfolio'

  export default {
    name: 'requestList',
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
          path: `/portfolio/${curItem.pf_pk}`,
          params: curItem
        })
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
