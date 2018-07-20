<template>
  <tbody class="estimate-modify">
  <tr v-for="data in dataGroup">
    <td>
      <input type="checkbox" class="checkbox" />
    </td>
    <td>
      <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionPlace,  data.selectedData.ed_place_pk) || data.selectedData.place_name}}</span>
      <select2 :options="data.options.constructionPlace" v-model="data.selectedData.ed_place_pk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" >
      </select2>
    </td>
    <td>
      <span v-show="data.isModify === false">{{data.selectedData.ed_detail_place}}</span>
      <input type="text" class="input" placeholder="상세위치" v-model="data.selectedData.ed_detail_place" v-show="data.isModify === true"/>
    </td>
    <td>
      <span v-show="data.isModify === false">{{getSelectedText(data.options.construction, data.selectedData.ed_ctpk) || data.selectedData.ct_name}}</span>
      <select2 :options="data.options.construction" v-model="data.selectedData.ed_ctpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'construction', 'ed_ctpk', ...arguments)">
      </select2>
    </td>
    <td>
      <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcess, data.selectedData.ed_cppk) || data.selectedData.cp_name}}</span>
      <select2 :options="data.options.constructionProcess" v-model="data.selectedData.ed_cppk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'constructionProcess', 'ed_cppk', ...arguments)">
      </select2>
    </td>
    <td>
      <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcessDetail, data.selectedData.ed_cpdpk) || data.selectedData.cpd_name}}</span>
      <select2 :options="data.options.constructionProcessDetail" v-model="data.selectedData.ed_cpdpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'constructionProcessDetail', 'ed_cpdpk', ...arguments)">
      </select2>
    </td>
    <td>
      <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceCategory, data.selectedData.rc_pk) || data.selectedData.rc_name}}</span>
      <select2 :options="data.options.resourceCategory" v-model="data.selectedData.rc_pk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'resourceCategory', 'rc_pk', ...arguments)">
      </select2>
    </td>
    <td>
      <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceType, data.selectedData.ed_rtpk) || data.selectedData.rt_name}}</span>
      <select2 :options="data.options.resourceType" v-model="data.selectedData.ed_rtpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'resourceType', 'ed_rtpk', ...arguments)">
      </select2>
    </td>
    <td class="resource-view">
      <span v-show="data.isModify === false">{{getSelectedText(data.options.resource, data.selectedData.ed_rspk) || data.selectedData.rs_name}}</span>
      <select2 :options="data.options.resource" v-model="data.selectedData.ed_rspk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'resource', 'ed_rspk', ...arguments)">
      </select2>
      <span class="resource-code" v-show="data.isModify === false && data.selectedData.rs_code">{{data.selectedData.rs_code}}</span>
    </td>
    <td>
      <span v-show="data.isModify === false">{{data.selectedData.ed_alias || '-'}}</span>
      <input type="text" placeholder="별칭 입력" class="input" v-model="data.selectedData.ed_alias" v-show="data.isModify === true" />
    </td>
    <td>
      <span v-show="data.isModify === false">{{data.selectedData.ed_input_value}}</span>
      <input type="text" placeholder="입력값 입력" class="input" v-model="data.selectedData.ed_input_value" v-show="data.isModify === true" />
    </td>
    <td>
      <span v-show="data.isModify === false">{{data.selectedData.ed_resource_amount}}</span>
      <input type="text" placeholder="물량 입력" class="input" v-model="data.selectedData.ed_resource_amount"  v-show="data.isModify === true" />
    </td>
    <td>
      {{addCommas(data.selectedData.labor_costs)}}
    </td>
    <td>
      {{addCommas(data.selectedData.resource_costs)}}
    </td>
    <td>
      <button class="button" @click="changedModifyView(data)">{{data.isModify ? '취소': '수정'}}</button>
      <button class="button" :class="{hide: data.isModify}" @click="deleteRow(data)">삭제</button>
      <button class="button" :class="{hide: !data.isModify}" @click="updateRow(data)">확인</button>
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
      updateRow (data) {
        console.log(data)
        const id = this.$route.params.id
        const esPk = this.$route.params.es_pk
        const sendData = data.selectedData
        this.$http.put(`${queryApi}/${id}/estimate/${esPk}/${sendData.ed_pk}`, sendData)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            console.log(response.data.data)
            data.isModify = false
            data.selectedData.ed_resource_amount = response.data.data.data.ed_resource_amount
            data.selectedData.labor_costs = response.data.data.data.labor_costs
            data.selectedData.resource_costs = response.data.data.data.resource_costs
          }).catch((error) => {
            console.log(error)
          })
      },
      changedModifyView (data) {
        data.isModify = !data.isModify
        if (data.isFirstSelectDataLoaded) {
          return false
        }
        const id = this.$route.params.id
        const esPk = this.$route.params.es_pk
        this.$http.get(`${queryApi}/${id}/estimate/${esPk}/${data.selectedData.ed_pk}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            console.log(response.data.data)
            const selectBoxData = response.data.data
            for (const key in selectBoxData) {
              if (selectBoxData.hasOwnProperty(key)) {
                const type = this.getType(key)
                const realKey = key.replace(/List$/, '')
                const meta = _.find(this.metaData[type], (item) => {
                  return item.id === realKey
                })
                data.options[realKey] = this.changedDataToSelect2Data(meta, meta.keyList, selectBoxData[key])
                data.options[realKey].unshift({
                  text: `${meta.label} 선택`,
                  id: ''
                })
              }
            }
            this.$forceUpdate()
            data.isFirstSelectDataLoaded = true
          }).catch((error) => {
            console.log(error)
          })
      },
      changedDataToSelect2Data (metaData, keyList = {}, data = []) {
        const convertData = []
        _.forEach(data, (item) => {
          if (metaData.id !== 'resource') {
            convertData.push({
              id: item[keyList.id],
              text: item[keyList.name]
            })
          } else {
            convertData.push({
              id: item[keyList.id],
              text: item.rs_code !== '' ? `${item[keyList.name]}(${item.rs_code})` : `${item[keyList.name]}`
            })
          }
        })
        return convertData
      },
      getType (id) {
        const metaData = this.metaData
        const keyList = Object.keys(metaData)
        for (let i = 0; i < keyList.length; i += 1) {
          if (id.indexOf(keyList[i]) > -1) {
            return keyList[i]
          }
        }
      },
      changedData (data, id, key, inputValue, triggerKey) {
        if (triggerKey === 'NOT_UPDATE') {
          return false
        }
        const type = this.getType(id)
        const metaData = _.find(this.metaData[type], (item) => {
          return item.id === id
        })
        const curDepthTarget = _.filter(this.metaData[type], (item) => {
          return item.parentId === metaData.id
        })
        if (metaData.id === 'constructionProcessDetail') {
          const selectedData = _.find(this.cpdData, (item) => {
            return item[metaData.keyList.id].toString() === this.selected[key].toString()
          }) || {}
          this.cpdUnit = selectedData.cpd_unit
        }
        this.removeChildData(data, type, metaData, curDepthTarget, metaData, key)
      },
      /**
       * recursive function
       * @param model model to removed
       * @param target selected element's one depth child
       * @param parent selected element
       *
       */
      removeChildData (data, type, model, target, parent, key) {
        let currentId = model.id
        let child
        child = _.filter(this.metaData[type], (item) => {
          return item.parentId === currentId
        })
        // has child element in parent element
        if (child.length > 0) {
          for (let i = 0; i < child.length; i += 1) {
            // haven't data property when initialize component
            if (!child[i].hasOwnProperty('data') || !child[i].data) {
              data.options[child[i].id] = [{
                text: `${child[i].label} 선택`,
                id: ''
              }]
            }
            // remove child data
            data.options[child[i].id].length = 1
            const isReloadItem = target.find((item) => {
              return item.id === child[i].id
            })

            // if child element need api request (selected element's one depth child)
            if (typeof isReloadItem === 'object') {
              // // call to child's method
              const sendData = {}
              sendData[parent.keyList.id] = data.selectedData[key]
              this.loadData(data, {
                metaData: child[i],
                data: sendData
              })
            }
            this.removeChildData(data, type, child[i], target, parent, key)
          }
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
