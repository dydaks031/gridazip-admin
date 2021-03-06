import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueAuth from '@websanova/vue-auth'
import NProgress from 'vue-nprogress'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'
import * as filters from './filters'
import { TOGGLE_SIDEBAR } from './store/mutation-types'
import 'expose-loader?$!expose-loader?jQuery!jquery'
import Vuelidate from 'vuelidate'
import vmodal from 'vue-js-modal'
import VueScrollTo from 'vue-scrollto'

Vue.router = router
Vue.use(VueAxios, axios)
Vue.use(Vuelidate)
Vue.use(vmodal)
Vue.use(VueScrollTo, {
  container: 'html',
  duration: 500,
  easing: 'ease',
  offset: 0,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
})
Vue.use(VueAuth, {
  auth: {
    request: function (req, token) {
      this.options.http._setHeaders.call(this, req, {Authorization: 'Bearer ' + token})
    },
    response: function (res) {
      // Get Token from response body
      return res.data.token
    }
  },
  authRedirect: { path: '/private/login' },
  http: require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
  router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
  loginData: { url: '/api/authentication/login', fetchUser: true },
  fetchData: { url: '/api/authentication/user', method: 'GET' },
  refreshData: { enabled: false }
})

Vue.use(NProgress)

// Enable devtools
Vue.config.devtools = true

sync(store, router)

const nprogress = new NProgress({ parent: '.nprogress-container' })

const { state } = store

router.beforeEach((route, redirect, next) => {
  if (state.app.device.isMobile && state.app.sidebar.opened) {
    store.commit(TOGGLE_SIDEBAR, {
      opened: false
    })
  }
  next()
})

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

const app = new Vue({
  router,
  store,
  nprogress,
  ...App
})

export { app, router, store }
