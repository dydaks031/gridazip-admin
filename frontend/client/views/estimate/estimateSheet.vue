<template>
  <div>
    <div class="title-wrapper">
      <span class="title">공간별 견적</span>
      <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister" v-if="deleteRegisterBtn !== true">등록/수정</a>
    </div>
    <table class="table position-base-table">
      <colgroup>
      </colgroup>
      <thead>
        <tr>
          <th>위치</th>
          <th>공사</th>
          <th>공정</th>
          <th>상세공정</th>
          <th>자재군</th>
          <th>자재</th>
          <th>물량</th>
          <th>자재단위</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="generalData in estimateData.general">
          <td>{{generalData.place_name}}</td>
          <td>{{generalData.ct_name}}</td>
          <td>{{generalData.cp_name}}</td>
          <td>{{generalData.cpd_name}}</td>
          <td>{{generalData.rt_name}}</td>
          <td>{{generalData.rs_name}}</td>
          <td>{{generalData.resource_amount}}</td>
          <td>{{generalData.ru_name}}</td>
        </tr>
      </tbody>
    </table>
    <div class="tile is-ancestor">
      <div class="tile is-parent is-6">
        <article class="tile is-child box">
          <h4 class="title">자재비</h4>
          <div class="content">
            <table class="table">
              <colgroup>
                <col width="auto"/>
              </colgroup>
              <thead>
              <tr>
                <th>자재</th>
                <th>물량</th>
                <th>자재단위</th>
                <th>단가</th>
                <th>금액</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="resource in estimateData.resource">
                <td>{{resource.rs_name}}</td>
                <td>{{resource.resource_amount}}</td>
                <td>{{resource.ru_name}}</td>
                <td>{{resource.rs_price}}</td>
                <td>{{resource.resource_costs}}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div class="tile is-parent is-6">
        <article class="tile is-child box">
          <h4 class="title">인건비</h4>
          <div class="content">
            <table class="table">
              <colgroup>
                <col width="auto"/>
              </colgroup>
              <thead>
              <tr>
                <th>공사</th>
                <th>공정</th>
                <th>상세공정</th>
                <th>자재군</th>
                <th>인건비</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="labor in estimateData.labor">
                <td>{{labor.ct_name}}</td>
                <td>{{labor.cp_name}}</td>
                <td>{{labor.cpd_name}}</td>
                <td>{{labor.rt_name}}</td>
                <td>{{labor.labor_costs}}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
    <div class="tile is-ancestor summary">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <div class="is-pulled-right">
            <p>
              <span>자재비: 1,000,000원</span>
            </p>
            <p>
              <span>인건비: 1,000,000원</span>
            </p>
            <p>
              <span>합: 1,000,000원</span>
            </p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import router from '../../router'

  export default {
    name: 'estimate-sheet',
    props: {
      estimateData: {
        type: Object,
        default: {
          general: [],
          labor: [],
          resource: []
        }
      },
      deleteRegisterBtn: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        param: {}
      }
    },
    methods: {
      moveToRegister () {
        router.push({
          path: `/estimate/${this.param.id}/register`
        })
      }
    },
    mounted () {
      this.param = this.$route.params
    },
    created () {
    },
    watch: {
      estimateData: {
        handler (newValue, oldValue) {
          console.log(newValue, oldValue)
        },
        deep: true
      }
    }
  }
</script>

<style scoped lang="scss">
  .title-wrapper {
    padding: 1rem;
    margin: 1rem 0 0.5rem 0;
  }
  .position-base-table {
    margin: 1rem 0 3rem 0

  }
</style>
