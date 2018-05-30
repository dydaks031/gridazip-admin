<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(constructionType)" :class="{'is-active': openTab === constructionType}"><a class="subtitle">공사</a></li>
        <li @click="activeView(resourceType)" :class="{'is-active': openTab === resourceType}"><a class="subtitle">자재</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" v-show="openTab === constructionType">
          <hierarchy-resource-container :type="constructionType">
          </hierarchy-resource-container>
        </article>
        <article class="tile is-child box" v-show="openTab === resourceType">
          <hierarchy-resource-container :type="resourceType">
          </hierarchy-resource-container>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import PaginationVue from '../components/pagination'
  // import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import HierarchyResourceContainer from '../components/hierarchyResourceContainer'
  //
  // const NotificationComponent = Vue.extend(Notification)
  // const openNotification = (propsData = {
  //   title: '',
  //   message: '',
  //   type: '',
  //   direction: '',
  //   duration: 4500,
  //   container: '.notifications'
  // }) => {
  //   return new NotificationComponent({
  //     el: document.createElement('div'),
  //     propsData
  //   })
  // }

  export default {
    name: 'meta-register',
    components: {
      HierarchyResourceContainer,
      PaginationVue,
      Notification
    },
    data () {
      return {
        data: {},
        resourceType: 'resource',
        constructionType: 'construction',
        openTab: '',
        isLoading: false,
        moment
      }
    },
    methods: {
      activeView (type) {
        this.openTab = type
      }
    },
    mounted () {
      // this.loadData()
      this.openTab = this.constructionType
    }
  }
</script>

<style scoped>
  article {
    overflow: auto;
  }
  #addBtn {
    margin: 1rem 0;
  }
</style>
