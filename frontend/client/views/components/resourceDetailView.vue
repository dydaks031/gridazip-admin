<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box" v-if="type === 'construction'">
        <div v-if="selectedModel.id === 'constructionProcessDetail'">
          <h4 class="title">상세공정
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </h4>
          <div class="block">
            <label class="label">상세공정명</label>
            <p class="control">
              <input class="input" type="text" v-model="data.cpd_name" />
            </p>
            <label class="label">인건비</label>
            <p class="control">
              <input class="input" type="text" v-model="data.cpd_labor_costs" />
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
          <button class="button" @click="registerData">
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
  import META_LODING_CONFIG from '../../config/meta-loading-config'
  import _ from 'underscore'
  import deepClone from '../../services/deepClone'

  export default {
    name: 'resource-detail-view',
    props: {
      selectedData: {
        type: Object
      },
      selectedModel: {
        type: Object
      },
      fullData: {
        type: Array
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
    methods: {
      registerData () {
        const parentId = this.selectedModel.parentId
        const parent = _.find(this.fullData, (item) => {
          return item.id === parentId
        })
        const parentData = _.find(parent.data, (item) => {
          return item.isSelected
        })
        console.log({
          model: this.selectedModel,
          data: this.data,
          parentId: parentData
        })
        if (Object.keys(this.selectedData).length === 0) {
          this.createItem({
            model: this.selectedModel,
            data: this.data,
            parentId: parentData
          })
        } else {
          this.modifyItem({
            model: this.selectedModel,
            data: this.data,
            parentId: parentData
          })
        }
      },
      createItem (_data) {
        this.$nextTick(() => {
          this.$emit('createItem', _data, () => {
            this.data = {}
          })
        })
      },
      modifyItem (_data) {
        this.$nextTick(() => {
          this.$emit('modifyItem', _data, () => {
            this.data = {}
          })
        })
      }
    },
    watch: {
      selectedData (val) {
        console.log(val)
        this.data = deepClone(val)
      }
    }
  }
</script>

<style scoped>

</style>
