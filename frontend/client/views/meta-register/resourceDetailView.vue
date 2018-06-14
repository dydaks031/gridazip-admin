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
            <div class="control">
              <input class="input" type="text" v-model="data.cpd_name" :class="{'is-danger': $v.data.cpd_name.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.cpd_name.required">상세공정명을 입력해 주십시오</p>
            </div>
            <label class="label">인건비</label>
            <div class="control">
              <input class="input" type="text" v-model="data.cpd_labor_costs" :class="{'is-danger': $v.data.cpd_labor_costs.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.cpd_labor_costs.required">인건비를 입력해 주십시오.</p>
              <p class="help is-danger" v-if="!$v.data.cpd_labor_costs.numeric">인건비는 숫자만 입력하실 수 있습니다.</p>
            </div>
            <label class="label">최소물량</label>
            <div class="control">
              <input class="input" type="text" v-model="data.cpd_min_amount" :class="{'is-danger': $v.data.cpd_min_amount.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.cpd_min_amount.required">최소 물량을 입력해 주십시오.</p>
              <p class="help is-danger" v-if="!$v.data.cpd_min_amount.numeric">최소 물량은 숫자만 입력하실 수 있습니다.</p>
            </div>
            <label class="label">단위</label>
            <div class="control">
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
              <p class="help is-danger" v-if="!$v.data.cpd_unit.required">단위를 선택 해 주십시오.</p>
            </div>
          </div>
          <button class="button" @click="registerData($v.constructionProcessDetail)">
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
            <div class="control">
              <input class="input" type="text" v-model="data.rt_name" :class="{'is-danger': $v.data.rt_name.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.rt_name.required">자재군명을 입력해 주십시오</p>
            </div>
            <label class="label">추가인건비</label>
            <div class="control">
              <input class="input" type="text" v-model="data.rt_extra_labor_costs" :class="{'is-danger': $v.data.rt_extra_labor_costs.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.rt_extra_labor_costs.required">추가인건비를 입력해 주십시오.</p>
              <p class="help is-danger" v-if="!$v.data.rt_extra_labor_costs.numeric">추가인건비는 숫자만 입력하실 수 있습니다.</p>
            </div>
          </div>
          <button class="button" @click="registerData($v.resourceType)">
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
            <div class="control">
              <input class="input" type="text" v-model="data.ru_name" :class="{'is-danger': $v.data.ru_name.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.ru_name.required">자재단위명을 입력해 주십시오.</p>
            </div>
            <label class="label">계산식</label>
            <div class="control">
              <input class="input" type="text" v-model="data.ru_calc_expression" :class="{'is-danger': $v.data.ru_name.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.ru_calc_expression.required">계산식을 입력해 주십시오.</p>
              <p class="help is-danger" v-if="!$v.data.ru_calc_expression.isValidExpression">입력한 계산식이 유효하지 않습니다.</p>
            </div>
            <label class="label">올림여부</label>
            <div class="control">
              <label class="radio">
                <input type="radio" value="1" name="ru_ceil_flag" v-model="data.ru_ceil_flag" />
                Y
              </label>
              <label class="radio">
                <input type="radio" value="0"  name="ru_ceil_flag" v-model="data.ru_ceil_flag" />
                N
              </label>
              <p class="help is-danger" v-if="!$v.data.ru_ceil_flag.required">올림 여부를 선택 해 주십시오.</p>
            </div>
          </div>
          <button class="button" @click="registerData($v.resourceUnit)">
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
            <div class="control">
              <input class="input" type="text" v-model="data.rs_name" :class="{'is-danger': $v.data.rs_name.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.rs_name.required">자재명을 입력해 주십시오.</p>
            </div>
            <label class="label">자재코드</label>
            <div class="control">
              <input class="input" type="text" v-model="data.rs_code" :class="{'is-danger': $v.data.rs_code.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.rs_code.required">자재코드를 입력해 주십시오.</p>
            </div>
            <label class="label">자재단위</label>
            <div class="control">
              <div class="select" :class="{'is-danger': $v.data.rs_rupk.$invalid }" >
                <select v-model="data.rs_rupk">
                  <option value="" disabled>Please Select one</option>
                  <option v-for="data in unitData" :value="data.ru_pk">
                    {{data.ru_name}}
                  </option>
                </select>
                <p class="help is-danger" v-if="!$v.data.rs_rupk.required">자재단위를 선택해 주십시오.</p>
              </div>
            </div>
            <label class="label">금액</label>
            <div class="control">
              <input class="input" type="text" v-model="data.rs_price" :class="{'is-danger': $v.data.rs_price.$invalid }" />
              <p class="help is-danger" v-if="!$v.data.rs_price.required">자재 금액을 입력해 주십시오.</p>
              <p class="help is-danger" v-if="!$v.data.rs_price.numeric">자재 금액은 숫자만 입력하실 수 있습니다.</p>
            </div>
          </div>
          <button class="button" @click="registerData($v.resource)">
            <span v-if="Object.keys(selectedData).length === 0">등록</span>
            <span v-else>수정</span>
          </button>
        </div>
      </article>

    </div>
  </div>
