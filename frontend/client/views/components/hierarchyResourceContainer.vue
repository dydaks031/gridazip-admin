<template>
  <div>
    <div class="columns" >
      <hierarchy-resource-view v-for="tree in curData" :model="tree" :key="tree.id" v-on:changed-view="changedSelectedData" v-on:selectedView="changedSelectedView"/>
    </div>
  </div>
</template>

<script>
  import HierarchyResourceView from './hierarchyResourceView'
  import META_LODING_CONFIG from '../../config/meta-loading-config'
  import _ from 'underscore'
  import deepClone from '../../services/deepClone'

  export default {
    name: 'hierarchy-resource-container',
    components: {
      HierarchyResourceView
    },
    data () {
      return {
        curData: [],
        treeCount: 0
      }
    },
    props: ['type'],
    watch: {

    },
    methods: {
      changedSelectedData (changed, type) {
        console.log(changed, type)
      },
      changedSelectedView (model) {
        console.log(model)
        // model.isSelected = !model.isSelected
        this.treeCount = 0
        this.removeChildData(model)
      },
      removeChildData (model) {
        let currentId = model.id
        let child
        child = _.filter(this.curData, (item) => {
          return item.parentId === currentId
        })
        if (child.length > 0) {
          for (let i = 0; i < child.length; i += 1) {
            console.log(child[i].id)
            child[i].data = []
            this.removeChildData(child[i])
          }
        }
      }
    },
    mounted () {
      this.curData = deepClone(META_LODING_CONFIG.order[this.type])
    }
  }
</script>

<style scoped>

</style>
