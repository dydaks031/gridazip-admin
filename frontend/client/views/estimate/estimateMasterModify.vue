<template>
  <tbody class="estimate-modify">
  <tr v-for="data in dataGroup">
    <td>
      <input type="checkbox" class="checkbox" v-model="data.isChecked" @change="updateMasterView(data)"/>
    </td>
    <td>
      <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionPlace,  data.selectedData.ed_place_pk) || data.selectedData.place_name}}</span>
    </td>
    <td>
      <span v-show="data.isModify === false">{{data.selectedData.detail_place}}</span>
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
      <button class="button" :class="{hide: data.isModify}" @click="deleteRow(data)">삭제</button>
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

  const queryApi = '/api/contract/'

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
      console.log(mixin)
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
      deleteRow (data) {
        console.log(data)
        const id = this.$route.params.id
        const esPk = this.$route.params.es_pk
        const sendData = data.selectedData
        this.$http.delete(`${queryApi}/${id}/estimate/${esPk}/${sendData.ed_pk}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.dataGroup = _.without(this.dataGroup, data)
          }).catch((error) => {
            console.log(error)
          })
      },
      updateMasterView (data) {
        console.log(data.isChecked)
        if (data.isChecked) {
          data.selectedData.ed_resource_amount = data.selectedData.resource_amount
          data.selectedData.ed_detail_place = data.selectedData.detail_place
          this.$emit('checked', data)
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
          // if (metaData.id === 'constructionProcessDetail') {
          //   this.cpdData = response.data.data[metaData.keyList.list]
          // }
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
</style>
