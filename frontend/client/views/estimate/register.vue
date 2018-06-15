<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <div class="block">
          <label class="label">고객명</label>
          <div class="control">
            <input class="input" type="text" v-model="data.pc_name" :class="{'is-danger': $v.data.pc_name.$invalid }" />
            <p class="help is-danger" v-if="!$v.data.pc_name.required">고객명을 입력해 주십시오.</p>
          </div>
          <label class="label">연락처</label>
          <div class="control">
            <input class="input" type="text" v-model="data.pc_phone" :class="{'is-danger': $v.data.pc_phone.$invalid }" />
            <p class="help is-danger" v-if="!$v.data.pc_phone.required">전화번호를 입력해 주십시오.</p>
          </div>
          <label class="label">평수</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pc_size" />
          </p>
          <label class="label">주소</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pc_address_brief" />
          </p>
          <label class="label">상세 주소</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pc_address_detail" />
          </p>
          <label class="label">이사일</label>
          <p class="control">
             <datepicker placeholder="이사일 입력" :config="{ dateFormat: 'Y-m-d', static: true }"></datepicker>
          </p>
          <label class="label">예산</label>
          <p class="control">
            <input class="input" type="text" v-model="data.pc_budget"/>
          </p>
          <label class="label">메모</label>
          <p class="control">
            <textarea class="textarea" v-model="data.pc_memo"></textarea>
          </p>
          <p class="control">
            <button class="button is-link" @click="backPage">취소</button>
            <button class="button is-primary" @click="registerContract">등록</button>
          </p>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import router from '../../router'
  import { required } from 'vuelidate/lib/validators'
  import Datepicker from 'vue-bulma-datepicker'

  const NotificationComponent = Vue.extend(Notification)

  const queryApi = '/api/contract'

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
    name: 'register',
    components: {
      Datepicker
    },
    data () {
      return {
        data: {
          pc_name: '',
          pc_phone: ''
        }
      }
    },
    validations: {
      data: {
        pc_name: {
          required
        },
        pc_phone: {
          required
        }
      }
    },
    methods: {
      registerContract () {
        this.$http.post(`${queryApi}`, this.data)
          .then((data) => {
            openNotification({
              message: '등록되었습니다.',
              type: 'success',
              duration: 1500
            })
            router.back()
          })
          .catch((error) => {
            console.log(error)
          })
      },
      backPage () {
        router.back()
      }
    }
  }
</script>

<style scoped>

</style>
