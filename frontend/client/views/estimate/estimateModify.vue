<template>
  <tbody>
    <tr v-for="data in dataGroup">
      <td>
        <select2 :options="data.options.constructionPlace" v-model="data.selectedData.constructionPlace">
        </select2>
      </td>
      <td>
        <input type="text" class="input" placeholder="상세위치" v-model="data.selectedData.constructionDetailPlace" />
      </td>
      <td>
        <select2 :options="data.options.construction" v-model="data.selectedData.construction" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.constructionProcess" v-model="data.selectedData.constructionProcess" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.constructionProcessDetail" v-model="data.selectedData.constructionProcessDetail" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.resourceCategory" v-model="data.selectedData.resourceCategory" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.resourceType" v-model="data.selectedData.resourceType" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.resourceUnit" v-model="data.selectedData.resourceUnit" >
        </select2>
      </td>
      <td>
        <select2 :options="data.options.resource" v-model="data.selectedData.resource" >
        </select2>
      </td>
      <td>
        <input type="text" placeholder="면적 입력" class="input" v-model="data.selectedData.size"/>
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
