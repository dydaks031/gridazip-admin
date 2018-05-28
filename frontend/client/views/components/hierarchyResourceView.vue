<template>
  <div class="column">
    <draggable v-model="model.data" @end="updateView">
      <transition-group>
        <div v-for="data in model.data" @dblclick.stop="changedEditView(data)" @click.stop="itemClickEvent(data)" :class="{active: data.isSelected}" :key="data[keyList.id]">
          <span v-show="data.is_modify !== true">{{data[keyList.name]}}</span>
          <input type="text" v-model="data[keyList.name]" v-show="data.is_modify === true" @keypress.enter.stop="modifyData(data)" />
          <button class="button" v-show="data.is_modify === true" @click="deleteData(data)">삭제</button>
          <button class="button" v-show="data.is_modify === true" @click="modifyData(data)">수정</button>
        </div>
      </transition-group>
    </draggable>
    <p v-show="model.isEnableAddItem">
      <span @click="addNewItems" v-show="!isShowEditView">+</span>
      <input type="text" v-model="newData" v-show="isShowEditView" @keypress.enter.stop="submitNewItems" @input="newItemInput"/>
      <button class="button" v-show="isShowEditView" @click="hideEditView">취소</button>
    </p>
  </div>
</template>

<script>
  import _ from 'underscore'
  import draggable from 'vuedraggable'
  import EventBus from '../../services/eventBus'
  import utils from '../../services/utils'

  export default {
    name: 'hierarchy-resource-view',
    components: {
      draggable
    },
    props: {
      model: {
        type: Object
      }
    },
    data () {
      return {
        isEnableCallApi: false,
        newData: '',
        isShowEditView: false,
        parentData: {}
      }
    },
    mounted () {
      this.keyList = this.model.keyList
      if (this.model.parentId === null) {
        this.loadData()
      }
    },
    methods: {
      changedEditView (data) {
        data.is_modify = !data.is_modify
      },
      itemClickEvent (data) {
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
        console.log(api)
        if (!api) {
          console.error('API IS NOT DEFINED')
          return false
        }
        const params = utils.getQueryString(data)
        this.parentData = data

        this.$http.get(`${api}?${params}`, data).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          const dataList = response.data.data
          this.model.data = dataList[this.keyList.list]
          this.model.isEnableAddItem = true
          this.$forceUpdate()
        }).catch((error) => {
          console.error(error)
        })
      },
      addNewItems () {
        if (this.model.isDetailEdit) {
          this.$emit('newDetailItem', this.model)
        } else {
          this.newData = ''
          this.isShowEditView = true
        }
      },
      submitNewItems () {
        console.log('createItem')
        this.$nextTick(() => {
          this.$emit('createItem', {
            model: this.model,
            data: this.newData,
            parentId: this.parentData
          })
        })
      },
      hideEditView () {
        this.isShowEditView = !this.isShowEditView
        // this.$forceUpdate()
        console.log(this)
      },
      newItemInput (e) {
        this.newData = e.target.value
      },
      deleteData (item) {
        const data = {}
        const keyList = this.model.keyList
        data[keyList.id] = item[keyList.id]
        this.$nextTick(() => {
          this.$emit('deleteItem', {
            model: this.model,
            data: data,
            parentId: this.parentData
          })
        })
      },
      modifyData (item) {
        this.$nextTick(() => {
          this.$emit('modifyItem', {
            model: this.model,
            data: item,
            parentId: this.parentData
          })
        })
      },
      updateView () {
        this.$forceUpdate()

        const api = this.model.api
        console.log(api)
        if (!api) {
          console.error('API IS NOT DEFINED')
          return false
        }
        const param = {}
        param[this.model.keyList.list] = this.model.data
        this.$http.put(`${api}/order`, param).then((response) => {
          if (response.data.code !== 200) {
            return
          }
          console.log(response)
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
        const keyList = options.keyList || {}
        this.$forceUpdate()
        if (this.model.id === id) {
          this.isShowEditView = false
          const sendData = {}
          // send to parent's pk
          const keyCount = Object.keys(keyList)
          if (keyCount.length !== 0) {
            sendData[keyList.id] = data[keyList.id]
          }
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
