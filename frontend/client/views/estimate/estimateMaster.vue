<template>
  <div>
    <div class="tile is-ancestor">
      <estimate-select
        v-on:registerData="updateModifyView"
        :isNewTab="true"
      />
    </div>
    <div class="tile is-ancestor box" style="margin-bottom:2.5rem;">
      <div class="tile is-parent">
        <div class="tile is-child">
          <div class="title-view is-clearfix">
            <h1 class="title is-pulled-left">신규 등록 견적</h1>
            <button class="button is-pulled-right is-info" @click.stop="updateTab">등록</button>
          </div>
          <table class="table">
            <colgroup>
              <col width="5%"/>
              <col width="7%"/>
              <col width="4%" />
              <col width="7%" />
              <col width="8%" />
              <col width="5%" />
              <col width="7%" />
              <col width="auto" />
              <col width="auto" />
              <col width="5%" />
              <col width="5%" />
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
                <th>자재별칭</th>
                <th>입력값</th>
                <th>물량</th>
                <th>인건비</th>
                <th>자재비</th>
                <th></th>
              </tr>
            </thead>
            <estimate-modify
              :estimate-amount-calculation="getEstimateAmount"
              :rowData="resultData"
              :bus="bus"
              :updateTab="updateTab" />
          </table>
        </div>
      </div>
    </div>
    <div class="tile is-ancestor box">
      <div class="tile is-parent">
        <div class="tile is-child">
          <h1 class="title">입력된 견적 목록</h1>
          <table class="table">
            <colgroup>
              <col width="5%"/>
              <col width="5%"/>
              <col width="7%"/>
              <col width="4%" />
              <col width="7%" />
              <col width="8%" />
              <col width="5%" />
              <col width="7%" />
              <col width="auto" />
              <col width="auto" />
              <col width="5%" />
              <col width="5%" />
              <col />
              <col />
            </colgroup>
            <thead>
            <tr>
              <th></th>
              <th>위치</th>
              <th>상세위치</th>
              <th>공사</th>
              <th>공정</th>
              <th>상세공정</th>
              <th>자재분류</th>
              <th>자재군</th>
              <th>자재명</th>
              <th>자재별칭</th>
              <th>입력값</th>
              <th>물량</th>
              <th>인건비</th>
              <th>자재비</th>
              <th></th>
            </tr>
            </thead>
            <estimate-master-modify
            :beforeDelete="createDeleteRow"
            v-on:checked="updateModifyView"
            v-on:unchecked="removeModifyView"/>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import EstimateSelect from './estimateSelect'
  import EstimateModify from './estimateModify'
  import EventBus from '../../services/eventBus'
  import EstimateMasterModify from './estimateMasterModify'
  import deepClone from '../../services/deepClone'
  import calculator from 'calculator'
  import Vue from 'vue'
  const queryApi = '/api/contract/'

  export default {
    components: {
      EstimateMasterModify,
      EstimateModify,
      EstimateSelect
    },
    name: 'estimateMaster',
    data () {
      return {
        newInsertData: [],
        resultData: [],
        bus: new Vue()
      }
    },
    methods: {
      updateModifyView (data) {
        console.log('updateModifyView')
        console.log(data)
        const _data = deepClone(data)
        const estimateData = this.getEstimateAmount(_data.selectedData)
        EventBus.$emit('updateModifyView', {
          selectedData: estimateData,
          options: _data.options,
          isAddedBySelf: _data.isAddedBySelf,
          isRemoved: _data.isRemoved
        })
      },
      removeModifyView (index) {
        EventBus.$emit('removeModifyView', index)
      },
      getEstimateAmount (estimateData) {
        const func = calculator.func(`f(x) = ${estimateData.ru_calc_expression}`)
        estimateData.ed_resource_amount = parseFloat(func(estimateData.ed_input_value)).toFixed(2)
        estimateData.resource_costs = estimateData.rs_price * estimateData.ed_resource_amount
        estimateData.labor_costs = estimateData.ed_input_value * (estimateData.cpd_labor_costs + estimateData.rt_extra_labor_costs)
        return estimateData
      },
      loadData () {
        const id = this.$route.params.id
        this.$http.get(`${queryApi}/${id}/estimate/master?es_is_pre=false`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            var data = response.data.data
            EventBus.$emit('updateMasterModifyView', data.estimateList)
          }).catch((error) => {
            console.log(error)
          })
      },
      createDeleteRow () {
      },
      updateTab () {
        this.$nextTick(() => {
          this.bus.$emit('updateTab')
        })
      }
    },
    mounted () {
      this.loadData()
    }

  }
</script>

<style scoped>

</style>
