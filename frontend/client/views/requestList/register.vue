<template xmlns="http://www.w3.org/1999/html">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <div class="block">
          <label class="label">상담 진행상태</label>
          <div class="select is-fullwidth">
            <select v-model="data.rq_process_status" v-on:change="changeProcessStatus">
              <option v-for="status in requestStatusConfig.statusList">{{status.label}}</option>
            </select>
          </div>
          <label class="label" v-if="hasStatusChildren">상담 실패사유</label>
          <div class="select is-fullwidth" v-if="hasStatusChildren">
            <select v-model="data.rq_fail_reason">
              <option value="" selected="selected">선택</option>
              <option v-for="failStatus in failStatusList" :value="failStatus.label">{{failStatus.label}}</option>
            </select>
          </div>
          <label class="label" for="rqName">이름</label>
          <p class="control">
            <input class="input" type="text" v-model="data.rq_name" id="rqName"/>
          </p>
          <label class="label">연락처</label>
          <p class="control">
            <cleave class="input" type="tel" placeholder="Enter phone number" :options="{ phone: true, phoneRegionCode: 'kr' }" v-model="data.rq_phone">

            </cleave>
          </p>
          <label class="label" for="rqNickname">별칭</label>
          <p class="control">
            <input class="input" type="text" v-model="data.rq_nickname" id="rqNickname"/>
          </p>
          <label class="label" for="rqManager">담당자</label>
          <div class="select is-fullwidth">
            <select v-model="data.rq_manager">
              <option value="" selected="selected">선택</option>
              <option v-for="manager in managerList" :value="manager.user_pk">{{manager.user_name}}</option>
            </select>
          </div>
          <label class="label">현장 구분</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_site_type">
                <option value="">선택</option>
                <option v-for="siteType in requestStatusConfig.siteTypeList" :value="siteType.label">{{siteType.label}}</option>
              </select>
            </div>
          </div>
          <label class="label">평수</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_size">
                <option value="">평수 선택</option>
                <option value="lt20">20평대 미만</option>
                <option value="eq20">20평대</option>
                <option value="eq30">30평대</option>
                <option value="eq40">40평대</option>
                <option value="eq50">50평대</option>
                <option value="eq60">60평대</option>
                <option value="gte70">70평대 이상</option>
              </select>
            </div>
          </div>
          <label class="label">예산</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_budget">
                <option value=''>예산 선택안함</option>
                <option value='1500~2000'>1500~2000만원</option>
                <option value='2000~2500'>2000~2500만원</option>
                <option value='2500~3000'>2500~3000만원</option>
                <option value='3000~3500'>3000~3500만원</option>
                <option value='3500~4000'>3500~4000만원</option>
                <option value='4000~4500'>4000~4500만원</option>
                <option value='4500~5000'>4500~5000만원</option>
                <option value='5000~5500'>5000~5500만원</option>
                <option value='5500~6000'>5500~6000만원</option>
                <option value='6000~6500'>6000~6500만원</option>
                <option value='6500~7000'>6500~7000만원</option>
                <option value='lt1500'>1500만원 미만</option>
                <option value='lt2000'>2000만원 미만</option>
                <option value='lt2500'>2500만원 미만</option>
                <option value='lt3000'>3000만원 미만</option>
                <option value='lt3500'>3500만원 미만</option>
                <option value='lt4000'>4000만원 미만</option>
                <option value='lt4500'>4500만원 미만</option>
                <option value='lt5000'>5000만원 미만</option>
                <option value='gte2500'>2500만원 이상</option>
                <option value='gte3000'>3000만원 이상</option>
                <option value='gte3500'>3500만원 이상</option>
                <option value='gte4000'>4000만원 이상</option>
                <option value='gte4500'>4500만원 이상</option>
                <option value='gte5000'>5000만원 이상</option>
                <option value='gte6000'>6000만원 이상</option>
                <option value='gte7000'>7000만원 이상</option>
                <option value='contact'>협의로 결정</option>
              </select>
            </div>
          </div>
          <label class="label">주소</label>
          <p class="control">
            <label>기본주소</label>
            <input class="input" type="text" v-model="data.rq_address_brief" />
            <label>상세주소</label>
            <input class="input" type="text" v-model="data.rq_address_detail" />
          </p>
          <label class="label">원하시는 입주날짜</label>
          <p class="control">
            <datepicker v-model="data.rq_move_date" />
          </p>
          <label class="label">방문 상담일</label>
          <p class="control">
            <datepicker v-model="data.rq_date" />
          </p>
          <label class="label">방문 시간</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_time">
                <option value="">없음</option>
                <option value="09:00 - 11:00">09:00 - 11:00</option>
                <option value="11:00 - 13:00">11:00 - 13:00</option>
                <option value="13:00 - 15:00">13:00 - 15:00</option>
                <option value="15:00 - 17:00">15:00 - 17:00</option>
                <option value="17:00 - 19:00">17:00 - 19:00</option>
              </select>
            </div>
          </div>
          <label class="label">공사종류</label>
          <div class="control">
            <div class="is-fullwidth">
              <textarea class="textarea" name="request_memo" v-model="data.rq_construction_type"></textarea>
            </div>
          </div>
          <label class="label">상담결과</label>
          <div class="control">
            <div class="is-fullwidth">
              <textarea class="textarea" name="request_memo" v-model="data.rq_consulting_result"></textarea>
            </div>
          </div>
          <label class="label">공사내용</label>
          <div class="control">
            <div class="is-fullwidth">
              <textarea class="textarea" name="request_memo" v-model="data.rq_memo"></textarea>
            </div>
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
  import 'cleave.js/dist/addons/cleave-phone.kr.js'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import requestStatusConfig from '../../config/request-status-config'
  import _ from 'underscore'

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

  // const queryApi = '/api/request'
  const submitApi = '/api/request'
  const userQueryApi = '/api/user'

  export default {
    name: 'regist',
    components: {
      Datepicker,
      Cleave,
      Notification
    },
    data () {
      return {
        data: {
          rq_is_valuable: '',
          rq_is_contracted: '',
          rq_name: '',
          rq_manager: '',
          rq_size: '',
          rq_budget: '',
          rq_address_brief: '',
          rq_address_detail: '',
          rq_move_date: '',
          rq_date: '',
          rq_time: '',
          rq_memo: '',
          rq_phone: '',
          rq_fail_reason: '',
          rq_process_status: '신규신청',
          rq_site_type: ''
        },
        hasStatusChildren: false,
        failStatusList: [],
        managerList: [],
        requestStatusConfig,
        id: '',
        moment
      }
    },
    mounted () {
      this.loadManager()
    },
    methods: {
      loadManager () {
        this.$http.get(userQueryApi)
          .then(response => {
            this.managerList = response.data.data.users
          })
          .catch(error => {
            console.error(error)
          })
      },
      validate () {
        if (this.data.rq_name === '') {
          openNotification({
            message: '이름을 입력해 주십시오.',
            type: 'danger',
            duration: 2500
          })
          return false
        } else if (this.data.rq_phone === '') {
          openNotification({
            message: '전화번호를 입력해 주십시오.',
            type: 'danger',
            duration: 2500
          })
          return false
        }

        return true
      },
      submitData () {
        if (this.validate()) {
          this.data.rq_phone = this.data.rq_phone.replace(/\s/gi, '')

          console.log(`${submitApi}/${this.id}`)
          this.$http.post(`${submitApi}`, this.data)
            .then((response) => {
              console.log(response)
              if (response.data.code !== 200) {
                return false
              }

              this.openModalCard()
            }).catch((error) => {
              console.log(error)
            })
        }
      },
      changeProcessStatus () {
        const selectedData = _.find(this.requestStatusConfig.statusList, (item) => {
          return item.label === this.data.rq_process_status
        })
        this.data.rq_fail_reason = ''
        if (selectedData.hasOwnProperty('children')) {
          this.failStatusList = selectedData.children
          this.hasStatusChildren = true
        } else {
          this.failStatusList = []
          this.hasStatusChildren = false
        }
        this.$forceUpdate()
      },
      openModalCard () {
        openNotification({
          message: '상담신청 등록이 완료되었습니다.',
          type: 'success',
          duration: 2500
        })
        this.$router.back()
      }
    }
  }
</script>

<style scoped>

</style>
