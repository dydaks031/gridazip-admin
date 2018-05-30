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
              <input class="input" type="text" />
            </p>
            <label class="label">연락처</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">평수</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">주소</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">이사일</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">예산</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">메모</label>
            <p class="control">
              <textarea class="textarea" ></textarea>
            </p>
            <p class="control">
              <button class="button is-primary">등록</button>
              <button class="button is-link">Cancel</button>
            </p>
          </div>
        </article>
        <article class="tile is-child box" v-show = "currentTab === tabType.estimateView">
          <estimate-sheet />
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import estimateSheet from './estimateSheet'

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
        currentTab: ''
      }
    },
    mounted () {
      this.currentTab = this.tabType.info
    },
    methods: {
      activeView (type) {
        this.currentTab = type
      }
    }
  }
</script>

<style scoped>

</style>
