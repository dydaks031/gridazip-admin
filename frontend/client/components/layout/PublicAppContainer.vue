<template>
  <div class="container is-fluid is-marginless app-content">
    <levelbar></levelbar>
    <transition
      mode="out-in"
      enter-active-class="fadeIn"
      leave-active-class="fadeOut"
      appear>
      <router-view class="animated"></router-view>
    </transition>
  </div>
</template>

<script>
  import Levelbar from './Levelbar'
  export default {
    name: 'public-check-container',
    components: {
      Levelbar
    }
  }
</script>

<style>

</style>
