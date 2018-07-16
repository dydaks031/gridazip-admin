<template>
  <footer class="footer">
    <div class="container">
      <div class="content has-text-centered">
        Copyright(c) 2018 by (주) 그리다집.<br />All Page content is property of (주) 그리다집
      </div>
    </div>
  </footer>
</template>

<script>
export default {

  data () {
    return this.$store.state.pkg
  }

}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/mixins';

.footer {
  z-index: -1;
  position: relative;
  margin-left: 180px;

  @include mobile() {
    margin-left: 0;
  }

  .social a {
    border-bottom: none !important;
  }

  .fa.fa-heart {
    color: red;
  }
}
</style>
