<template>
  <div>
    <nprogress-container></nprogress-container>
    <div class="container is-fluid is-marginless app-content">
      <transition
        mode="out-in"
        enter-active-class="fadeIn"
        leave-active-class="fadeOut"
        appear>
        <router-view class="animated"></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
  import NprogressContainer from 'vue-nprogress/src/NprogressContainer'
  export default {
    name: 'public-check-container',
    components: {
      NprogressContainer
    }
  }
</script>

<style scoped>
  .app-content {
    padding: 0
  }
</style>
