<template>
  <table class="table box">
    <colgroup>
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
      <col width="10%" />
    </colgroup>
    <tbody>
      <tr>
        <td>
          <select2 :options="options.constructionPlace" v-model="selected.constructionPlace">
            <option disabled value="0">공사 위치 선택</option>
          </select2>
        </td>
        <td>
          <input type="text" class="input" placeholder="상세위치" v-model="selected.constructionDetailPlace"/>
        </td>
        <td>
          <select2 :options="options.construction" v-model="selected.construction" v-on:input="changedData('construction')">
            <option disabled value="0">공사 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.constructionProcess" v-model="selected.constructionProcess" v-on:input="changedData('constructionProcess')">
            <option disabled value="0">공정 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.constructionProcessDetail" v-model="selected.constructionProcessDetail" v-on:input="changedData('constructionProcessDetail')">
            <option disabled value="0">상세공정 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.resourceCategory" v-model="selected.resourceCategory" v-on:input="changedData('resourceCategory')">
            <option disabled value="0">자재단위 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.resourceType" v-model="selected.resourceType" v-on:input="changedData('resourceType')">
            <option disabled value="0">자재군 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.resourceUnit" v-model="selected.resourceUnit" v-on:input="changedData('resourceUnit')">
            <option disabled value="0">자재단위 선택</option>
          </select2>
        </td>
        <td>
          <select2 :options="options.resource" v-model="selected.resource" v-on:input="changedData('resource')">
            <option disabled value="0">자재 선택</option>
          </select2>
        </td>
        <td>
          <input type="text" placeholder="면적 입력" class="input" v-model="selected.size"/>
        </td>
        <td>
          <button class="button" @click="getSelectedData">등록</button>
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

  export default {
    name: 'estimate-select',
    components: {
      select2
    },
    data () {
      return {
        metaData: {},
        selected: {
          construction: 0,
          constructionPlace: 0,
          constructionProcess: 0,
          constructionProcessDetail: 0,
          resourceCategory: 0,
          resourceType: 0,
          resourceUnit: 0,
          resource: 0,
          constructionDetailPlace: '',
          size: ''
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
        }
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
        const params = utils.getQueryString(sendData)

        this.$http.get(`${api}?${params}`, sendData).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          console.log(response)
          this.options[metaData.id] = this.changedDataToSelect2Data(metaData.keyList, response.data.data[metaData.keyList.list])
          this.options[metaData.id].unshift({
            text: `${metaData.label} 선택`,
            id: ''
          })
        }).catch((error) => {
          console.error(error)
        })
      },
      changedDataToSelect2Data (keyList = {}, data = []) {
        const convertData = []
        _.forEach(data, (item) => {
          convertData.push({
            id: item[keyList.id],
            text: item[keyList.name]
          })
        })
        return convertData
      },
      changedData (id) {
        const type = this.getType(id)
        const metaData = _.find(this.metaData[type], (item) => {
          return item.id === id
        })
        const curDepthTarget = _.filter(this.metaData[type], (item) => {
          return item.parentId === metaData.id
        })
        console.log(metaData)
        this.removeChildData(type, metaData, curDepthTarget, metaData)
      },
      /**
       * recursive function
       * @param model model to removed
       * @param target selected element's one depth child
       * @param parent selected element
       *
       */
      removeChildData (type, model, target, parent) {
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

            // if child element need api request (selected element's one depth child)
            if (typeof isReloadItem === 'object') {
              // // call to child's method
              const data = {}
              data[parent.keyList.id] = this.selected[parent.id]
              this.loadData({
                metaData: child[i],
                data: data
              })
            }
            this.removeChildData(type, child[i], target, parent)
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
      getSelectedData () {
        console.log(this.selected)
        this.$emit('registerData', {
          selectedData: this.selected,
          options: this.options
        })
      }
    },
    mounted () {
      console.log(META_LODING_CONFIG)
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
