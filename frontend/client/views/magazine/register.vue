<template xmlns="http://www.w3.org/1999/html">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <h4 class="title">매거진 등록</h4>
        <p class="control button-area">
          <button class="button is-primary is-pulled-right is-medium" id="addBtn" @click="postMagazine">등록</button>
        </p>
        <div class="block">
          <label class="label">제목</label>
          <p class="control">
            <input class="input" type="text" v-model="formData.mg_subject" placeholder="제목을 입력하세요." />
          </p>
        </div>
        <div class="block">
          <label class="label">대표이미지</label>
          <span class="input-group">

            </span>
          <p class="control">
            <input type="file" name="mg_thumbnail" @change="onFileChanged($event)" />
          </p>
        </div>
        <div class="block">
          <vue-ckeditor
            v-model="formData.mg_content"
            :config="editorOptions" />
        </div>
      </article>
    </div>
  </div>
</template>

<script>
  import Cleave from 'vue-cleave'
  import VueCkeditor from 'vue-ckeditor2'
  import FormData from 'form-data'
  import Notification from 'vue-bulma-notification'
  import Vue from 'vue'

  const NotificationComponent = Vue.extend(Notification)
  // @TODO require Cleave library bug fixed
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

  const queryApi = '/api/magazine'
  const fileUploadApi = '/api/file/upload'
  export default {
    name: 'magazineRegister',
    components: {
      Cleave,
      VueCkeditor
    },
    data () {
      return {
        formData: {
          mg_subject: '',
          mg_content: '',
          mg_thumbnail: ''
        },
        editorOptions: {
          height: 400,
          extraPlugins: 'image2,uploadimage',
          filebrowserBrowseUrl: '/apps/ckfinder/3.4.4/ckfinder.html',
          filebrowserImageBrowseUrl: '/apps/ckfinder/3.4.4/ckfinder.html?type=Images',
          filebrowserUploadUrl: '/api/magazine/upload',
          filebrowserImageUploadUrl: '/api/magazine/upload',

          // Upload dropped or pasted images to the CKFinder connector (note that the response type is set to JSON).
          uploadUrl: '/api/magazine/upload'
        },
        id: ''
      }
    },
    mounted () {
      this.id = this.$route.params.id || ''
      if (this.id) {
        this.loadMagazine(this.id)
      }
    },
    methods: {
      loadMagazine (id) {
        this.$http.get(`${queryApi}/${id}`)
          .then(response => {
            console.log(response)
            if (response.data.code !== 200) {
              return
            }
            this.formData.mg_content = response.data.data.magazine.mg_content
            this.formData.mg_subject = response.data.data.magazine.mg_subject
            this.formData.mg_thumbnail = response.data.data.magazine.mg_thumbnail
          })
          .catch(error => {
            console.error(error)
          })
      },
      postMagazine () {
        if (!this.id) {
          this.$http.post(`${queryApi}`, this.formData)
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }
              this.openModalCard('매거진이 등록되었습니다.')
            })
            .catch(error => {
              console.error(error)
            })
        } else {
          this.$http.put(`${queryApi}/${this.id}`, this.formData)
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }
              this.openModalCard('매거진이 수정되었습니다.')
            })
            .catch(error => {
              console.error(error)
            })
        }
      },
      openModalCard (message) {
        openNotification({
          message: message,
          type: 'success',
          duration: 2500
        })
        this.$router.back()
      },
      onFileChanged (event) {
        const formData = new FormData()
        formData.append('file_upload_path', 'magazine')
        formData.append('filedata', event.target.files[0])

        this.$http.post(fileUploadApi, formData)
          .then((response) => {
            // if ()
            const responseData = response.data

            if (responseData.code === 200) {
              this.formData.mg_thumbnail = responseData.data.value
            }

            console.log(this.formData.mg_thumbnail)
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
  }
</script>

<style scoped>
  .button-area {
    height: 4rem;
  }
</style>
