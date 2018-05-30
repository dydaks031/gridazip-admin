<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(tabType.register)" :class="{'is-active': currentTab === tabType.register}"><a>입력</a></li>
        <li @click="activeView(tabType.preview)" :class="{'is-active': currentTab === tabType.preview}"><a>Preview</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor" v-show="currentTab === tabType.register">
      <div class="tile is-parent box estimate-input-wrapper">
        <div class="tile is-child is-1">
          <select2 :options="options.position" v-model="selected.position">
            <option disabled value="0">위치</option>
          </select2>
        </div>
        <div class="tile is-child is-1">
          <input type="text" class="input" placeholder="상세위치" />
        </div>
        <div class="tile is-child is-1">
          <select2 :options="options.position" v-model="selected.position">
            <option disabled value="0">공사</option>
          </select2>
        </div>
        <div class="tile is-child is-1">
          <select2 :options="options.position" v-model="selected.position">
            <option disabled value="0">공정</option>
          </select2>
        </div>
        <div class="tile is-child is-1">
          <select2 :options="options.position" v-model="selected.position">
            <option disabled value="0">상세공정</option>
          </select2>
        </div>
        <div class="tile is-child is-1">
          <select2 :options="options.position" v-model="selected.position">
            <option disabled value="0">자재군</option>
          </select2>
        </div>
        <div class="tile is-child is-1">
          <select2 :options="options.position" v-model="selected.position">
            <option disabled value="0">자재단위</option>
          </select2>
        </div>
        <div class="tile is-child is-1">
          <select2 :options="options.position" v-model="selected.position">
            <option disabled value="0">자재</option>
          </select2>
        </div>
        <div class="tile is-child is-1">
          <input type="text" placeholder="수량 입력" class="input" />
        </div>
        <div class="tile is-child is-1">
          <button class="button">등록</button>
        </div>
      </div>
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
              <th>자재군</th>
              <th>자재단위</th>
              <th>자재명</th>
              <th>수량</th>
              <th>인건비</th>
              <th>자재비</th>
            </tr>
            </thead>
            <tbody>
            <tr></tr>
            <tr></tr>
            <tr></tr>
            <tr></tr>
            <tr></tr>
            <tr></tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import estimateSheet from './estimateSheet'
  import select2 from '../components/select2Component'

  export default {
    name: 'estimateRegister',
    components: {
      estimateSheet,
      select2
    },
    data () {
      return {
        tabType: {
          register: 'register',
          preview: 'preview'
        },
        currentTab: '',
        selected: {
          position: 0
        },
        options: {
          position: [
            { id: 1, text: '빙구' },
            { id: 2, text: 'World' }
          ]
        }
      }
    },
    mounted () {
      this.currentTab = this.tabType.register
    },
    methods: {
      activeView (type) {
        this.currentTab = type
      }
    }
  }
</script>

<style scoped lang="scss">
.estimate-input-wrapper {
  margin: 0 0 1rem 0
}
</style>
