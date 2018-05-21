<template>
  <div class="column">
    <p v-for="data in model.data" @dblclick="changedView(data)" @click="changedColor(data)" :class="{active: data.isSelected}">
      <span v-show="data.is_modify !== true">{{data[keyList.name]}}</span>
      <input type="text" v-model="data[keyList.name]" v-show="data.is_modify === true"/>
    </p>
  </div>
</template>

<script>
  import _ from 'underscore'
  import EventBus from '../../services/eventBus'
  import utils from '../../services/utils'

  export default {
    name: 'hierarchy-resource-view',
    props: {
      model: {
        type: Object
      }
    },
    data () {
      return {
        isEnableCallApi: false
      }
    },
    mounted () {
      this.keyList = this.model.keyList

      if (this.model.parentId === null) {
        this.loadData()
      }
    },
    methods: {
      changedView (data) {
        data.is_modify = !data.is_modify
      },
      changedColor (data) {
        this.model.data = _.map(this.model.data, (item) => {
          item.isSelected = false
          return item
        })
        data.isSelected = true
        this.$forceUpdate()
        this.$emit('selectedView', this.model)
      },
      loadData (data = {}) {
        const api = this.model.api
        if (!api) {
          console.error('API IS NOT DEFINED')
          return false
        }
        const params = utils.getQueryString(data)

        this.$http.get(`${api}?${params}`, data).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data
          this.model.data = dataList[this.keyList.list]
          this.$forceUpdate()
        }).catch((error) => {
          console.error(error)
        })
      }
    },
    created () {
      EventBus.$on('reloadView', (options) => {
        // update target model id
        const id = options.id
        // parent's data
        const data = options.data
        // parent's object keyList
        const keyList = options.keyList
        this.$forceUpdate()
        if (this.model.id === id) {
          const sendData = {}
          // send to parent's pk
          sendData[keyList.id] = data[keyList.id]
          this.loadData(sendData)
        }
      })
    }
  }
</script>

<style scoped>
  p.active {
    background-color: grey;
  }
</style>
