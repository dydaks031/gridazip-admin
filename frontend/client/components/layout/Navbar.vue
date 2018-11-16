<template>
  <section class="hero is-bold app-navbar animated" :class="{ slideInDown: show, slideOutDown: !show, none: forceHide }">
    <div class="hero-head">
      <nav class="nav">
        <div class="nav-left">
          <a class="nav-item is-hidden-tablet" @click="toggleSidebar({opened: !sidebar.opened})">
            <i class="fa fa-bars" aria-hidden="true" v-show="!sidebar.hidden"></i>
          </a>
        </div>
        <div class="nav-right is-flex">
          <router-link v-if="!$auth.check()" to="/login" class="nav-item">Login</router-link>
          <a v-if="$auth.check()" @click="logout" class="nav-item">Logout</a>
        </div>
      </nav>
    </div>
  </section>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import EventBus from '../../services/eventBus'
import { mapGetters, mapActions } from 'vuex'

export default {

  components: {
    Tooltip
  },

  props: {
    show: Boolean
  },

  computed: mapGetters({
    pkginfo: 'pkg',
    sidebar: 'sidebar'
  }),

  data () {
    return {
      forceHide: false
    }
  },
  methods: {
    ...mapActions([
      'toggleSidebar'
    ]),
    logout () {
      this.$auth.logout({
        redirect: '/private/login',
        makeRequest: false,
        // params: {},
        success: function () { },
        error: function () { }
        // etc...
      })
    }
  },
  mounted () {
    EventBus.$on('togglePrintMode', () => {
      this.forceHide = !this.forceHide
    })
  }
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/variables';

.app-navbar {
  position: fixed;
  min-width: 100%;
  z-index: 1024;
  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);

  .container {
    margin: auto 10px;
  }

  .nav-right {
    align-items: stretch;
    align-items: stretch;
    flex: 1;
    justify-content: flex-end;
    overflow: hidden;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.hero-brand {
  .vue {
    margin-left: 10px;
    color: #36AC70;
  }
  .admin {
    color: #28374B;
  }
}
.none {
  display:none
}
</style>
