<template>
  <div class="column">
    <p v-for="data in model.data" @dblclick="changedView(data)" @click="changedColor(data)" :class="{active: data.isSelected}">
      <span v-show="data.is_modify !== true">{{data.name}}</span>
      <input type="text" v-model="data.name" v-show="data.is_modify === true"/>
    </p>
  </div>
</template>

<script>
  import _ from 'underscore'

  export default {
    name: 'hierarchy-resource-view',
    props: {
      model: {
        type: Object
      }
    },
    data () {
      return {
        isEnableCallApi: false,
      }
    },
    mounted () {
      // TODO: call Api and isEnableCallApi to false
    },
    methods: {
      changedView (data) {
        data.is_modify = !data.is_modify
        this.$forceUpdate()
      },
      changedColor (data) {
        this.model.data = _.map(this.model.data, (item) => {
          item.isSelected = false
          return item
        })
        data.isSelected = true
        this.$emit('selectedView', this.model)
      }
    },
    watch: {
      model: {
        handler (val) {
          if (this.model.data.length === 0) {
            this.isEnableCallApi = true
          }
        },
        deep: true
      },
      isEnableCallApi () {
        // TODO: API Call Logic
        console.log(this.isEnableCallApi)
      }
    }
  }
</script>

<style scoped>
  p.active {
    background-color: grey;
  }
</style>
