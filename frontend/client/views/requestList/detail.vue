<template xmlns="http://www.w3.org/1999/html">
  <div class="request-detail">
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(tabType.info)" :class="{'is-active': currentTab === tabType.info}"><a>정보</a></li>
        <li @click="activeView(tabType.preEstimateView)" :class="{'is-active': currentTab === tabType.preEstimateView}"><a>가견적서</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <!--상담정보 탭-->
        <article class="tile is-child box" v-show="currentTab === tabType.info">
          <div class="block">
            <label class="label">상담 진행상태</label>
            <div class="select is-fullwidth">
              <select v-model="data.status" @change="changeProcessStatus">
                <option v-for="status in requestStatusConfig.statusList" :value="status.value">{{status.text}}</option>
              </select>
            </div>
            <label class="label" v-if="parseInt(data.status) === -1">상담 실패사유</label>
            <div class="select is-fullwidth" v-if="data.status === -1">
              <select v-model="data.fail_code" @change="changeProcessStatus">
                <option value="" selected="selected">선택</option>
                <option v-for="counselFailCode in requestStatusConfig.counselFailCodeList" :value="counselFailCode.value">{{counselFailCode.text}}</option>
              </select>
            </div>
            <label class="label" v-if="parseInt(data.status) === -2">계약 실패사유</label>
            <div class="select is-fullwidth" v-if="data.status === -2">
              <select v-model="data.fail_code" @change="changeProcessStatus">
                <option value="" selected="selected">선택</option>
                <option v-for="contractFailCode in requestStatusConfig.contractFailCodeList" :value="contractFailCode.value">{{contractFailCode.text}}</option>
              </select>
            </div>
            <p class="control" v-if="parseInt(data.fail_code) === 999">
              <textarea class="textarea" v-model="data.fail_reason" placeholder="기타 사유를 입력해주세요."></textarea>
            </p>
            <label class="label">신청일자</label>
            <p class="control">
              {{ (data.reg_dt === '0000-00-00' || !data.reg_dt) ? '' : moment(data.reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') }}
            </p>
            <label class="label">이름</label>
            <p class="control">
              {{ data.customer_name }}
            </p>
            <label class="label">연락처</label>
            <p class="control">
              <cleave class="input" type="tel" placeholder="Enter phone number" :options="{ phone: true, phoneRegionCode: 'kr'}" v-model="data.customer_phone_no">

              </cleave>
            </p>
            <label class="label">담당자</label>
            <div class="select is-fullwidth">
              <select v-model="data.counselor">
                <option value="" selected="selected">선택</option>
                <option v-for="manager in managerList" :value="manager.user_pk">{{manager.user_name}}</option>
              </select>
            </div>
            <label class="label">별칭</label>
            <p class="control">
              <input type="text" class="input" v-model="data.customer_nickname" />
            </p>
            <label class="label">현장 구분</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="data.site_type">
                  <option value="">선택</option>
                  <option v-for="siteType in requestStatusConfig.siteTypeList" :value="siteType.value">{{siteType.text}}</option>
                </select>
              </div>
            </div>
            <label class="label">평수</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="data.space_size">
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
                <select v-model="data.budget">
                  <option value=''>선택</option>
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
              <input class="input" type="text" v-model="data.address" />
              <label>상세주소</label>
              <input class="input" type="text" v-model="data.address_detail" />
            </p>
            <label class="label">원하시는 입주날짜</label>
            <p class="control">
              <datepicker v-model="data.moving_date" />
            </p>
            <label class="label">방문 상담일</label>
            <p class="control">
              <datepicker v-model="data.visit_date" />
            </p>
            <label class="label">방문 시간</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="data.visit_time">
                  <option value="">없음</option>
                  <option value="09:00 - 11:00">09:00 - 11:00</option>
                  <option value="11:00 - 13:00">11:00 - 13:00</option>
                  <option value="13:00 - 15:00">13:00 - 15:00</option>
                  <option value="15:00 - 17:00">15:00 - 17:00</option>
                  <option value="17:00 - 19:00">17:00 - 19:00</option>
                </select>
              </div>
            </div>
            <label class="label">고객 요청사항</label>
            <div class="control">
              <div class="is-fullwidth">
                <textarea class="textarea" name="memo" v-model="data.customer_requests"></textarea>
              </div>
            </div>
            <label class="label">메모</label>
            <div class="control">
              <div class="is-fullwidth">
                <textarea class="textarea" name="memo" v-model="data.memo"></textarea>
              </div>
            </div>
            <p class="control">
              <button class="button is-primary" v-on:click="submitData">수정</button>
            </p>
          </div>
        </article>
        <!-- 가견적서 탭 -->
        <article class="tile is-child box" v-show = "currentTab === tabType.preEstimateView">
          <estimate-sheet :estimateIsPre="true"/>
        </article>
      </div>
    </div>
    <add-bills-schedule-modal
      :id="id" />
  </div>
</template>

<script>
  import Datepicker from 'vue-bulma-datepicker'
  import moment from 'moment'
  import Cleave from 'vue-cleave'
  import 'cleave.js/dist/addons/cleave-phone.kr.js'
  import requestStatusConfig from '../../config/request-status-config'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import EventBus from '../../services/eventBus'
  import estimateSheet from '../estimate/estimateSheet'
  import AddBillsScheduleModal from '../estimate/addBillsScheduleModal'

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

  const queryApi = '/api/estimate'
  const usersQueryApi = '/api/user'

  export default {
    name: 'detail',
    components: {
      Datepicker,
      Cleave,
      estimateSheet,
      AddBillsScheduleModal
    },
    data () {
      return {
        data: {
          customer_phone_no: '',
          site_type: '',
          fail_code: '',
          fail_reason: '',
          visit_time: '',
          space_size: '',
          budget: ''
        },
        id: '',
        hasStatusChildren: false,
        failStatusList: [],
        managerList: [],
        requestStatusConfig,
        moment,
        tabType: {
          info: 'info',
          preEstimateView: 'preEstimateView'
        },
        currentTab: ''
      }
    },
    mounted () {
      this.currentTab = this.tabType.info
      this.id = this.$route.params.id
      if (!this.id) {
        this.$router.back()
      }
      this.loadDetail(this.id)
      EventBus.$on('openAddBillsScheduleModal', this.openAddBillsScheduleModal)
    },
    methods: {
      activeView (type) {
        this.currentTab = type
        switch (type) {
          case this.tabType.info:
            this.loadDetail(this.id)
            break
          case this.tabType.preEstimateView:
            // 하위 컴포넌트에 이벤트 전달
            EventBus.$emit('loadPreEstimateView')
            break
        }
      },
      loadDetail (id) {
        this.$http.get(`${queryApi}/${id}`)
        .then((response) => {
          if (response.data.code !== 200) {
            return
          }
          this.data = response.data.data.estimate
          Vue.set(this.data, 'customer_phone_no', this.data.customer_phone_no)
          return this.$http.get(usersQueryApi)
        })
        .then(response => {
          this.managerList = response.data.data.users
        })
        .catch((error) => {
          console.error(error)
        })
      },
      validate () {
        if (this.data.customer_name === '') {
          openNotification({
            message: '이름을 입력해 주십시오.',
            type: 'danger',
            duration: 2500
          })
          return false
        } else if (this.data.customer_phone_no === '') {
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
          this.data.customer_phone_no = this.data.customer_phone_no.replace(/\s/gi, '')
          this.$http.put(`${queryApi}/${this.id}`, this.data)
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }
              openNotification({
                message: '견적상담 수정이 완료되었습니다.',
                type: 'success',
                duration: 2500
              })
              // this.$router.back()
              window.scrollTo(0, 0)
            }).catch((error) => {
              console.error(error)
            })
        }
      },
      changeProcessStatus () {
        if (this.data.status >= 0) {
          this.data.fail_code = ''
          this.data.fail_reason = ''
        }

        if (this.data.fail_code !== 999) {
          this.data.fail_reason = ''
        }
      },
      openAddBillsScheduleModal () {
        this.$modal.show('addBillsScheduleModal')
      }
    }
  }
</script>

<style scoped>

</style>
