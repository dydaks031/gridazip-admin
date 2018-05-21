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
      /**
       * recursive function
       * @param model model to removed
       * @param target selected element's one depth child
       * @param parent selected element
       *
       */
      removeChildData (model, target, parent) {
        let currentId = model.id
        let child
        child = _.filter(this.curData, (item) => {
          return item.parentId === currentId
        })

        // has child element in parent element
        if (child.length > 0) {
          for (let i = 0; i < child.length; i += 1) {
            // haven't data property when initialize component
            if (!child[i].hasOwnProperty('data') || !child[i].data) {
              child[i].data = []
            }
            // remove child data
            child[i].data.length = 0
            const isReloadItem = target.find((item) => { return item.id === child[i].id })

            // if child element need api request (selected element's one depth child)
            if (typeof isReloadItem === 'object') {
              // call to child's method
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
