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
      path: '/request-list/:id([0-9]+)',
      component: require('../views/requestList/detail'),
      meta: {
        auth: true
      }
    },
    {
      name: '상담요청내용 등록',
      path: '/request-list/register',
      component: require('../views/requestList/register'),
      meta: {
        auth: true
      }
    },
    {
      name: '포트폴리오 상세',
      path: '/portfolio/:id([0-9]+)',
      component: require('../views/portfolio/detail'),
      meta: {
        auth: true
      }
    },
    {
      name: '포트폴리오 등록',
      path: '/portfolio/register',
      component: require('../views/portfolio/register'),
      meta: {
        auth: true
      }
    },
    {
      name: '협력업체 상세',
      path: '/partner-list/:id([0-9]+)',
      component: require('../views/partners/detail'),
      meta: {
        auth: true
      }
    },
    {
      name: '진행계약 상세',
      path: '/estimate/:id([0-9]+)',
      component: require('../views/estimate/detail'),
      meta: {
        auth: true
      }
    },
    {
      name: '진행계약 등록',
      path: '/estimate/register',
      component: require('../views/estimate/register'),
      meta: {
        auth: true
      }
    },
    {
      name: '상세견적서 등록',
      path: '/estimate/:id([0-9]+)/register',
      component: require('../views/estimate/estimateRegister'),
      meta: {
        auth: true
      }
    },
    {
      name: '기술자 상세',
      path: '/manage-constructor/constructor/:id([0-9]+)',
      component: require('../views/manageConstructor/detail'),
      meta: {
        auth: true
      }
    },
    {
      name: '거래처 상세',
      path: '/manage-constructor/correspondent/:id([0-9]+)',
      component: require('../views/manageConstructor/detail'),
      meta: {
        auth: true
      }
    },
    {
      name: '기술자 등록',
      path: '/manage-constructor/constructor/register',
      component: require('../views/manageConstructor/register'),
      meta: {
        auth: true
      }
    },
    {
      name: '거래처 등록',
      path: '/manage-constructor/correspondent/register',
      component: require('../views/manageConstructor/register'),
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
