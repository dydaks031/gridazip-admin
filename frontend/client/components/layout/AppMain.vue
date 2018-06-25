<template>
  <section class="app-main" :style="[hiddenSidebarStyle]" :class="{'full-width': isHideView}">
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
  </section>
</template>

<script>
import Levelbar from './Levelbar'
import { mapGetters } from 'vuex'
import EventBus from '../../services/eventBus'

export default {
  computed: {
    ...mapGetters({
      sidebar: 'sidebar'
    }),
    hiddenSidebarStyle () {
      return this.sidebar.hidden ? { 'margin-left': 0 } : null
    }
  },
  data () {
    return {
      isHideView: false
    }
  },
  mounted () {
    EventBus.$on('togglePrintMode', () => {
      this.isHideView = !this.isHideView
    })
  },
  components: {
    Levelbar
  }
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/variables';
@import '~bulma/sass/utilities/mixins';

.app-main {
  padding-top: 50px;
  margin-left: 180px;
  transform: translate3d(0, 0, 0);
  &.full-width {
    margin-left: 0
  }
  @include mobile() {
    margin-left: 0;
  }

}

.app-content {
  padding: 20px;
}
</style>
