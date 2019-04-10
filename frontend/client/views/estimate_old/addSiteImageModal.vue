<template>
  <modal name="addSiteImageModal" :classes="['add-site-image-view']" :width="modalWidth" :height="'auto'" @before-close="beforeClose" @before-open="beforeOpen">
    <div class="add-site-image-modal">
      <div class="modal-card-head">
        <h1 class="modal-card-title">현장사진 등록</h1>
        <button class="delete is-pulled-right" @click="$modal.hide('addSiteImageModal')"></button>
      </div>
      <div class="modal-card-body">
        <div class="partner-wrapper">
          <div class="control">
            <span class="input-group" v-for="(siteImage, index) in siteImageList">
              <img :src=siteImage.si_url v-on:click="callFileUpload('file_upload_' + index)" class="site-image"/>
              <button class="button delete-btn" @click="deletedImage(index)">삭제</button>
              <input type="file" :name='"portfolio_after[" + index + "]"' placeholder="After" style="display:none;" :ref='"file_upload_" + index' v-on:change="onFileChanged($event, index)" accept="image/*,.jpg,.gif,.png,.jpeg"/>
              <input type="text" class="input" v-model="siteImage.si_description" placeholder="설명 입력" />
            </span>
            <span class="input-group">
              <button v-on:click="callFileUpload('file_upload_new')">신규 이미지 업로드</button>
              <input type="file" name="new_file" placeholder="new File" style="display:none;" :ref='"file_upload_new"' v-on:change="onFileChanged($event, 'new')" multiple accept="image/*,.jpg,.gif,.png,.jpeg"/>
            </span>
          </div>
        </div>
        <button class="button is-info" @click="uploadSiteImages">등록</button>
      </div>
    </div>
  </modal>
</template>

<script>
  import FormData from 'form-data'
  import Notification from 'vue-bulma-notification'
  import Vue from 'vue'
  import mixin from '../../services/mixin'

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

  const fileUploadApi = '/api/file/upload'
  const queryApi = '/api/contract'

  export default {
    name: 'add-site-image-modal',
    mixins: [mixin],
    props: {
      id: String,
      beforeClose: Function
    },
    data () {
      return {
        siteImageList: [],
        newDescription: '',
        modalWidth: 650
      }
    },
    methods: {
      callFileUpload (index) {
        const currentTarget = this.$refs[index]
        if (currentTarget.length > 0) {
          currentTarget[0].click()
        } else {
          currentTarget.click()
        }
      },
      onFileChanged (event, index) {
        const files = event.target.files
        console.log(files)
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData()
          formData.append('file_upload_path', 'portfolio')
          formData.append('filedata', files[i])

          this.$http.post(fileUploadApi, formData)
            .then((response) => {
              var responseData = response.data

              if (responseData.code === 200) {
                const imageData = responseData.data
                if (index === 'new') {
                  this.siteImageList.push({
                    si_description: '',
                    si_url: imageData.value
                  })
                } else {
                  this.siteImageList[index] = {
                    si_description: '',
                    si_url: imageData.value
                  }
                }

                this.$forceUpdate()
              }
            })
            .catch((error) => {
              console.error(error)
            })
        }
      },
      deletedImage (index) {
        this.siteImageList.splice(index, 1)
      },
      uploadSiteImages () {
        this.$http.post(`${queryApi}/${this.id}/image`, {
          si_image_list: this.siteImageList
        })
        .then((response) => {
          if (response.data.code !== 200) {
            openNotification({
              message: '등록 도중 이상이 발생하였습니다.',
              type: 'danger',
              duration: 1500
            })
            return false
          }
          openNotification({
            message: '등록되었습니다.',
            type: 'success',
            duration: 1500
          })

          this.siteImageList = []
          this.newDescription = ''

          this.$modal.hide('addSiteImageModal')
        })
        .catch((e) => {
          console.log(e)
        })
      },
      beforeOpen () {
        if (this.isMobile()) {
          this.modalWidth = '90%'
        } else {
          this.modalWidth = 650
        }
        console.log(this.modalWidth)
      }
    },
    mounted () {
    },
    created () {
      if (this.isMobile()) {
        this.modalWidth = '90%'
      } else {
        this.modalWidth = 650
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
  .site-image {
    width:250px;
  }
</style>

<style lang="scss">
  .add-site-image-view {
    max-width: 90%;
    margin: 0 25%;
    left: 0 !important;
  }
</style>
