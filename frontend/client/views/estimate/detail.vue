<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(tabType.info)" :class="{'is-active': currentTab === tabType.info}"><a>정보</a></li>
        <li @click="activeView(tabType.estimateView)" :class="{'is-active': currentTab === tabType.estimateView}"><a>상세견적서</a></li>
        <li @click="activeView(tabType.managerAndShop)" :class="{'is-active': currentTab === tabType.managerAndShop}"><a>기술자 및 거래처</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" v-show="currentTab === tabType.info">
          <div class="block">
            <label class="label">고객명</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_name" />
            </p>
            <label class="label">연락처</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_phone" />
            </p>
            <label class="label">평수</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_size" />
            </p>
            <label class="label">주소</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_address_brief" />
            </p>
            <label class="label">상세 주소</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_address_detail" />
            </p>
            <label class="label">이사일</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_move_date"/>
            </p>
            <label class="label">예산</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_budget"/>
            </p>
            <label class="label">메모</label>
            <p class="control">
              <textarea class="textarea" v-model="detailData.pc_memo"></textarea>
            </p>
            <p class="control">
              <button class="button is-primary">등록</button>
              <button class="button is-link">Cancel</button>
            </p>
          </div>
        </article>
        <article class="tile is-child box" v-show = "currentTab === tabType.estimateView">
          <estimate-sheet :estimateData.sync="estimateData"/>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import estimateSheet from './estimateSheet'
  import router from '../../router'

  const queryApi = '/api/contract'

  export default {
    name: 'estimateDetail',
    components: {
      estimateSheet
    },
    data () {
      return {
        tabType: {
          info: 'info',
          estimateView: 'estimateView',
          managerAndShop: 'managerAndShop'
        },
        currentTab: '',
        param: {},
        detailData: {},
        estimateData: {
          general: [],
          labor: [],
          resource: [],
          total: {}
        }
      }
    },
    mounted () {
      this.currentTab = this.tabType.info
      this.param = this.$route.params
      console.log(router)
      this.loadDetail()
    },
    computed: {
      getFullAddress () {
        return `${this.detailData.pc_address_brief} ${this.detailData.pc_address_detail}`
      }
    },
    methods: {
      activeView (type) {
        this.currentTab = type
        switch (type) {
          case this.tabType.info:
            this.loadDetail()
            break
          case this.tabType.estimateView:
            this.loadEstimateView()
            break
          case this.tabType.managerAndShop:
            break
        }
      },
      loadDetail () {
        const id = this.param.id
        if (!id) {
          return false
        }
        this.$http.get(`${queryApi}/${id}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            console.log(response)
            this.detailData = response.data.data.contract
          }).catch((error) => {
            console.log(error)
          })
      },
      loadEstimateView () {
        const id = this.param.id
        if (!id) {
          return false
        }
        this.$http.get(`${queryApi}/${id}/estimate/general`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            console.log(response)
            this.estimateData.general = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/labor`)
          })
          .then((response) => {
            console.log(response)
            if (response.data.code !== 200) {
              return
            }
            this.estimateData.labor = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/resource`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            this.estimateData.resource = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/total`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            this.estimateData.total = response.data.data.totalCosts
          })
          .catch((error) => {
            this.estimateData = {
              general: [],
              labor: [],
              resource: [],
              total: {}
            }
            console.log(error)
          })
      }
    }
  }
</script>

<style scoped>

</style>
