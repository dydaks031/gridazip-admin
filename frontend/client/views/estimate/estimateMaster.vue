<template>
  <div>
    <div class="tile is-ancestor">
      <estimate-select v-on:registerData="updateModifyView"/>
    </div>
  </div>
</template>

<script>
  import EstimateSelect from './estimateSelect'

  export default {
    components: {EstimateSelect},
    name: 'estimateMaster',
    methods: {
      updateModifyView () {
      }
    }
  }
</script>

<style scoped>

</style>