</template>

<script>
  import _ from 'underscore'
  import deepClone from '../../services/deepClone'
  import utils from '../../services/utils'
  import mixin from '../../services/mixin'
  import { required, numeric } from 'vuelidate/lib/validators'
  import calculator from 'calculator'

  export default {
    name: 'resource-detail-view',
    mixins: [mixin],
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
    filters: {
      addCommasFilter (data) {
        console.log(data)
        return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    },
    data () {
      return {
        data: {
          rs_rupk: ''
        },
        unitData: []
      }
    },
    mounted () {
      console.log(this)
    },
    validations: {
      data: {
        cpd_name: {
          required
        },
        cpd_labor_costs: {
          required,
          numeric
        },
        cpd_min_amount: {
          required,
          numeric
        },
        cpd_unit: {
          required
        },
        rt_name: {
          required
        },
        rt_extra_labor_costs: {
          required,
          numeric
        },
        ru_name: {
          required
        },
        ru_calc_expression: {
          required,
          isValidExpression (value) {
            if (!value) {
              return false
            }
            let _value = _.clone(value)
            _value = _value
              .replace(/[x0-9+-.*/=]/gi, '')
              .replace(/(Math)[a-zA-Z]*\([x0-9+-.*/=]*\)/gi, '')
              .replace(/(Math)[a-zA-Z]*\([x0-9+-.*/=]*\)/gi, '')
            if (_value !== '') {
              return false
            }
            let func
            try {
              func = calculator.func(`f(x) = ${value}`)
              if (!func) {
                throw Error('FUNC IS NULL')
              }
              func(1)
            } catch (e) {
              console.error(e)
              return false
            }
            return true
          }
        },
        ru_ceil_flag: {
          required
        },
        rs_name: {
          required
        },
        rs_code: {
          required
        },
        rs_rupk: {
          required
        },
        rs_price: {
          required,
          numeric
        }
      },
      constructionProcessDetail: ['data.cpd_name', 'data.cpd_labor_costs', 'data.cpd_min_amount', 'data.cpd_unit'],
      resourceType: ['data.rt_name', 'data.rt_extra_labor_costs'],
      resourceUnit: ['data.ru_name', 'data.ru_calc_expression', 'data.ru_ceil_flag'],
      resource: ['data.rs_name', 'data.rs_code', 'data.rs_rupk', 'data.rs_price']
    },
    methods: {
      registerData (validator) {
        if (validator.$invalid) {
          return false
        }
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
              rs_rupk: ''
            }
          })
        })
      },
      modifyItem (_data) {
        this.$nextTick(() => {
          this.$emit('modifyItem', _data, () => {
            this.data = {
              rs_rupk: ''
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
        this.data = deepClone(val)
        if (this.selectedModel) {
          if (this.selectedModel.id === 'resource' && !this.data.hasOwnProperty('rs_rupk')) {
            this.data.rs_rupk = ''
          }
        }
        if (this.selectedModel.id === 'resource') {
          this.loadUnitData()
        }
      }
    }
  }
</script>

<style scoped>

</style>
