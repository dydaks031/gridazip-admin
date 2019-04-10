<template>
  <table class="table box">
    <colgroup>
      <col width="7%" />
      <col width="7%" />
      <col width="7%" />
      <col width="7%" />
      <col width="7%" />
      <col width="7%" />
      <col width="7%" />
      <col width="12%" />
      <col width="10%" />
      <col width="7%" />
      <col width="7%" />
      <col width="5%" />
    </colgroup>
    <tbody>
      <tr>
        <td>
          <select2 :options="options.constructionPlace" v-model="selected.ed_place_pk">
            <option disabled value="0">공사 위치 선택</option>
          </select2>
        </td>
        <td>
          <input type="text" class="input" placeholder="상세위치" v-model="selected.ed_detail_place"/>
        </td>
        <td>
          <select2 :options="options.construction" v-model="selected.ed_ctpk" v-on:input="changedData('construction', 'ed_ctpk')">
            <option disabled value="0">공사 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.constructionProcess" v-model="selected.ed_cppk" v-on:input="changedData('constructionProcess', 'ed_cppk')">
            <option disabled value="0">공정 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.constructionProcessDetail" v-model="selected.ed_cpdpk" v-on:input="changedData('constructionProcessDetail', 'ed_cpdpk')">
            <option disabled value="0">상세공정 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.resourceCategory" v-model="selected.rc_pk" v-on:input="changedData('resourceCategory', 'rc_pk')">
            <option disabled value="0">자재분류 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.resourceType" v-model="selected.ed_rtpk" v-on:input="changedData('resourceType', 'ed_rtpk')">
            <option disabled value="0">자재군 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.resource" v-model="selected.ed_rspk" v-on:input="changedData('resource', 'ed_rspk')">
            <option disabled value="0">자재 선택</option>
          </select2>
        </td>
        <td>
          <input type="text" class="input" placeholder="자재 별칭" v-model="selected.ed_alias"/>
        </td>
        <td>
          <input type="text" placeholder="입력값 입력" class="input" v-model="selected.ed_input_value"/>
        </td>
        <td>
          <span v-show="cpdUnit === 0">(단위: 개)</span>
          <span v-show="cpdUnit === 1">(단위: M)</span>
          <span v-show="cpdUnit === 2">(단위: M^2)</span>
        </td>
        <td>
          <button class="button" @click="registerEstimateRow">등록</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  import select2 from '../components/select2Component'
  import META_LODING_CONFIG from '../../config/meta-loading-config'
  import utils from '../../services/utils'
  import _ from 'underscore'
  import deepClone from '../../services/deepClone'
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
    name: 'estimate-select',
    components: {
      select2
    },
    props: {
      isNewTab: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        metaData: {},
        params: {},
        selected: {
          ed_ctpk: 0,
          ed_place_pk: 0,
          ed_cppk: 0,
          ed_cpdpk: 0,
          rc_pk: 0,
          ed_rtpk: 0,
          ed_rspk: 0,
          ed_detail_place: '',
          ed_input_value: ''
        },
        options: {
          construction: [],
          constructionPlace: [],
          constructionProcess: [],
          constructionProcessDetail: [],
          resourceCategory: [],
          resourceType: [],
          resourceUnit: [],
          resource: []
        },
        cpdUnit: '',
        cpdData: [],
        resourceTypeData: [],
        resourceData: []
      }
    },
    methods: {
      loadData (data = {}) {
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
          this.options[metaData.id] = this.changedDataToSelect2Data(metaData, metaData.keyList, response.data.data[metaData.keyList.list])
          this.options[metaData.id].unshift({
            text: `${metaData.label} 선택`,
            id: ''
          })
          if (metaData.id === 'constructionProcessDetail') {
            this.cpdData = response.data.data[metaData.keyList.list]
          }
          if (metaData.id === 'resourceType' && this.isNewTab) {
            this.resourceTypeData = response.data.data[metaData.keyList.list]
          }
          if (metaData.id === 'resource' && this.isNewTab) {
            this.resourceData = response.data.data[metaData.keyList.list]
          }
        }).catch((error) => {
          console.error(error)
        })
      },

      /**
       * Select2 형태에 맞게 Data 변환
       */
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
      /**
       * Data 변경 시 이벤트
       */
      changedData (id, key) {
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
          if (this.isNewTab) {
            this.selected.cpd_labor_costs = selectedData.cpd_labor_costs
          }
        }

        if (metaData.id === 'resourceType' && this.isNewTab) {
          const selectedData = _.find(this.resourceTypeData, (item) => {
            return item.rt_pk.toString() === this.selected.ed_rtpk.toString()
          }) || {}
          this.selected.rt_extra_labor_costs = selectedData.rt_extra_labor_costs
        }

        if (metaData.id === 'resource' && this.isNewTab) {
          const selectedData = _.find(this.resourceData, (item) => {
            return item.rs_pk.toString() === this.selected.ed_rspk.toString()
          })
          if (selectedData) {
            this.selected.ru_calc_expression = selectedData.ru_calc_expression
            this.selected.rs_price = selectedData.rs_price
          }
        }
        // 변경된 데이터의 하위 데이터는 초기화한다.
        this.removeChildData(type, metaData, curDepthTarget, metaData, key)
      },
      /**
       * 하위 데이터를 초기화히기 위해 재귀로 동작하는 함수
       * @param type 공사 및 자재 데이터의 구분
       * @param model 지워야 할 데이터
       * @param target 지워야 할 데이터의 하위 Depth 객체
       * @param parent 부모의 metadata
       * @param key 부모의 pk가 서버로 전송될 떄의 key 값
       */
      removeChildData (type, model, target, parent, key) {
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
              this.options[child[i].id] = [{
                text: `${child[i].label} 선택`,
                id: ''
              }]
            }
            // remove child data
            this.options[child[i].id].length = 1
            const isReloadItem = target.find((item) => {
              return item.id === child[i].id
            })

            // 하위 객체가 초기화되면서 API 호출이 필요한 경우
            if (typeof isReloadItem === 'object') {
              // // call to child's method
              const data = {}
              data[parent.keyList.id] = this.selected[key]
              this.loadData({
                metaData: child[i],
                data: data
              })
            }
            this.removeChildData(type, child[i], target, parent, key)
          }
        }
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
      registerEstimateRow () {
        const id = this.params.id
        const esPk = this.params.es_pk
        if (!id) {
          return false
        }

        if (this.isNewTab) {
          this.$emit('registerData', {
            selectedData: deepClone(this.selected),
            options: deepClone(this.options),
            isAddedBySelf: true
          })
        } else {
          this.$http.post(`${queryApi}/${id}/estimate/${esPk}`, this.selected)
            .then((response) => {
              if (response.data.code !== 200) {
                openNotification({
                  message: response.data.data.msg,
                  type: 'danger',
                  duration: 1500
                })
                return
              }
              console.log(response.data.data)
              var data = response.data.data.data

              this.$emit('registerData', {
                selectedData: data,
                options: this.options
              })
            }).catch((error) => {
              console.error(error)
            })
        }
      }
    },
    mounted () {
      this.params = this.$route.params
    },
    created () {
      this.metaData = deepClone(META_LODING_CONFIG)
      const constructionData = _.find(this.metaData.construction, (item) => {
        return item.id === 'construction'
      })
      const constructionPlaceData = _.find(this.metaData.construction, (item) => {
        return item.id === 'constructionPlace'
      })
      const resourceCategoryData = _.find(this.metaData.resource, (item) => {
        return item.id === 'resourceCategory'
      })
      // 초기에 필요한 데이터 로드 (공사, 공사위치, 자재분류)
      this.loadData({
        metaData: constructionData
      })
      this.loadData({
        metaData: constructionPlaceData
      })
      this.loadData({
        metaData: resourceCategoryData
      })
    }
  }
</script>

<style scoped lang="scss">
  .select2-container {
    width:100% !important;
  }
</style>
