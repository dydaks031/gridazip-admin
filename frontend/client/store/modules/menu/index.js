import * as types from '../../mutation-types'
import lazyLoading from './lazyLoading'
// show: meta.label -> name
// name: component name
// meta.label: display label

const state = {
  items: [
    {
      name: 'Dashboard',
      path: '/private/dashboard',
      meta: {
        icon: 'fa-tachometer',
        link: 'dashboard/index.vue',
        auth: true
      },
      component: lazyLoading('dashboard', true)
    },
    {
      name: '견적상담요청 목록',
      path: '/private/request-list',
      meta: {
        icon: 'fa-rocket',
        link: 'requestList/index.vue',
        auth: true
      },
      component: lazyLoading('requestList', true)
    },
    {
      name: '진행중인계약 목록',
      path: '/private/estimate',
      meta: {
        icon: 'fa-rocket',
        link: 'estimate/index.vue',
        auth: true
      },
      component: lazyLoading('estimate', true)
    },
    {
      name: '결재내역 조회',
      path: '/private/receipt',
      meta: {
        icon: 'fa-rocket',
        link: 'contractReceipt/index.vue',
        auth: true
      },
      component: lazyLoading('contractReceipt', true)
    },
    {
      name: '협력업체 신청 목록',
      path: '/private/partner-list',
      meta: {
        icon: 'fa-rocket',
        link: 'partners/index.vue',
        auth: true
      },
      component: lazyLoading('partners', true)
    },
    {
      name: '홈페이지 관리',
      meta: {
        icon: 'fa-table',
        expanded: false
      },
      children: [
        {
          name: '포트폴리오 관리',
          path: '/private/portfolio',
          meta: {
            icon: 'fa-rocket',
            link: 'portfolio/index.vue',
            auth: true
          },
          component: lazyLoading('portfolio', true)
        },
        {
          name: '매거진 관리',
          path: '/private/magazine',
          meta: {
            icon: 'fa-rocket',
            link: 'magazine/index.vue',
            auth: true
          },
          component: lazyLoading('magazine', true)
        }
        // ,
        // {
        //   name: '회사연혁 관리',
        //   path: '/private/manage-constructor',
        //   meta: {
        //     icon: 'fa-rocket',
        //     link: 'manageConstructor/index.vue',
        //     auth: true
        //   },
        //   component: lazyLoading('manageConstructor', true)
        // }
      ]
    },
    {
      name: '견적보조시스템',
      meta: {
        icon: 'fa-table',
        expanded: false
      },
      children: [
        // {
        //   name: '진행계약 목록',
        //   path: '/private/estimate_old',
        //   meta: {
        //     icon: 'fa-rocket',
        //     link: 'estimate_old/index.vue',
        //     auth: true
        //   },
        //   component: lazyLoading('estimate_old', true)
        // },
        {
          name: '메타데이터 등록',
          path: '/private/meta-register',
          meta: {
            icon: 'fa-rocket',
            link: 'meta-register/index.vue',
            auth: true
          },
          component: lazyLoading('meta-register', true)
        },
        {
          name: '기술자 및 거래처',
          path: '/private/manage-constructor',
          meta: {
            icon: 'fa-rocket',
            link: 'manageConstructor/index.vue',
            auth: true
          },
          component: lazyLoading('manageConstructor', true)
        }
      ]
    }
  ]
}

const mutations = {
  [types.EXPAND_MENU] (state, menuItem) {
    if (menuItem.index > -1) {
      if (state.items[menuItem.index] && state.items[menuItem.index].meta) {
        state.items[menuItem.index].meta.expanded = menuItem.expanded
      }
    } else if (menuItem.item && 'expanded' in menuItem.item.meta) {
      menuItem.item.meta.expanded = menuItem.expanded
    }
  }
}

export default {
  state,
  mutations
}
