<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(constructor)" :class="{'is-active': openTab === constructor}"><a class="subtitle">기술자</a></li>
        <li @click="activeView(correspondent)" :class="{'is-active': openTab === correspondent}"><a class="subtitle">거래처</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" v-show="openTab === constructor">
          <a class="button is-primary is-pulled-right is-medium" id="addBtn">등록</a>
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
              <th>공사</th>
              <th>이름</th>
              <th>전화번호</th>
              <th>평점(실력)</th>
              <th>평점(소통)</th>
              <th>비고</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>타일</td>
              <td>마포타일</td>
              <td>4.5</td>
              <td>4.5</td>
              <td>비-고입니다.</td>
            </tr>
            </tbody>
          </table>
        </article>
        <article class="tile is-child box" v-show="openTab === correspondent">
          <a class="button is-primary is-pulled-right is-medium">등록</a>
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
              <th>공사</th>
              <th>이름</th>
              <th>유선번호</th>
              <th>담당자</th>
              <th>담당자 휴대폰</th>
              <th>취급브랜드</th>
              <th>위치</th>
              <th>비고</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in data.correspondent">
              <td>타일, 도기, 수전</td>
              <td>대원세라믹스</td>
              <td>010-xxxx-xxxx</td>
              <td>김효년 부장님</td>
              <td>010-xxxx-xxxx</td>
              <td>대림, 로얄, 보보, iCM, 수입타일</td>
              <td>서울 강서구</td>
              <td>여신가능 / 발주 포맷에 맞춰서 카톡 띄우면 하루전에 시켜도 다 배송됨</td>
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
  import moment from 'moment'
  import PaginationVue from '../components/pagination'

  const queryApi = ''

  export default {
    name: 'manageConstructorIndex',
    components: {
      PaginationVue
    },
    data () {
      return {
        correspondent: 'correspondent',
        constructor: 'constructor',
        openTab: '',
        page: new Pagenation(),
        filter: new Filter(),
        data: {
          constructor: [],
          correspondent: []
        },
        moment
      }
    },
    methods: {
      activeView (type) {
        this.openTab = type
        this.loadData()
      },
      loadData () {
        this.isLoading = true
        this.data[this.openTab] = []
        this.$http.get(`${queryApi}?point=${this.page.getPoint()}&page=${this.page.getPage()}`, {
          page: this.page.get(),
          filter: this.filter.get()
        }).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data
          this.page.set(dataList.page)
          this.data[this.openTab] = dataList
        }).catch((error) => {
          console.log(error)
        })
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
      this.openTab = this.constructor
      // this.loadData()
    }
  }
</script>

<style scoped>

</style>
