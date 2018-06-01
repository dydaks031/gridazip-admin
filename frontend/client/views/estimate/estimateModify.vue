<template>
  <tbody>
    <tr v-for="data in dataGroup">
      <td>
        <select2 :options="data.options.constructionPlace" v-model="data.selectedData.place_pk">
        </select2>
      </td>
      <td>
        <input type="text" class="input" placeholder="상세위치" v-model="data.selectedData.detail_place" />
      </td>
      <td>
        <select2 :options="data.options.construction" v-model="data.selectedData.ct_pk" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.constructionProcess" v-model="data.selectedData.cp_pk" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.constructionProcessDetail" v-model="data.selectedData.cpd_pk" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.resourceCategory" v-model="data.selectedData.rc_pk" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.resourceType" v-model="data.selectedData.rt_pk" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.resource" v-model="data.selectedData.rs_pk" >
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
        dataGroup: []
      }
    },
    created () {
      EventBus.$on('updateModifyView', (data) => {
        this.dataGroup.push(data)
      })
    }
  }
</script>

<style scoped>

</style>
