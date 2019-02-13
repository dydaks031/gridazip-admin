<template xmlns="http://www.w3.org/1999/html">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <h4 class="title">매거진 미리보기</h4>
        <p class="control button-area">
          <button class="button is-primary is-pulled-right is-medium" id="modifyBtn" @click="modifyMagazine">수정</button>
        </p>
        <div class="wrapper">
          <div class="block subject" v-text="magazine.mg_subject">
          </div>
          <hr/>
          <div class="block content" v-html="magazine.mg_content">
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
  import Datepicker from 'vue-bulma-datepicker'
  import moment from 'moment'
  import router from '../../router'

  const queryApi = '/api/magazine'

  export default {
    name: 'magazineViewer',
    components: {
      Datepicker
    },
    data () {
      return {
        magazine: {},
        moment,
        id: ''
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
            console.log(response)
            if (response.data.code !== 200) {
              return
            }
            this.magazine = response.data.data.magazine
          }).catch((error) => {
            console.error(error)
          })
      },
      modifyMagazine () {
        router.push({
          path: `/private/magazine/modify/${this.id}`
        })
      }
    }
  }
</script>

<style scoped>
  .wrapper {
    padding-top: 5rem;
    width: 60%;
  }
  .subject {
    font-size: 1.5rem;
  }
</style>
