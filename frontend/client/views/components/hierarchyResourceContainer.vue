<template>
  <div>
    <div class="columns" >
      <hierarchy-resource-view v-for="tree in curData" :model="tree" :key="tree.id" v-on:changed-view="changedSelectedData" v-on:selectedView="changedSelectedView" />
    </div>
  </div>
</template>

<script>
  import HierarchyResourceView from './hierarchyResourceView'
  import META_LODING_CONFIG from '../../config/meta-loading-config'
  import _ from 'underscore'
  import deepClone from '../../services/deepClone'
  import EventBus from '../../services/eventBus'

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
        const curDepthTarget = _.filter(this.curData, (item) => {
          return item.parentId === model.id
        })
        this.removeChildData(model, curDepthTarget, model)
      },
      removeChildData (model, target, parent) {
        let currentId = model.id
        let child
        child = _.filter(this.curData, (item) => {
          return item.parentId === currentId
        })
        if (child.length > 0) {
          for (let i = 0; i < child.length; i += 1) {
            if (!child[i].hasOwnProperty('data') || !child[i].data) {
              child[i].data = []
            }
            child[i].data.length = 0
            const isReloadItem = target.find((item) => { return item.id === child[i].id })
            // reload 할 대상인 경우
            if (typeof isReloadItem === 'object') {
              EventBus.$emit('reloadView', {
                id: isReloadItem.id,
                data: _.find(parent.data, (_item) => {
                  return _item.isSelected
                }),
                keyList: parent.keyList
              })
            }
            this.removeChildData(child[i], target, parent)
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
