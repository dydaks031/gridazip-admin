<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <div class="block">
          <label class="label">고객명</label>
          <div class="control">
            <input class="input" type="text" v-model="data.customer_name" :class="{'is-danger': $v.data.customer_name.$invalid }" />
            <p class="help is-danger" v-if="!$v.data.customer_name.required">고객명을 입력해 주십시오.</p>
          </div>
          <label class="label">연락처</label>
          <div class="control">
            <input class="input" type="text" v-model="data.customer_phone_no" :class="{'is-danger': $v.data.customer_phone_no.$invalid }" />
            <p class="help is-danger" v-if="!$v.data.customer_phone_no.required">전화번호를 입력해 주십시오.</p>
          </div>
          <label class="label">현장감독</label>
          <div class="select is-fullwidth">
            <select v-model="data.supervisor" id="pcSupervisor">
              <option value="" selected="selected">선택</option>
              <option v-for="supervisor in supervisorList" :value="supervisor.user_pk">{{supervisor.user_name}}</option>
            </select>
          </div>
          <label class="label">평수</label>
          <p class="control">
            <input class="input" type="text" v-model="data.space_size" />
          </p>
          <label class="label">주소</label>
          <p class="control">
            <input class="input" type="text" v-model="data.address" />
          </p>
          <label class="label">상세 주소</label>
          <p class="control">
            <input class="input" type="text" v-model="data.address_detail" />
          </p>
          <label class="label">공사시작일</label>
          <p class="control">
            <datepicker placeholder="이사일 입력" :config="{ dateFormat: 'Y-m-d', static: true }" v-model="data.construction_start_date"></datepicker>
          </p>
          <label class="label">이사일</label>
          <p class="control">
             <datepicker placeholder="이사일 입력" :config="{ dateFormat: 'Y-m-d', static: true }" v-model="data.moving_date"></datepicker>
          </p>
          <label class="label">예산</label>
          <p class="control">
            <input class="input" type="text" v-model="data.budget"/>
          </p>
          <label class="label">메모</label>
          <p class="control">
            <textarea class="textarea" v-model="data.memo"></textarea>
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

  const queryApi = '/api/estimate'
  const userQueryApi = '/api/user'

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
          customer_name: '',
          customer_phone_no: '',
          supervisor: ''
        },
        supervisorList: []
      }
    },
    validations: {
      data: {
        customer_name: {
          required
        },
        customer_phone_no: {
          required
        }
      }
    },
    mounted () {
      this.loadSupervisor()
    },
    methods: {
      loadSupervisor () {
        this.$http.get(userQueryApi)
          .then(response => {
            if (response.data.code !== 200) {
              return false
            }
            this.supervisorList = response.data.data.users
          })
      },
      registerContract () {
        this.$http.post(`${queryApi}`, this.data)
          .then((response) => {
            if (response.data.code !== 200) {
              openNotification({
                message: '계약 등록에 실패하였습니다. 관리자에게 문의 바랍니다.',
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
            router.back()
          })
          .catch((error) => {
            console.error(error)
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
