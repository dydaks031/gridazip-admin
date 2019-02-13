<template xmlns="http://www.w3.org/1999/html">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <h4 class="title">포트폴리오 상세</h4>
        <div class="block">
          <label class="label">제목</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pf_title" />
          </p>
          <label class="label">주소</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pf_address" />
          </p>
          <label class="label">스타일</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pf_style" />
          </p>
          <label class="label">평수</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pf_size" />
          </p>
          <label class="label">예산</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pf_price" />
          </p>
          <label class="label">설명</label>
          <p class="control">
            <textarea class="textarea" v-model="data.pf_description"></textarea>
          </p>
          <label class="label">테스트 여부(Y로 입력하실 경우 업로드는 되지만 사용자에게 보이지 않습니다.)</label>
          <p class="control">
            <label class="radio">
              <input type="radio" value="1" name="pf_is_dev" v-model="data.pf_is_dev" />
              Y
            </label>
            <label class="radio">
              <input type="radio" value="0"  name="pf_is_dev" v-model="data.pf_is_dev" />
              N
            </label>
          </p>
          <label class="label">이미지 등록</label>
          <div class="control">
            <span class="input-group" v-for="(image, index) in imageList">
              <img :src=image v-on:click="callFileUpload('file_upload_' + index)" class="portfolio-image"/>
              <button class="button delete-btn" @click="deletedImage(index)">삭제</button>
              <input type="file" :name='"portfolio_after[" + index + "]"' placeholder="After" style="display:none;" :ref='"file_upload_" + index' v-on:change="onFileChanged($event, index)" />
            </span>
            <span class="input-group">
              <button v-on:click="callFileUpload('file_upload_new')">신규 이미지 업로드</button>
              <input type="file" name="new_file" placeholder="new File" style="display:none;" :ref='"file_upload_new"' v-on:change="onFileChanged($event, 'new')" />
            </span>
          </div>
          <p class="control">
            <button class="button is-primary" v-on:click="submitData">Submit</button>
            <button class="button is-link">Cancel</button>
          </p>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
  import Datepicker from 'vue-bulma-datepicker'
  import moment from 'moment'
  import Cleave from 'vue-cleave'
  import FormData from 'form-data'
  import Vue from 'vue'
  import _ from 'underscore'
  import 'cleave.js/dist/addons/cleave-phone.kr.js'
  import Notification from 'vue-bulma-notification'

  const queryApi = '/api/portfolio'
  const submitApi = '/api/portfolio'
  const fileUploadApi = '/api/file/upload'

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

  export default {
    name: 'portfolioDetail',
    components: {
      Datepicker,
      Cleave
    },
    data () {
      return {
        data: {},
        imageList: [],
        id: '',
        moment
      }
    },
    mounted () {
      this.id = this.$route.params.id
      if (!this.id) {
        this.$router.back()
      }
      this.loadDetail(this.id)
    },
    methods: {
      loadDetail (id) {
        this.$http.get(`${queryApi}/${id}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            this.data = response.data.data.data
            this.imageList = _.pluck(response.data.data.images, 'pi_after')
          }).catch((error) => {
            console.error(error)
          })
      },
      callFileUpload (index) {
        const currentTarget = this.$refs[index]
        if (currentTarget.length > 0) {
          currentTarget[0].click()
        } else {
          currentTarget.click()
        }
      },
      onFileChanged (event, index) {
        const formData = new FormData()
        formData.append('file_upload_path', 'portfolio')
        formData.append('filedata', event.target.files[0])

        this.$http.post(fileUploadApi, formData)
          .then((response) => {
            // if ()
            var responseData = response.data

            if (responseData.code === 200) {
              const imageData = responseData.data
              if (index === 'new') {
                index = this.imageList.length
              }

              this.imageList[index] = imageData.value

              Vue.set(this.imageList, index, imageData.value)
            }
          })
          .catch((error) => {
            console.error(error)
          })
      },
      deletedImage (index) {
        this.imageList.splice(index, 1)
      },
      validate () {
        return true
      },
      submitData () {
        if (this.validate()) {
          this.data.portfolio_image_list = this.imageList
          this.$http.put(`${submitApi}/${this.id}`, this.data)
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }

              openNotification({
                message: '포트폴리오 수정이 완료되었습니다.',
                type: 'success',
                duration: 2500
              })
              this.$router.back()
              // this.data = response.data.data.data
            }).catch((error) => {
              console.error(error)
            })
        }
      }
    }
  }
</script>

<style scoped>
  .input-group {
    display: block;
    text-align: center;
    position: relative;
  }

  .input-group img{
    width:300px;
  }
</style>
