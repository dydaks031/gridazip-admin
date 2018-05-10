<template xmlns="http://www.w3.org/1999/html">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <h4 class="title">협력업체 상세</h4>
        <div class="block">
          <label class="label">업체명</label>
          <p class="control">
            <input type="text" class="input" v-model="data.pn_name" />
          </p>
          <label class="label">연락처</label>
          <p class="control">
            <input type="text" class="input" v-model="data.pn_tel_no" />
          </p>
          <label class="label">포트폴리오</label>
          <p class="control">
            <figure>
              <img :src="data.pn_price_list" v-on:click="downloadImages(data.pn_price_list)"/>
              <figcaption>클릭 시 다운로드 됩니다.</figcaption>
            </figure>
          </p>
          <label class="label">상세정보</label>
          <p class="control" v-html="replaceNewLineCharQna">
          </p>
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
  import moment from 'moment'
  import 'cleave.js/dist/addons/cleave-phone.kr.js'

  // const queryApi = '/api/partner'

  export default {
    name: 'partnerRegister',
    components: {
    },
    data () {
      return {
        data: {},
        imageList: [],
        id: '',
        moment
      }
    },
    computed: {
      replaceNewLineCharQna () {
        if (!this.data.pn_qna) {
          return '내용 없음'
        }

        return this.data.pn_qna.replace(/\n/gi, '<br />')
      }
    },
    mounted () {

    },
    methods: {
      downloadImages (url) {
        window.location.href = url
      }
    }
  }
</script>

<style scoped>

  img{
    width:300px;
  }
</style>
