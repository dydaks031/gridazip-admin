import Vue from 'vue'
import Router from 'vue-router'
import menuModule from 'vuex-store/modules/menu'
Vue.use(Router)

export default new Router({
  // mode: 'hash', // Demo is living in GitHub.io, so required!
  mode: 'history',
  linkActiveClass: 'is-active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      name: 'Home',
      path: '/',
      component: require('../views/Home'),
      meta: {
        auth: true
      }
    },
    {
      name: 'Login',
      path: '/login',
      component: require('../views/auth/Login')
    },
    {
      name: '상담요청내역 상세',
      path: '/request-list/:id',
      component: require('../views/requestList/detail'),
      meta: {
        auth: true
      }
    },
    {
      name: '포트폴리오 상세',
      path: '/portfolio/:id',
      component: require('../views/portfolio/detail'),
      meta: {
        auth: true
      }
    },
    ...generateRoutesFromMenu(menuModule.state.items),
    {
      path: '*',
      redirect: '/'
    }
  ]
})

// Menu should have 2 levels.
function generateRoutesFromMenu (menu = [], routes = []) {
  for (let i = 0, l = menu.length; i < l; i++) {
    let item = menu[i]
    if (item.path) {
      routes.push(item)
    }
    if (!item.component) {
      generateRoutesFromMenu(item.children, routes)
    }
  }
  return routes
}
