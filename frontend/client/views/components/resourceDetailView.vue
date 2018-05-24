<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box" v-if="type === 'construction'">
        <div v-if="selectedData.id === 'constructionProcessDetail'">
          <h4 class="title">상세공정 수정</h4>
          <div class="block">
            <label class="label">상세공정명</label>
            <p class="control">
              <input class="input" type="text" v-model="data.cpd_name" />
            </p>
            <label class="label">인건비</label>
            <p class="control">
              <input class="input" type="text" v-model="data.cpd_labor_cost" />
            </p>
            <label class="label">최소물량</label>
            <p class="control">
              <input class="input" type="text" v-model="data.cpd_min_amount" />
            </p>
            <label class="label">단위</label>
            <p class="control">
              <label class="radio">
                <input type="radio" value="0" name="cpd_unit" v-model="data.cpd_unit" />
                개
              </label>
              <label class="radio">
                <input type="radio" value="1"  name="cpd_unit" v-model="data.cpd_unit" />
                M
              </label>
              <label class="radio">
                <input type="radio" value="2" name="cpd_unit" v-model="data.cpd_unit" />
                M^2
              </label>
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
  import META_LODING_CONFIG from '../../config/meta-loading-config'

  export default {
    name: 'resource-detail-view',
    props: {
      selectedData: {
        type: Object
      },
      type: {
        type: String
      }
    },
    data () {
      return {
        data: {}
      }
    },
    mounted () {
      console.log(META_LODING_CONFIG)
      console.log(this.selectedData)
      console.log(this.type)
    },
    watch: {
      selectedData (val) {
        console.log(val)
      }
    }
  }
</script>

<style scoped>

</style>
