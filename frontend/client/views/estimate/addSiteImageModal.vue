<template>
  <modal name="addSiteImageModal" height="auto" width="60%">
    <div class="add-site-image-modal">
      <div class="modal-card-head">
        <h1 class="modal-card-title">현장사진 등록</h1>
        <button class="delete is-pulled-right" @click="$modal.hide('addSiteImageModal')"></button>
      </div>
      <div class="modal-card-body">
        <div class="partner-wrapper">
          <textarea title="description" name="si_description" v-model="siteImage.si_description"></textarea>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
  import StarRating from 'vue-star-rating'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'

  const NotificationComponent = Vue.extend(Notification)

  const openNotification = (propsData = {
    title: '',
    message: '',
    type: '',
    direction: '',
    duration: 4500,
    container: '.notifications'
  }) => {
    return new NotificationComponent({
      el: document.createElement('div'),
      propsData
    })
  }

  const contractQueryApi = '/api/contract'
  export default {
    name: 'add-site-image-modal',
    components: {
      StarRating
    },
    props: {
      id: String,
      beforeClose: Function
    },
    data () {
      return {
        siteImage: {
          si_url: '',
          si_description: ''
        }
      }
    },
    methods: {
      addPartner (image) {
        console.log(`${contractQueryApi}/${this.id}/${this.type}`)
        this.$http.post(`${contractQueryApi}/${this.id}/image`, image)
          .then((response) => {
            console.log(response.data.data)
            if (response.data.code !== 200) {
              return false
            }
            openNotification({
              message: '등록 되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$modal.hide('addPartnersModal')
          })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .add-site-image-modal {
    border-radius: 1rem;
    .table {
      padding: 1rem;
    }
  }
  .v--modal-overlay {
    margin-left: -90px;
    width: calc(100% + 90px);
  }
  .partner-wrapper {
    overflow: auto;
    max-height: 350px;
  }
</style>
