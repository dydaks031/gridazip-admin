<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  components: {
  }
}
</script>

<style lang="scss">
  // mobile
  @media screen and (max-width: 999px) {
    #privateApp {
      font-size: 12px;

      .app-content {
        padding: 10px;
      }
    }
  }
</style>
