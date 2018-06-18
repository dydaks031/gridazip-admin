<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(constructor)" :class="{'is-active': openTab === constructor}"><a class="subtitle">기술자</a></li>
        <li @click="activeView(correspondent)" :class="{'is-active': openTab === correspondent}"><a class="subtitle">거래처</a></li>
      </ul>
    </div>
    <div v-show="openTab === constructor">
      <div class="tile is-ancestor">
        <div class="tile is-parent">
          <article class="tile is-child box">
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
              <tr v-for="item in data.constructor">
                <td>{{item.ct_name}}</td>
                <td>{{item.cr_name}}</td>
                <td>{{item.cr_contact}}</td>
                <td>{{item.cs_skill_score}}</td>
                <td>{{item.cr_communication_score}}</td>
                <td>{{item.cs_memo}}</td>
              </tr>
              </tbody>
            </table>
          </article>
        </div>
      </div>
      <div>
        <pagination-vue :options="pages[constructor]" :page-click="moveToPagination" />
      </div>
    </div>
    <div v-show="openTab === correspondent">
      <div class="tile is-ancestor">
        <div class="tile is-parent">
          <article class="tile is-child box">
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
              <tr v-for="item in data.correspondent" @click="">
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
        <pagination-vue :options="pages[correspondent]" :page-click="moveToPagination" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagenation from '../../services/pagination'
  import Filter from '../../services/filter'
  import moment from 'moment'
  import PaginationVue from '../components/pagination'

  const queryApi = '/api'

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
        pages: {
          constructor: new Pagenation(),
          correspondent: new Pagenation()
        },
        filters: {
          constructor: new Filter(),
          correspondent: new Filter()
        },
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
        this.$http.get(`${queryApi}/${this.openTab}?point=${this.pages[this.openTab].getPoint()}&page=${this.pages[this.openTab].getPage()}`, {
          page: this.pages[this.openTab].get(),
          filter: this.filters[this.openTab].get()
        }).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data[`${this.openTab}List`]
          this.pages[this.openTab].set(dataList.page)
          this.data[this.openTab] = dataList
        }).catch((error) => {
          console.log(error)
        })
      },
      moveToPagination (index) {
        this.pages[this.openTab].setIndex(index)
        this.loadData()
      }
    },
    mounted () {
      this.openTab = this.constructor
      this.loadData()
    }
  }
</script>

<style scoped>

</style>
