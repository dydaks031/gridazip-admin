<template>
  <tbody class="estimate-modify">
    <tr v-for="(data, index) in dataGroup" :class="{'is-removed': data.isRemoved}">
      <td>
        <input type="checkbox" class="checkbox" v-model="data.isChecked" @change="updateMasterView(data, index)" :disabled="data.isRemoved"/>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionPlace,  data.selectedData.ed_place_pk) || data.selectedData.place_name}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{data.selectedData.ed_detail_place}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.construction, data.selectedData.ed_ctpk) || data.selectedData.ct_name}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcess, data.selectedData.ed_cppk) || data.selectedData.cp_name}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcessDetail, data.selectedData.ed_cpdpk) || data.selectedData.cpd_name}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceCategory, data.selectedData.rc_pk) || data.selectedData.rc_name}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceType, data.selectedData.ed_rtpk) || data.selectedData.rt_name}}</span>
      </td>
      <td class="resource-view">
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resource, data.selectedData.ed_rspk) || data.selectedData.rs_name}}</span>
        <span class="resource-code" v-show="data.isModify === false && data.selectedData.rs_code">{{data.selectedData.rs_code}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{data.selectedData.ed_alias || '-'}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{data.selectedData.ed_input_value}}</span>
      </td>
      <td>
        <span v-show="data.isModify === false">{{data.selectedData.resource_amount}}</span>
      </td>
      <td>
        {{addCommas(data.selectedData.labor_costs)}}
      </td>
      <td>
        {{addCommas(data.selectedData.resource_costs)}}
      </td>
      <td>
        <button class="button" v-show="!data.isRemoved" @click="deleteRow(data, index)">삭제</button>
      </td>
    </tr>
  </tbody>
</template>

<script>
  import select2 from '../components/select2Component'
  import EventBus from '../../services/eventBus'
  import _ from 'underscore'
  import META_LODING_CONFIG from '../../config/meta-loading-config'
  import deepClone from '../../services/deepClone'
  import mixin from '../../services/mixin'
  import utils from '../../services/utils'

  // const queryApi = '/api/contract/'

  export default {
    name: 'estimateMasterModify',
    mixins: [mixin],
    components: {
      select2
    },
    props: {
      rowData: {
        type: Object
      }
    },
    data () {
      return {
        dataGroup: [],
        options: {

        },
        metaData: {}
      }
    },
    created () {
      this.metaData = deepClone(META_LODING_CONFIG)
      EventBus.$on('updateMasterModifyView', (data) => {
        if (_.isArray(data)) {
          const target = data[0]
          if (!target) {
            return
          }

          data.forEach((item) => {
            const specificationData = {}
            specificationData.options = {
              constructionPlace: [],
              construction: [],
              constructionProcess: [],
              constructionProcessDetail: [],
              resourceCategory: [],
              resourceType: [],
              resourceUnit: [],
              resource: []
            }
            specificationData.isModify = false
            specificationData.selectedData = item
            specificationData.isChecked = false
            this.dataGroup.unshift(deepClone(specificationData))
          })
        } else {
          data.isModify = false
          this.dataGroup.unshift(deepClone(data))
        }
      })
      EventBus.$on('cancelDeleteMasterModifyView', (data) => {
        const target = _.find(this.dataGroup, (item) => {
          return item.selectedData.index === data.selectedData.index
        })
        console.log(target)
        target.isRemoved = !target.isRemoved
        this.$forceUpdate()
      })
    },
    methods: {
      getSelectedText (selectList, id) {
        const target = _.find(selectList, (item) => {
          return item.id.toString() === id.toString()
        })

        if (target) {
          return target.text
        } else {
          return ''
        }
      },
      deleteRow (data, index) {
        data.isRemoved = true
        data.selectedData.index = index
        data.isChecked = false
        this.$emit('unchecked', index)
        this.$forceUpdate()
        const _data = deepClone(data)
        _data.selectedData.ed_input_value = -(Math.abs(_data.selectedData.ed_input_value))
        _data.selectedData.ed_resource_amount = -(Math.abs(parseInt(_data.selectedData.resource_amount, 10)))
        _data.selectedData.ed_calculated_amount = -(Math.abs(parseInt(_data.selectedData.resource_amount, 10)))
        this.$emit('checked', _data)
      },
      updateMasterView (data, index) {
        console.log(data.isChecked)
        if (data.isChecked) {
          data.selectedData.ed_resource_amount = data.selectedData.resource_amount
          data.selectedData.ed_calculated_amount = data.selectedData.resource_amount
          data.selectedData.index = index
          this.$emit('checked', data)
        } else {
          this.$emit('unchecked', index)
        }
      },
      loadData (currentData, data = {}) {
        const metaData = data.metaData
        const api = metaData.api
        const sendData = data.data || {}
        if (!api) {
          console.error('API IS NOT DEFINED')
          return false
        }
        const keyList = Object.keys(sendData)
        const params = utils.getQueryString(sendData)
        if (keyList.length > 0) {
          const key = keyList[0]
          if (sendData[key] === '') {
            return
          }
        }
        this.$http.get(`${api}?${params}`, sendData).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          currentData.options[metaData.id] = this.changedDataToSelect2Data(metaData, metaData.keyList, response.data.data[metaData.keyList.list])
          currentData.options[metaData.id].unshift({
            text: `${metaData.label} 선택`,
            id: ''
          })
          console.log(this.options)
        }).catch((error) => {
          console.error(error)
        })
      }
    }
  }
</script>

<style lang="scss">
  .estimate-modify {
    .select2-container {
      display: none;
    }

    .is-modify {
      display: none;
      + .select2-container {
        display: block
      }
    }
  }
  .resource-view {
    span {
      display:block;
      &.resource-code {
        font-size: 0.8rem;
      }
    }
  }
</style>
<style lang="scss" scoped>
  .hide {
    display:none
  }
  .is-removed {
    > td {
      background-color: #dfdfdf;
    }
  }
</style>
