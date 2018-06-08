<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(tabType.register)" :class="{'is-active': currentTab === tabType.register}"><a>입력</a></li>
        <li @click="activeView(tabType.preview)" :class="{'is-active': currentTab === tabType.preview}"><a>Preview</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor" v-show="currentTab === tabType.register">
      <estimate-select v-on:registerData="updateModifyView"/>
    </div>
    <div class="tile is-ancestor box" v-show="currentTab === tabType.register">
      <div class="tile is-parent">
        <div class="tile is-child">
          <h1 class="title">입력된 견적 목록</h1>
          <table class="table">
            <colgroup>
              <col />
              <col width="12%" />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col width="10%" />
              <col width="10%" />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
            <tr>
              <th>위치</th>
              <th>상세위치</th>
              <th>공사</th>
              <th>공정</th>
              <th>상세공정</th>
              <th>자재분류</th>
              <th>자재군</th>
              <th>자재명</th>
              <th>입력값</th>
              <th>물량</th>
              <th>인건비</th>
              <th>자재비</th>
              <th></th>
            </tr>
            </thead>
            <estimate-modify :rowData="{}"/>
          </table>
        </div>
      </div>
    </div>
    <div class="tile is-ancestor" v-show="currentTab === tabType.preview">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <estimate-sheet :estimateData.sync="estimateData" :deleteRegisterBtn="true"/>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import estimateSelect from './estimateSelect'
  import estimateModify from './estimateModify'
  import estimateSheet from './estimateSheet'
  import EventBus from '../../services/eventBus'

  const queryApi = '/api/contract/'

  export default {
    name: 'estimateRegister',
    components: {
      estimateSelect,
      estimateModify,
      estimateSheet
    },
    data () {
      return {
        tabType: {
          register: 'register',
          preview: 'preview'
        },
        currentTab: '',
        estimateData: {
          general: [],
          labor: [],
          resource: []
        }
      }
    },
    mounted () {
      this.currentTab = this.tabType.register
      this.loadData()
    },
    methods: {
      activeView (type) {
        this.currentTab = type
        switch (this.currentTab) {
          case this.tabType.register:
            break
          case this.tabType.preview:
            this.loadEstimateView()
            break
        }
      },
      updateModifyView (data) {
        console.log(data)
        EventBus.$emit('updateModifyView', data)
      },
      loadData () {
        const id = this.$route.params.id
        this.$http.get(`${queryApi}/${id}/estimate`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            var data = response.data.data
            EventBus.$emit('updateModifyView', data.estimateList)
          }).catch((error) => {
            console.log(error)
          })
      },
      loadEstimateView () {
        const id = this.$route.params.id
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
          })
          .catch((error) => {
            this.estimateData = {
              general: [],
              labor: [],
              resource: []
            }
            console.log(error)
          })
      }
    }
  }
</script>

<style scoped lang="scss">
.estimate-input-wrapper {
  margin: 0 0 1rem 0
}
</style>
