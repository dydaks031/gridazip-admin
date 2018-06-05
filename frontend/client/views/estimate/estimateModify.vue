<template>
  <tbody>
    <tr v-for="data in dataGroup">
      <td>
        <span class="input" v-show="isModify === false">{{getSelectedText(data.options.constructionPlace,  data.selectedData.place_pk)}}</span>
        <select2 :options="data.options.constructionPlace" v-model="data.selectedData.place_pk" v-show="isModify === true">
        </select2>
      </td>
      <td>
        <input type="text" class="input" placeholder="상세위치" v-model="data.selectedData.detail_place" />
      </td>
      <td>
        <span class="input" v-show="isModify === false">{{data.selectedData.ct_pk}}</span>
        <select2 :options="data.options.construction" v-model="data.selectedData.ct_pk" v-show="isModify === true">
        </select2>
      </td>
      <td>
        <span class="input" v-show="isModify === false">{{data.selectedData.cp_pk}}</span>
        <select2 :options="data.options.constructionProcess" v-model="data.selectedData.cp_pk" v-show="isModify === true">
        </select2>
      </td>
      <td>
        <span class="input" v-show="isModify === false">{{data.selectedData.cpd_pk}}</span>
        <select2 :options="data.options.constructionProcessDetail" v-model="data.selectedData.cpd_pk" v-show="isModify === true">
        </select2>
      </td>
      <td>
        <span class="input" v-show="isModify === false">{{data.selectedData.rc_pk}}</span>
        <select2 :options="data.options.resourceCategory" v-model="data.selectedData.rc_pk" v-show="isModify === true">
        </select2>
      </td>
      <td>
        <span class="input" v-show="isModify === false">{{data.selectedData.rt_pk}}</span>
        <select2 :options="data.options.resourceType" v-model="data.selectedData.rt_pk" v-show="isModify === true">
        </select2>
      </td>
      <td>
        <span class="input" v-show="isModify === false">{{data.selectedData.rs_pk}}</span>
        <select2 :options="data.options.resource" v-model="data.selectedData.rs_pk" v-show="isModify === true">
        </select2>
      </td>
      <td>
        <input type="text" placeholder="면적 입력" class="input" v-model="data.selectedData.input_value"/>
      </td>
      <td>
        <input type="text" placeholder="물량 입력" class="input" v-model="data.selectedData.resource_amount"/>
      </td>
      <td>
        100,000
      </td>
      <td>
        100,000
      </td>
    </tr>
  </tbody>
</template>

<script>
  import select2 from '../components/select2Component'
  import EventBus from '../../services/eventBus'
  import _ from 'underscore'

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
        isModify: true
      }
    },
    created () {
      EventBus.$on('updateModifyView', (data) => {
        this.dataGroup.push(data)
      })
    },
    methods: {
      getSelectedText (selectList, id) {
        console.log(selectList)
        return _.find(selectList, (item) => {
          return item.id === id
        })
      }
    }
  }
</script>

<style scoped>

</style>
