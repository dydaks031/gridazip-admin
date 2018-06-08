<template>
  <div>
    <div class="columns" >
      <hierarchy-resource-view v-for="data in curData"
                               :model="data"
                               :key="data.id"
                               v-on:changed-view="changedSelectedData"
                               v-on:selectedView="changedSelectedView"
                               v-on:createItem="createItem"
                               v-on:deleteItem="deleteItem"
                               v-on:modifyItem="modifyItem"
                               v-on:newDetailItem="newDetailItem" />
      <resource-detail-view class="column is-half"
                            :selected-data="selectedData"
                            :selected-model="selectedModel"
                            :full-data="curData"
                            :type="type"
                            v-on:createItem="createItem"
                            v-on:modifyItem="modifyItem" />
    </div>
  </div>
</template>

<script>
  import HierarchyResourceView from './hierarchyResourceView'
  import ResourceDetailView from './resourceDetailView'
  import META_LODING_CONFIG from '../../config/meta-loading-config'
  import _ from 'underscore'
  import deepClone from '../../services/deepClone'
  import EventBus from '../../services/eventBus'

  export default {
    name: 'hierarchy-resource-container',
    components: {
      ResourceDetailView,
      HierarchyResourceView
    },
    data () {
      return {
        curData: [],
        selectedData: {},
        selectedModel: {}
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
        this.selectedModel = model
        this.selectedData = _.find(model.data, (item) => {
          return item.isSelected
        })
        this.removeChildData(model, curDepthTarget, model)
      },
      callApi (options, callback = () => {}) {
        const action = options.action
        const api = options.api || options.model.api
        const sendData = options.sendData

        this.$http[action](`${api}`, sendData).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          console.log(options.parentId)
          const parents = _.find(this.curData, (item) => {
            return item.id === options.model.parentId
          })
          const _data = {}
          let keyList = {}
          if (parents) {
            keyList = parents.keyList
            _data[keyList.id] = options.parentId[keyList.id]
          }
          EventBus.$emit('reloadView', {
            id: options.model.id,
            data: _data,
            keyList: keyList
          })
          callback()
        }).catch((error) => {
          console.error(error)
        })
      },
      newDetailItem (model) {
        this.selectedModel = model
        this.selectedData = {}
      },
      createItem (options, callback) {
        let data = {
          ...options.parentId
        }

        if (typeof options.data === 'object') {
          data = {
            ...options.parentId,
            ...options.data
          }
        } else {
          data[options.model.keyList.name] = options.data
        }
        this.selectedData = {}
        this.selectedModel = {}
        this.callApi({
          action: 'post',
          sendData: data,
          ...options
        }, callback)
      },
      deleteItem (options) {
        this.callApi({
          action: 'delete',
          api: `${options.model.api}/${options.data[options.model.keyList.id]}`,
          ...options
        })
      },
      modifyItem (options) {
        this.callApi({
          action: 'put',
          api: `${options.model.api}/${options.data[options.model.keyList.id]}`,
          sendData: options.data,
          ...options
        })
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
            child[i].isEnableAddItem = false
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
      this.curData = deepClone(META_LODING_CONFIG[this.type])
      // this.curData = META_LODING_CONFIG.order[this.type]
      console.log(this.curData)
    },
    created () {
      // EventBus.$on('createItem', )
    }
  }
</script>

<style scoped>

</style>
