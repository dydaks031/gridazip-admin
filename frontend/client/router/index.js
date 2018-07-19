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
      path: '/private/',
      component: require('../components/layout/PrivateAppContainer'),
      children: [
        {
          name: 'Home',
          path: '/',
          component: require('../views/Home'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: 'Login',
          path: 'login',
          component: require('../views/auth/Login')
        },
        {
          name: '상담요청내역 상세',
          path: 'request-list/:id([0-9]+)',
          component: require('../views/requestList/detail'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '상담요청내용 등록',
          path: 'request-list/register',
          component: require('../views/requestList/register'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '포트폴리오 상세',
          path: 'portfolio/:id([0-9]+)',
          component: require('../views/portfolio/detail'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '포트폴리오 등록',
          path: 'portfolio/register',
          component: require('../views/portfolio/register'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '협력업체 상세',
          path: 'partner-list/:id([0-9]+)',
          component: require('../views/partners/detail'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '진행계약 상세',
          path: 'estimate/:id([0-9]+)',
          component: require('../views/estimate/detail'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '진행계약 등록',
          path: 'estimate/register',
          component: require('../views/estimate/register'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '상세견적서 등록',
          path: 'estimate/:id([0-9]+)/register/:es_pk([0-9]+)',
          component: require('../views/estimate/estimateRegister'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '상세견적서 신규 버전 추가',
          path: 'estimate/:id([0-9]+)/register/tabs',
          component: require('../views/estimate/estimateMaster'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '기술자 상세',
          path: 'manage-constructor/constructor/:id([0-9]+)',
          component: require('../views/manageConstructor/detail'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '거래처 상세',
          path: 'manage-constructor/correspondent/:id([0-9]+)',
          component: require('../views/manageConstructor/detail'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '기술자 등록',
          path: 'manage-constructor/constructor/register',
          component: require('../views/manageConstructor/register'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        {
          name: '거래처 등록',
          path: 'manage-constructor/correspondent/register',
          component: require('../views/manageConstructor/register'),
          meta: {
            auth: true,
            authRedirect: 'login'
          }
        },
        ...generateRoutesFromMenu(menuModule.state.items),
        {
          path: '*',
          redirect: '/private'
        }
      ]
    },
    {
      path: '/customer',
      redirect: '/customer/estimate',
      component: require('../components/layout/PublicAppContainer'),
      children: [
        {
          name: '견적서',
          path: 'estimate',
          component: require('../views/customer/estimate')
        },
        {
          path: '*',
          redirect: '/customer/estimate'
        }
      ]
    },
    {
      path: '*',
      redirect: '/private/login'
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
