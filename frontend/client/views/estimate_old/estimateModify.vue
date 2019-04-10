<template>
  <tbody class="estimate-modify">
    <template v-for="(data, index) in dataGroup">
      <tr :class="{'is-removed': data.isRemoved}">
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
        <select2 :options="data.options.construction" v-if="data.options.construction.length > 0" v-model="data.selectedData.ed_ctpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'construction', 'ed_ctpk', ...arguments)">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcess, data.selectedData.ed_cppk) || data.selectedData.cp_name}}</span>
        <select2 :options="data.options.constructionProcess" v-if="data.options.constructionProcess.length > 0" v-model="data.selectedData.ed_cppk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'constructionProcess', 'ed_cppk', ...arguments)">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcessDetail, data.selectedData.ed_cpdpk) || data.selectedData.cpd_name}}</span>
        <select2 :options="data.options.constructionProcessDetail" v-if="data.options.constructionProcessDetail.length > 0" v-model="data.selectedData.ed_cpdpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'constructionProcessDetail', 'ed_cpdpk', ...arguments)">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceCategory, data.selectedData.rc_pk) || data.selectedData.rc_name}}</span>
        <select2 :options="data.options.resourceCategory" v-if="data.options.resourceCategory.length > 0" v-model="data.selectedData.rc_pk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'resourceCategory', 'rc_pk', ...arguments)">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceType, data.selectedData.ed_rtpk) || data.selectedData.rt_name}}</span>
        <select2 :options="data.options.resourceType" v-if="data.options.resourceType.length > 0" v-model="data.selectedData.ed_rtpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'resourceType', 'ed_rtpk', ...arguments)">
        </select2>
      </td>
      <td class="resource-view">
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resource, data.selectedData.ed_rspk) || data.selectedData.rs_name}}</span>
        <select2 :options="data.options.resource" v-if="data.options.resource.length > 0" v-model="data.selectedData.ed_rspk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}" v-on:input="changedData(data, 'resource', 'ed_rspk', ...arguments)">
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
        {{data.selectedData.ed_resource_amount}}
        <!--<span v-show="data.isModify === false"></span>-->
        <!--<input type="text" placeholder="물량 입력" class="input" v-model="data.selectedData.ed_resource_amount"  v-show="data.isModify === true" />-->
      </td>
      <td>
        {{addCommas(data.selectedData.labor_costs)}}
      </td>
      <td>
        {{addCommas(data.selectedData.resource_costs)}}
      </td>
      <td>
        <button class="button" @click="changedModifyRowView(data)" v-if="!data.isRemoved">{{data.isModify ? '취소': '수정'}}</button>
        <button class="button" v-if="!data.isModify && data.selectedData.hasOwnProperty('ed_pk')" @click="deleteRow(data)">삭제</button>
        <button class="button" v-if="data.isModify && !data.isRemoved" @click="updateRow(data)">확인</button>
        <button class="button" v-if="data.isRemoved" @click="cancelRemoveRow(data, index)">취소</button>
      </td>
    </tr>
      <tr class="original-diff" :class="{'is-removed': data.isRemoved}" v-if="estimateAmountCalculation !== undefined && !data.isRemoved">
        <td>
          <span>{{getSelectedText(originDataGroup[index].options.constructionPlace,  originDataGroup[index].selectedData.ed_place_pk) || originDataGroup[index].selectedData.place_name}}</span>
        </td>
        <td>
          <span>{{originDataGroup[index].selectedData.ed_detail_place}}</span>
        </td>
        <td>
          <span>{{getSelectedText(originDataGroup[index].options.construction, originDataGroup[index].selectedData.ed_ctpk) || originDataGroup[index].selectedData.ct_name}}</span>
        </td>
        <td>
          <span>{{getSelectedText(originDataGroup[index].options.constructionProcess, originDataGroup[index].selectedData.ed_cppk) || originDataGroup[index].selectedData.cp_name}}</span>
        </td>
        <td>
          <span>{{getSelectedText(originDataGroup[index].options.constructionProcessDetail, originDataGroup[index].selectedData.ed_cpdpk) || originDataGroup[index].selectedData.cpd_name}}</span>
        </td>
        <td>
          <span>{{getSelectedText(originDataGroup[index].options.resourceCategory, originDataGroup[index].selectedData.rc_pk) || originDataGroup[index].selectedData.rc_name}}</span>
        </td>
        <td>
          <span>{{getSelectedText(originDataGroup[index].options.resourceType, originDataGroup[index].selectedData.ed_rtpk) || originDataGroup[index].selectedData.rt_name}}</span>
        </td>
        <td class="resource-view">
          <span>{{getSelectedText(originDataGroup[index].options.resource, originDataGroup[index].selectedData.ed_rspk) || originDataGroup[index].selectedData.rs_name}}</span>
          <span class="resource-code" v-show="data.isModify === false && originDataGroup[index].selectedData.rs_code">{{originDataGroup[index].selectedData.rs_code}}</span>
        </td>
        <td>
          <span>{{originDataGroup[index].selectedData.ed_alias || '-'}}</span>
        </td>
        <td>
          <span>{{originDataGroup[index].selectedData.ed_input_value}}</span>
        </td>
        <td>
          <span>{{originDataGroup[index].selectedData.ed_resource_amount}}</span>
        </td>
        <td>
          {{addCommas(originDataGroup[index].selectedData.labor_costs)}}
        </td>
        <td>
          {{addCommas(originDataGroup[index].selectedData.resource_costs)}}
        </td>
        <td></td>
      </tr>
    </template>
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
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  const NotificationComponent = Vue.extend(Notification)

  const openNotification = (propsData = {
    title: '',
    message: '',
    type: '',
    direction: '',
    duration: 4500,
    container: '.notifications'
  }) => {
    return new NotificationComponent({
      el: document.createElement('div'),
      propsData
    })
  }
  const queryApi = '/api/contract/'

  export default {
    name: 'estimateModify',
    mixins: [mixin],
    components: {
      select2
    },
    props: {
      rowData: {
        type: Array
      },
      estimateAmountCalculation: {
        type: Function
      },
      bus: {
        type: Object
      }
    },
    data () {
      return {
        dataGroup: [],
        originDataGroup: [],
        options: {

        },
        metaData: {}
      }
    },
    created () {
      this.metaData = deepClone(META_LODING_CONFIG)
      EventBus.$on('updateModifyView', (data) => {
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
          this.originDataGroup.unshift(deepClone(data))
        }
      })
      EventBus.$on('removeModifyView', (index) => {
        const target = _.filter(this.dataGroup, (item) => {
          return item.selectedData.index === index
        })
        target.forEach((item) => {
          this.dataGroup = _.without(this.dataGroup, item)
          const targetOrigin = _.find(this.originDataGroup, (origin) => {
            return origin.selectedData.index === item.selectedData.index
          })
          this.originDataGroup = _.without(this.originDataGroup, targetOrigin)
        })
      })
      if (this.bus) {
        this.bus.$on('updateTab', () => {
          const id = this.$route.params.id
          const selectedData = this.getNewTabDataByDiffOriginData()

          this.$http.post(`${queryApi}/${id}/estimate/master`, {
            estimateList: selectedData
          })
          .then((response) => {
            console.log(response)
            if (response.data.code !== 200) {
              openNotification({
                message: '신규 탭 생성 도중 이상이 발생하였습니다..',
                type: 'success',
                duration: 1500
              })
              return false
            }

            openNotification({
              message: '등록하신 내용으로 신규 탭이 생성 되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$router.back()
          })
          .catch((e) => {
            console.error(e)
          })
        })
      }
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
        const id = this.$route.params.id
        const esPk = this.$route.params.es_pk
        const sendData = data.selectedData
        if (!sendData.ed_pk) {
          this.dataGroup = _.without(this.dataGroup, data)
          return
        }
        this.$http.delete(`${queryApi}/${id}/estimate/${esPk}/${sendData.ed_pk}`)
        .then((response) => {
          if (response.data.code !== 200) {
            return false
          }
          this.dataGroup = _.without(this.dataGroup, data)
        }).catch((error) => {
          console.error(error)
        })
      },
      updateRow (data) {
        const id = this.$route.params.id
        const esPk = this.$route.params.es_pk
        const sendData = data.selectedData
        if (!esPk || !sendData.ed_pk) {
          data.selectedData = this.estimateAmountCalculation(sendData)
          data.isModify = false
        } else {
          this.$http.put(`${queryApi}/${id}/estimate/${esPk}/${sendData.ed_pk}`, sendData)
            .then((response) => {
              if (response.data.code !== 200) {
                return
              }
              data.isModify = false
              data.selectedData.ed_resource_amount = response.data.data.data.ed_resource_amount
              data.selectedData.labor_costs = response.data.data.data.labor_costs
              data.selectedData.resource_costs = response.data.data.data.resource_costs

              openNotification({
                message: '해당 내역이 수정되었습니다.',
                type: 'success',
                duration: 1500
              })
            }).catch((error) => {
              console.error(error)
            })
        }
      },
      changedModifyRowView (data) {
        data.isModify = !data.isModify
        if (data.isFirstSelectDataLoaded) {
          return false
        }
        const id = this.$route.params.id
        const esPk = this.$route.params.es_pk
        let apiUrl = `${queryApi}/${id}/estimate/${esPk}/${data.selectedData.ed_pk}`
        if (data.selectedData.isAddedBySelf) {
          return
        } else if (!data.selectedData.isAddedBySelf && this.estimateAmountCalculation) {
          const param = {
            ct_pk: data.selectedData.ed_ctpk,
            cp_pk: data.selectedData.ed_cppk,
            rc_pk: data.selectedData.rc_pk,
            rt_pk: data.selectedData.ed_rtpk
          }
          apiUrl = `${queryApi}/${id}/estimate/master/row?${utils.getQueryString(param)}`
        }

        this.$http.get(apiUrl)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
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
            console.error(error)
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
      cancelRemoveRow (data, index) {
        data.isRemoved = false
        this.dataGroup = _.without(this.dataGroup, data)
        this.originDataGroup = _.without(this.originDataGroup[index], index)
        EventBus.$emit('cancelDeleteMasterModifyView', data)
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
       * Origin Data 와 변경할 데이터를 비교해 그 차를 계산하여 서버에 전송한다.
       */
      getNewTabDataByDiffOriginData () {
        const selectedData = deepClone(_.pluck(this.dataGroup, 'selectedData'))
        const originData = deepClone(_.pluck(this.originDataGroup, 'selectedData'))
        const sendData = []
        _.forEach(selectedData, (item, index) => {
          let targetOriginData = _.find(originData, (origin) => {
            return parseInt(item.ed_place_pk, 10) === parseInt(origin.ed_place_pk, 10) &&
              item.ed_detail_place === origin.ed_detail_place &&
              parseInt(item.ed_ctpk, 10) === parseInt(origin.ed_ctpk, 10) &&
              parseInt(item.ed_cppk, 10) === parseInt(origin.ed_cppk, 10) &&
              parseInt(item.ed_cpdpk, 10) === parseInt(origin.ed_cpdpk, 10) &&
              parseInt(item.rc_pk, 10) === parseInt(origin.rc_pk, 10) &&
              parseInt(item.ed_rtpk, 10) === parseInt(origin.ed_rtpk, 10) &&
              parseInt(item.ed_rspk, 10) === parseInt(origin.ed_rspk, 10)
          })
          if (targetOriginData) {
            if (item.isAddedBySelf) {
              sendData.push(item)
            } else {
              const currentInputValueToFixed = parseFloat(item.ed_input_value).toFixed(2)
              const originInputValueToFixed = parseFloat(targetOriginData.ed_input_value).toFixed(2)
              if (currentInputValueToFixed === originInputValueToFixed && parseFloat(item.ed_resource_amount).toFixed(2) !== parseFloat(targetOriginData.ed_resource_amount).toFixed(2)) {
                item.ed_resource_amount = (item.ed_resource_amount - targetOriginData.ed_resource_amount).toFixed(2)
              }
              // 삭제인 경우에는 차를 구하지 않는다.
              if (!this.dataGroup[index].isRemoved) {
                item.ed_input_value = (item.ed_input_value - targetOriginData.ed_input_value).toFixed(2)
              }
              const _item = this.estimateAmountCalculation(item)
              sendData.push(_item)
            }
          } else {
            targetOriginData = _.find(originData, (origin) => {
              return origin.index === item.index
            })
            targetOriginData.ed_input_value = -Math.abs(targetOriginData.ed_input_value)
            targetOriginData = this.estimateAmountCalculation(targetOriginData)
            // ????? Why?
            sendData.push(targetOriginData)
            sendData.push(item)
          }
        })
        return sendData
      },
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
  .is-removed {
    > td {
      background-color: #dfdfdf;
    }
  }
  .original-diff {
    font-size: 0.9rem;

    td {
      background: #f0f0f0;
      opacity: 0.8;
      padding-left: 0.85rem;
    }
  }
</style>
