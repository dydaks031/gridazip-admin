import * as types from '../../mutation-types'
import lazyLoading from './lazyLoading'
// show: meta.label -> name
// name: component name
// meta.label: display label

const state = {
  items: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      meta: {
        icon: 'fa-tachometer',
        link: 'dashboard/index.vue',
        auth: true
      },
      component: lazyLoading('dashboard', true)
    },
    {
      name: '상담요청조회',
      path: '/request-list',
      meta: {
        icon: 'fa-rocket',
        link: 'requestList/index.vue',
        auth: true
      },
      component: lazyLoading('requestList', true)
    },
    {
      name: '포트폴리오',
      path: '/portfolio',
      meta: {
        icon: 'fa-rocket',
        link: 'portfolio/index.vue',
        auth: true
      },
      component: lazyLoading('portfolio', true)
    },
    {
      name: '협력업체 신청 목록',
      path: '/partner-list',
      meta: {
        icon: 'fa-rocket',
        link: 'partners/index.vue',
        auth: true
      },
      component: lazyLoading('partners', true)
    },
    {
      name: '견적보조시스템',
      meta: {
        icon: 'fa-table',
        expanded: false
      },
      children: [
        {
          name: '진행계약 목록',
          path: '/estimate',
          meta: {
            icon: 'fa-rocket',
            link: 'estimate/index.vue',
            auth: true
          },
          component: lazyLoading('estimate', true)
        },
        {
          name: '메타데이터 등록',
          path: '/meta-register',
          meta: {
            icon: 'fa-rocket',
            link: 'meta-register/index.vue',
            auth: true
          },
          component: lazyLoading('meta-register', true)
        },
        {
          name: '기술자 및 거래처',
          path: '/manage-constructor',
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
