<template>
  <tbody class="estimate-modify">
    <tr v-for="data in dataGroup">
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionPlace,  data.selectedData.ed_place_pk) || data.selectedData.place_name}}</span>
        <select2 :options="data.options.constructionPlace" v-model="data.selectedData.ed_place_pk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}">
        </select2>
      </td>
      <td>
        <input type="text" class="input" placeholder="상세위치" v-model="data.selectedData.ed_detail_place" />
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.construction, data.selectedData.ed_ctpk) || data.selectedData.ct_name}}</span>
        <select2 :options="data.options.construction" v-model="data.selectedData.ed_ctpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcess, data.selectedData.ed_cppk) || data.selectedData.cp_name}}</span>
        <select2 :options="data.options.constructionProcess" v-model="data.selectedData.ed_cppk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.constructionProcessDetail, data.selectedData.ed_cpdpk) || data.selectedData.cpd_name}}</span>
        <select2 :options="data.options.constructionProcessDetail" v-model="data.selectedData.ed_cpdpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceCategory, data.selectedData.ed_rcpk) || data.selectedData.rc_name}}</span>
        <select2 :options="data.options.resourceCategory" v-model="data.selectedData.ed_rcpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resourceType, data.selectedData.ed_rtpk) || data.selectedData.rt_name}}</span>
        <select2 :options="data.options.resourceType" v-model="data.selectedData.ed_rtpk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}">
        </select2>
      </td>
      <td>
        <span v-show="data.isModify === false">{{getSelectedText(data.options.resource, data.selectedData.ed_rspk) || data.selectedData.rs_name}}</span>
        <select2 :options="data.options.resource" v-model="data.selectedData.ed_rspk" v-show="data.isModify === true" :class="{'is-modify': data.isModify}">
        </select2>
      </td>
      <td>
        <input type="text" placeholder="면적 입력" class="input" v-model="data.selectedData.ed_input_value"/>
      </td>
      <td>
        <input type="text" placeholder="물량 입력" class="input" v-model="data.selectedData.ed_resource_amount"/>
      </td>
      <td>
        {{data.selectedData.labor_costs}}
      </td>
      <td>
        {{data.selectedData.resource_costs}}
      </td>
      <td>
        <button class="button" @click="data.isModify = !data.isModify">{{data.isModify ? '취소': '수정'}}</button>
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

  const queryApi = '/api/contract/'

  export default {
    name: 'estimateModify',
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

        }
      }
    },
    created () {
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
            this.dataGroup.push(specificationData)
          })
        } else {
          data.isModify = false
          this.dataGroup.push(data)
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
        const sendData = data.selectedData
        this.$http.delete(`${queryApi}/${id}/estimate/${sendData.ed_pk}`)
        .then((response) => {
          if (response.data.code !== 200) {
            return false
          }
          // TODO 삭제처리
        }).catch((error) => {
          console.log(error)
        })
      },
      updateRow (data) {
        console.log(data)
        const id = this.$route.params.id
        const sendData = data.selectedData
        this.$http.put(`${queryApi}/${id}/estimate/${sendData.ed_pk}`, sendData)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            console.log(response.data.data)
            data.isModify = false
            data.selectedData = response.data.data.data
          }).catch((error) => {
            console.log(error)
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
</style>
<style lang="scss" scoped>
  .hide {
    display:none
  }
</style>
