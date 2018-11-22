<template>
  <footer class="footer">
    <div class="container">
      <div class="content has-text-centered">
        Copyright(c) 2018 by (주) {{getCompanyName()}}<br />All Page content is property of (주) {{getCompanyName()}}
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  data () {
    return this.$store.state.pkg
  },
  methods: {
    getCompanyName () {
      return window.location.host.indexOf('irudasolution') < 0 ? '그리다집' : '이루다솔루션'
    }
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
