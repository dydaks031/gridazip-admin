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
    <div class="tile is-ancestor box">
      <div class="tile is-parent">
        <div class="tile is-child">
          <h1 class="title">입력된 견적 목록</h1>
          <table class="table">
            <colgroup>
              <col />
            </colgroup>
            <thead>
            <tr>
              <th>위치</th>
              <th>상세위치</th>
              <th>공사</th>
              <th>공정</th>
              <th>상세공정</th>
              <th>자재분</th>
              <th>자재군</th>
              <th>자재단위</th>
              <th>자재명</th>
              <th>수량</th>
              <th>인건비</th>
              <th>자재비</th>
            </tr>
            </thead>
            <estimate-modify :rowData="{}"/>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import estimateSelect from './estimateSelect'
  import estimateModify from './estimateModify'
  import EventBus from '../../services/eventBus'

  export default {
    name: 'estimateRegister',
    components: {
      estimateSelect,
      estimateModify
    },
    data () {
      return {
        tabType: {
          register: 'register',
          preview: 'preview'
        },
        currentTab: ''
      }
    },
    mounted () {
      this.currentTab = this.tabType.register
    },
    methods: {
      activeView (type) {
        this.currentTab = type
      },
      updateModifyView (data) {
        console.log(data)
        EventBus.$emit('updateModifyView', data)
      }
    }
  }
</script>

<style scoped lang="scss">
.estimate-input-wrapper {
  margin: 0 0 1rem 0
}
</style>
