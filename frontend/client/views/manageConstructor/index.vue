<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(constructor)" :class="{'is-active': openTab === constructor}"><a class="subtitle">기술자</a></li>
        <li @click="activeView(correspondent)" :class="{'is-active': openTab === correspondent}"><a class="subtitle">거래처</a></li>
      </ul>
    </div>
    <div class="search">
      <div class="block">
        <div class="control has-addons">
          <div class="select">
            <select v-model="searchOptions.ct_pk">
              <option value="">전체</option>
              <option v-for="construction in constructionList" :value="construction.ct_pk">{{construction.ct_name}}</option>
            </select>
          </div>
          <input class="input" type="text" placeholder="이름 입력" v-model="searchOptions.name" @keypress.enter.stop="loadData">
          <a class="button is-info" @click="loadData">검색</a>
        </div>
      </div>
    </div>
    <div v-show="openTab === constructor">
      <div class="tile is-ancestor">
        <div class="tile is-parent">
          <article class="tile is-child box">
            <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister">등록</a>
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
              <tr v-for="item in data.constructor" @click="moveToDetail(item)">
                <td>{{item.ct_name}}</td>
                <td>{{item.cr_name}}</td>
                <td>{{item.cr_contact}}</td>
                <td>
                  <star-rating v-model="item.cs_skill_score" :show-rating="false" :star-size="25" :read-only="true" />
                </td>
                <td>
                  <star-rating v-model="item.cr_communication_score" :show-rating="false" :star-size="25" :read-only="true" />
                </td>
                <td>{{item.cs_memo}}</td>
              </tr>
              <tr v-if="data.constructor.length === 0">
                <td colspan="6" class="none-data">검색 결과가 없습니다.</td>
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
            <a class="button is-primary is-pulled-right is-medium" @click="moveToRegister">등록</a>
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
                <th>담당자</th>
                <th>연락처</th>
                <th>취급브랜드</th>
                <th>위치</th>
                <th>비고</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item in data.correspondent" @click="moveToDetail(item)">
                <td>{{item.ct_name}}</td>
                <td>{{item.co_name}}</td>
                <td>{{item.co_contact}}</td>
                <td>{{item.co_manager_name}}</td>
                <td>{{item.ci_brand}}</td>
                <td>{{item.co_location}}</td>
                <td>{{item.co_memo}}</td>
              </tr>
              <tr v-if="data.constructor.length === 0">
                <td colspan="7" class="none-data">검색 결과가 없습니다.</td>
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
  import router from '../../router'
  import StarRating from 'vue-star-rating'
  // import Vue from 'vue'
  // import Notification from 'vue-bulma-notification'

  // const NotificationComponent = Vue.extend(Notification)

  // const openNotification = (propsData = {
  //   title: '',
  //   message: '',
  //   type: '',
  //   direction: '',
  //   duration: 4500,
  //   container: '.notifications'
  // }) => {
  //   return new NotificationComponent({
  //     el: document.createElement('div'),
  //     propsData
  //   })
  // }

  const queryApi = '/api'
  const constructionQueryApi = '/api/construction'

  export default {
    name: 'manageConstructorIndex',
    components: {
      PaginationVue,
      StarRating
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
        searchOptions: {
          name: '',
          ct_pk: ''
        },
        constructionList: [],
        moment
      }
    },
    methods: {
      activeView (type) {
        this.openTab = type
        this.loadData()
      },
      loadData () {
        let url = `${queryApi}/${this.openTab}?point=${this.pages[this.openTab].getPoint()}&page=${this.pages[this.openTab].getPage()}&ct_pk=${this.searchOptions.ct_pk}`
        switch (this.openTab) {
          case 'constructor':
            url = `${url}&cr_name=${this.searchOptions.name}`
            break
          case 'correspondent':
            url = `${url}&co_name=${this.searchOptions.name}`
            break
        }
        this.isLoading = true
        this.$http.get(url, {
          page: this.pages[this.openTab].get(),
          filter: this.filters[this.openTab].get()
        }).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          this.data[this.openTab] = []
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
      },
      moveToDetail (item) {
        let path = `/manage-constructor/${this.openTab}`

        switch (this.openTab) {
          case this.correspondent:
            path = `${path}/${item.co_pk}`
            break
          case this.constructor:
            path = `${path}/${item.cr_pk}`
            break
        }
        console.log(path)
        router.push({
          path: path,
          params: item
        })
      },
      moveToRegister () {
        router.push({
          path: `/manage-constructor/${this.openTab}/register`
        })
      },
      getConstructionList () {
        this.$http.get(`${constructionQueryApi}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            this.constructionList = response.data.data.constructionList
          })
          .catch((error) => {
            console.error(error)
          })
      }
    },
    mounted () {
      this.openTab = this.constructor
      this.getConstructionList()
      this.loadData()
    }
  }
</script>

<style scoped>
  .none-data {
    text-align: center;
  }
</style>
