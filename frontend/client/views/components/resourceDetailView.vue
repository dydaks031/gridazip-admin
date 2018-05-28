<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <div v-show="selectedModel.id === 'constructionProcessDetail'">
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
        <div v-show="selectedModel.id === 'resourceType'">
          <h4 class="title">자재군
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </h4>
          <div class="block">
            <label class="label">자재군명</label>
            <p class="control">
              <input class="input" type="text" v-model="data.rt_name" />
            </p>
            <label class="label">추가인건비</label>
            <p class="control">
              <input class="input" type="text" v-model="data.rt_extra_labor_costs" />
            </p>
          </div>
          <button class="button" @click="registerData">
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </button>
        </div>
        <div v-show="selectedModel.id === 'resourceUnit'">
          <h4 class="title">자재단위
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </h4>
          <div class="block">
            <label class="label">자재단위명</label>
            <p class="control">
              <input class="input" type="text" v-model="data.ru_name" />
            </p>
            <label class="label">계산식</label>
            <p class="control">
              <input class="input" type="text" v-model="data.ru_calc_expression" />
            </p>
            <label class="label">올림여부</label>
            <p class="control">
              <label class="radio">
                <input type="radio" value="1" name="ru_ceil_flag" v-model="data.ru_ceil_flag" />
                Y
              </label>
              <label class="radio">
                <input type="radio" value="0"  name="ru_ceil_flag" v-model="data.ru_ceil_flag" />
                N
              </label>
            </p>
          </div>
          <button class="button" @click="registerData">
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </button>
        </div>
        <div v-show="selectedModel.id === 'resource'">
          <h4 class="title">자재
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </h4>
          <div class="block">
            <label class="label">자재명</label>
            <p class="control">
              <input class="input" type="text" v-model="data.rs_name" />
            </p>
            <label class="label">자재코드</label>
            <p class="control">
              <input class="input" type="text" v-model="data.rs_code" />
            </p>
            <label class="label">자재단위</label>
            <div class="control">
              <div class="select">
                <select v-model="data.ru_pk">
                  <option value="" disabled>Please Select one</option>
                  <option v-for="data in unitData" :value="data.ru_pk">
                    {{data.ru_name}}
                  </option>
                </select>
              </div>
            </div>
            <label class="label">금액</label>
            <p class="control">
              <input class="input" type="text" v-model="data.rs_price" />
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
  import utils from '../../services/utils'

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
        data: {
          ru_pk: ''
        },
        unitData: []
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
            this.data = {
              ru_pk: ''
            }
          })
        })
      },
      modifyItem (_data) {
        this.$nextTick(() => {
          this.$emit('modifyItem', _data, () => {
            this.data = {
              ru_pk: ''
            }
          })
        })
      },
      loadUnitData (data = {}) {
        const unitModel = _.find(this.fullData, (item) => {
          return item.id === 'resourceUnit'
        })
        const categoryModel = _.find(this.fullData, (item) => {
          return item.id === 'resourceCategory'
        })
        const selectedCategoryId = _.find(categoryModel.data, (item) => {
          return item.isSelected
        })[categoryModel.keyList.id]

        const api = unitModel.api
        console.log(api)
        if (!api) {
          console.error('API IS NOT DEFINED')
          return false
        }
        let params = {}
        params[categoryModel.keyList.id] = selectedCategoryId
        params = utils.getQueryString(params)

        this.$http.get(`${api}?${params}`, data).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          console.log(response.data.data)
          const data = response.data.data
          this.unitData.length = 0
          _.forEach(data.resourceUnitList, (item, index) => {
            this.unitData.push(item)
          })
        }).catch((error) => {
          console.error(error)
        })
      }
    },
    watch: {
      selectedData (val) {
        console.log(val)
        console.log(this.selectedModel)
        this.data = deepClone(val)
        if (this.selectedModel) {
          if (this.selectedModel.id === 'resource' && !this.data.hasOwnProperty('ru_pk')) {
            this.data.ru_pk = ''
          }
        }
        this.loadUnitData()
      }
    }
  }
</script>

<style scoped>

</style>
